import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  EXPO_PUBLIC_APP_B_URL,
  EXPO_PUBLIC_ENABLE_SOCKETS,
  FACTURACION_WEBHOOK_EVENT,
} from '../config';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!EXPO_PUBLIC_ENABLE_SOCKETS || !EXPO_PUBLIC_APP_B_URL) return;

    const instance = io(EXPO_PUBLIC_APP_B_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    instance.on('connect', onConnect);
    instance.on('disconnect', onDisconnect);
    setSocket(instance);

    return () => {
      instance.off('connect', onConnect);
      instance.off('disconnect', onDisconnect);
      instance.removeAllListeners();
      instance.close();
      setSocket(null);
      setConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): Socket | null {
  return useContext(SocketContext).socket;
}

export function useFacturacionRefresh(onRefresh: () => void) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = () => onRefresh();
    socket.on(FACTURACION_WEBHOOK_EVENT, handler);
    return () => {
      socket.off(FACTURACION_WEBHOOK_EVENT, handler);
    };
  }, [socket, onRefresh]);
}

export { FACTURACION_WEBHOOK_EVENT };
