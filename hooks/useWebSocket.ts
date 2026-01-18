'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TasksData, WSMessage, TaskStatus } from '@/lib/types'

const WS_URL = 'ws://localhost:3051'
const RECONNECT_DELAY = 3000
const PING_INTERVAL = 30000

export function useWebSocket() {
  const [data, setData] = useState<TasksData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)

        // Пинг для keep-alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, PING_INTERVAL)
      }

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)

          if (message.type === 'init' || message.type === 'update') {
            if (message.data) {
              setData(message.data)
              setLastUpdate(new Date(message.timestamp))
            }
          }
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        cleanup()

        // Автореконнект
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Reconnecting...')
          connect()
        }, RECONNECT_DELAY)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY)
    }
  }, [])

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
  }, [])

  // Отправка сообщения на сервер
  const send = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    console.warn('WebSocket not connected, cannot send message')
    return false
  }, [])

  // Перемещение задачи
  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    return send({
      type: 'move',
      taskId,
      newStatus,
    })
  }, [send])

  useEffect(() => {
    connect()

    return () => {
      cleanup()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect, cleanup])

  return { data, isConnected, lastUpdate, send, moveTask }
}
