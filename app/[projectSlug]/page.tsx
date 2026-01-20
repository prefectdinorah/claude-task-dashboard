import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string }
}) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('name, description')
    .eq('slug', params.projectSlug)
    .single()

  if (!project) {
    return { title: 'Project not found' }
  }

  return {
    title: `${project.name} | Task Dashboard`,
    description: project.description || `Real-time task dashboard for ${project.name}`,
  }
}

export default async function ProjectPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  const supabase = await createClient()

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.projectSlug)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Get tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', project.id)
    .order('position', { ascending: true })

  return (
    <DashboardClient
      project={project}
      initialTasks={tasks || []}
    />
  )
}
