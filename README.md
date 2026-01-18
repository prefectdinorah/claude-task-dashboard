# Claude Task Dashboard

Real-time Kanban dashboard for monitoring Claude Code tasks.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Task+Dashboard+Preview)

## Features

- **Real-time sync** — WebSocket connection for instant updates
- **Kanban board** — Three columns: To Do, In Progress, Done
- **Drag & Drop** — Move tasks between columns with persistence
- **Search** — Filter tasks by text
- **Tags** — Filter by tags
- **Dark theme** — Linear-inspired design

## Installation

```bash
npm install -g claude-task-dashboard
```

## Usage

### Quick Start

```bash
# In your project directory
claude-tasks
```

This will:
1. Create `tasks.json` if it doesn't exist
2. Start WebSocket server on port 3051
3. Start dashboard on http://localhost:3050

### With npx (no install)

```bash
npx claude-task-dashboard
```

## How it works

The dashboard watches `tasks.json` in your current directory:

```json
{
  "project": "My Project",
  "lastUpdated": "2025-01-17T12:00:00.000Z",
  "tasks": [
    {
      "id": "task-001",
      "content": "Implement feature X",
      "status": "in_progress",
      "activeForm": "Working on feature X",
      "createdAt": "2025-01-17T10:00:00.000Z",
      "updatedAt": "2025-01-17T12:00:00.000Z",
      "tags": ["frontend"]
    }
  ]
}
```

### Task statuses

| Status | Column |
|--------|--------|
| `pending` | To Do |
| `in_progress` | In Progress |
| `completed` | Done |

## Integration with Claude Code

Claude Code's `TodoWrite` tool can update `tasks.json` automatically. The dashboard will reflect changes in real-time.

## Ports

| Service | Port |
|---------|------|
| Dashboard | 3050 |
| WebSocket | 3051 |

## Development

```bash
git clone https://github.com/USERNAME/claude-task-dashboard
cd claude-task-dashboard
npm install
npm run dev
```

## License

MIT
