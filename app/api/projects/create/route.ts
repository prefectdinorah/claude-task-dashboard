import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const CreateProjectSchema = z.object({
  name: z.string().min(3, 'Minimum 3 characters').max(100),
  description: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const validated = CreateProjectSchema.parse(body)

    // Generate unique slug: project-name-abc123xyz
    const slug = `${validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${nanoid(8)}`

    const { data, error } = await supabase
      .from('projects')
      .insert({
        slug,
        name: validated.name,
        description: validated.description,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      project: data,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${data.slug}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
