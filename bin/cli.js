#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const packageDir = path.join(__dirname, '..');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

console.log(`
${colors.magenta}╔═══════════════════════════════════════════╗
║         Claude Task Dashboard              ║
╠═══════════════════════════════════════════╣
║  Dashboard: http://localhost:3050          ║
║  WebSocket: ws://localhost:3051            ║
╚═══════════════════════════════════════════╝${colors.reset}
`);

// Проверяем наличие tasks.json в текущей директории
const tasksFile = path.join(process.cwd(), 'tasks.json');
if (!fs.existsSync(tasksFile)) {
  const initialData = {
    project: 'My Project',
    lastUpdated: new Date().toISOString(),
    tasks: [],
  };
  fs.writeFileSync(tasksFile, JSON.stringify(initialData, null, 2));
  console.log(`${colors.green}✓ Created tasks.json in current directory${colors.reset}\n`);
}

// Запускаем сервер
const serverProcess = spawn('node', [path.join(packageDir, 'dist', 'server', 'index.js')], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: { ...process.env, TASKS_FILE: tasksFile },
});

// Запускаем Next.js
const nextProcess = spawn('node', [path.join(packageDir, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', '3050'], {
  cwd: packageDir,
  stdio: 'inherit',
});

// Обработка завершения
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
  serverProcess.kill();
  nextProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill();
  nextProcess.kill();
  process.exit(0);
});
