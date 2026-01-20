import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const MoveTaskSchema = z.object({
  newStatus: z.enum(['pending', 'in_progress', 'completed']),
  projectId: z.string().uuid(),
})

export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { newStatus, projectId } = MoveTaskSchema.parse(body)

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.taskId)
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      task: data,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Move task error:', error)
    return NextResponse.json(
      { error: 'Failed to move task' },
      { status: 500 }
    )
  }
}
