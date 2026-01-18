import { WebSocketServer, WebSocket } from 'ws'
import * as chokidar from 'chokidar'
import * as fs from 'fs'
import * as path from 'path'

const PORT = parseInt(process.env.WS_PORT || '3051', 10)
const TASKS_FILE = process.env.TASKS_FILE || path.join(process.cwd(), 'tasks.json')

interface Task {
  id: string
  content: string
  status: 'pending' | 'in_progress' | 'completed'
  activeForm: string
  createdAt: string
  updatedAt: string
  project?: string
  tags?: string[]
}

interface TasksData {
  project: string
  lastUpdated: string
  tasks: Task[]
}

interface WSMessage {
  type: 'ping' | 'move'
  taskId?: string
  newStatus?: Task['status']
}

// Флаг для игнорирования собственных записей
let ignoreNextChange = false

// Инициализация tasks.json если не существует
function initTasksFile() {
  if (!fs.existsSync(TASKS_FILE)) {
    const initialData: TasksData = {
      project: 'Claude Code Tasks',
      lastUpdated: new Date().toISOString(),
      tasks: [],
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(initialData, null, 2))
    console.log('Created tasks.json')
  }
}

// Чтение tasks.json
function readTasks(): TasksData | null {
  try {
    const content = fs.readFileSync(TASKS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading tasks.json:', error)
    return null
  }
}

// Запись tasks.json
function writeTasks(data: TasksData): boolean {
  try {
    ignoreNextChange = true
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2))
    console.log('Updated tasks.json')
    return true
  } catch (error) {
    console.error('Error writing tasks.json:', error)
    return false
  }
}

// Обновление статуса задачи
function moveTask(taskId: string, newStatus: Task['status']): TasksData | null {
  const data = readTasks()
  if (!data) return null

  const task = data.tasks.find((t) => t.id === taskId)
  if (!task) {
    console.log(`Task ${taskId} not found`)
    return null
  }

  task.status = newStatus
  task.updatedAt = new Date().toISOString()
  data.lastUpdated = new Date().toISOString()

  if (writeTasks(data)) {
    return data
  }
  return null
}

// WebSocket сервер
const wss = new WebSocketServer({ port: PORT })

const clients = new Set<WebSocket>()

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected')
  clients.add(ws)

  // Отправить текущее состояние при подключении
  const tasks = readTasks()
  if (tasks) {
    ws.send(JSON.stringify({
      type: 'init',
      data: tasks,
      timestamp: new Date().toISOString(),
    }))
  }

  // Обработка сообщений от клиента
  ws.on('message', (message: Buffer) => {
    try {
      const parsed: WSMessage = JSON.parse(message.toString())

      switch (parsed.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }))
          break

        case 'move':
          if (parsed.taskId && parsed.newStatus) {
            console.log(`Moving task ${parsed.taskId} to ${parsed.newStatus}`)
            const updatedData = moveTask(parsed.taskId, parsed.newStatus)
            if (updatedData) {
              // Broadcast обновление всем клиентам
              broadcast(updatedData)
            }
          }
          break
      }
    } catch {
      // Ignore invalid messages
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
    clients.delete(ws)
  })

  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error)
    clients.delete(ws)
  })
})

// Broadcast обновления всем клиентам
function broadcast(data: TasksData) {
  const message = JSON.stringify({
    type: 'update',
    data,
    timestamp: new Date().toISOString(),
  })

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

// Инициализация
initTasksFile()

// File watcher
const watcher = chokidar.watch(TASKS_FILE, {
  persistent: true,
  ignoreInitial: true,
})

watcher.on('change', () => {
  // Игнорируем изменения от собственной записи
  if (ignoreNextChange) {
    ignoreNextChange = false
    return
  }

  console.log('tasks.json changed externally, broadcasting...')
  const tasks = readTasks()
  if (tasks) {
    broadcast(tasks)
  }
})

console.log(`
╔═══════════════════════════════════════════╗
║       Task Dashboard WebSocket Server      ║
╠═══════════════════════════════════════════╣
║  WebSocket: ws://localhost:${PORT}            ║
║  Tasks file: ${path.basename(TASKS_FILE)}                    ║
║                                           ║
║  Supported messages:                      ║
║  • ping → pong                            ║
║  • move { taskId, newStatus }             ║
║                                           ║
║  Waiting for connections...               ║
╚═══════════════════════════════════════════╝
`)
