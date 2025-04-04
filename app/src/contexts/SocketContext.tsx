import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:8000", {
        auth: {
          userId: user.id,
          email: user.email,
        },
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => {
  const socket = useContext(SocketContext);
  if (socket) {
    return socket;
  }
  return null;
};
