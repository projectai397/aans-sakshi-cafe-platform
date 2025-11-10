import { useEffect, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

interface UseSocketOptions {
  url?: string
  autoConnect?: boolean
  reconnection?: boolean
}

export function useSocket(cafeId: string, options: UseSocketOptions = {}) {
  const {
    url = import.meta.env.VITE_API_URL || 'http://localhost:3000',
    autoConnect = true,
    reconnection = true,
  } = options

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!autoConnect) {
      setIsLoading(false)
      return
    }

    const newSocket = io(url, {
      reconnection,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
      setIsLoading(false)
      newSocket.emit('join-cafe', cafeId)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [cafeId, url, autoConnect, reconnection])

  const emit = useCallback(
    (event: string, data?: any) => {
      if (socket && isConnected) {
        socket.emit(event, data)
      }
    },
    [socket, isConnected]
  )

  const on = useCallback(
    (event: string, callback: (data: any) => void) => {
      if (socket) {
        socket.on(event, callback)
      }
    },
    [socket]
  )

  const off = useCallback(
    (event: string) => {
      if (socket) {
        socket.off(event)
      }
    },
    [socket]
  )

  return {
    socket,
    isConnected,
    isLoading,
    emit,
    on,
    off,
  }
}
