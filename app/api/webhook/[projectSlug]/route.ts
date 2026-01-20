import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const TaskSchema = z.object({
  id: z.string(),
  content: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  activeForm: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string()).optional(),
})

const WebhookPayloadSchema = z.object({
  project: z.string(),
  lastUpdated: z.string().datetime(),
  tasks: z.array(TaskSchema),
})

export async function POST(
  request: Request,
  { params }: { params: { projectSlug: string } }
) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const validated = WebhookPayloadSchema.parse(body)

    // Find project by slug
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', params.projectSlug)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Update last_sync_at
    await supabase
      .from('projects')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', project.id)

    // Get existing tasks to determine deletions
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('project_id', project.id)

    const existingIds = new Set(existingTasks?.map(t => t.id) || [])
    const incomingIds = new Set(validated.tasks.map(t => t.id))
    const toDelete = [...existingIds].filter(id => !incomingIds.has(id))

    // Delete old tasks
    if (toDelete.length > 0) {
      await supabase
        .from('tasks')
        .delete()
        .eq('project_id', project.id)
        .in('id', toDelete)
    }

    // Upsert tasks
    const tasksToUpsert = validated.tasks.map((task, index) => ({
      id: task.id,
      project_id: project.id,
      content: task.content,
      status: task.status,
      active_form: task.activeForm,
      tags: task.tags || [],
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      position: index,
    }))

    const { error: upsertError } = await supabase
      .from('tasks')
      .upsert(tasksToUpsert, {
        onConflict: 'id,project_id',
      })

    if (upsertError) throw upsertError

    return NextResponse.json({
      success: true,
      synced: validated.tasks.length,
      deleted: toDelete.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
