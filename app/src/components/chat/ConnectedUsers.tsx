import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { compareDesc, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  isConnected: boolean;
  lastConnection?: string;
  lastDisconnection?: string;
}

interface ConnectedUsersProps {
  socket: Socket;
}

const ConnectedUsers: React.FC<ConnectedUsersProps> = ({ socket }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const handleConnectedUsers = (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    };

    socket.on("connectedUsers", handleConnectedUsers);
    socket.emit("getConnectedUsers");

    return () => {
      socket.off("connectedUsers", handleConnectedUsers);
    };
  }, [socket]);

  const connected = users.filter((u) => u.isConnected);

  // Trie les utilisateurs connectés par date de dernière connexion
  const disconnected = users
    .filter((u) => !u.isConnected)
    .sort((a, b) =>
      compareDesc(
        a.lastDisconnection ? new Date(a.lastDisconnection) : new Date(0),
        b.lastDisconnection ? new Date(b.lastDisconnection) : new Date(0)
      )
    );

  const getConnectedTime = (user: User) => {
    if (!user.lastConnection) return "Depuis un moment";
    const elapsed = formatDistanceToNow(new Date(user.lastConnection), {
      addSuffix: false,
      locale: fr,
    });
    return `Depuis ${elapsed}`;
  };

  const getDisconnectedTime = (user: User) => {
    if (!user.lastDisconnection) return "Il y a un moment";
    const elapsed = formatDistanceToNow(new Date(user.lastDisconnection), {
      addSuffix: false,
      locale: fr,
    });
    return `Il y a ${elapsed}`;
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold">Chat générale</h2>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 focus:outline-none cursor-pointer">
            <PanelRight size={24} />
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-80 p-4">
          <div className="space-y-4">
            <SheetClose className="self-end text-sm text-gray-500 cursor-pointer" />

            <div>
              <p className="text-sm font-semibold">
                En ligne — {connected.length}
              </p>
              <div className="flex flex-col mt-2 space-y-2">
                {connected.length > 0 ? (
                  connected.map((user) => {
                    const timeConnected = getConnectedTime(user);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      >
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="relative">
                              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user.email[0]?.toUpperCase() || "U"}
                              </div>
                              <div className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full bg-green-500 border-2 border-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-sm">{user.email}</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex flex-col">
                          <p>{user.email}</p>
                          <span className="text-[10px] text-gray-600">
                            {timeConnected}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">
                    Aucun utilisateur connecté
                  </p>
                )}
              </div>
            </div>

            {/* Section des utilisateurs déconnectés */}
            <div>
              <p className="text-sm font-semibold">
                Hors ligne — {disconnected.length}
              </p>
              <div className="flex flex-col mt-2 space-y-2">
                {disconnected.length > 0 ? (
                  disconnected.map((user) => {
                    const timeDisconnected = getDisconnectedTime(user);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      >
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="relative">
                              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user.email[0]?.toUpperCase() || "U"}
                              </div>
                              <div className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full bg-gray-500 border-2 border-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-sm">{user.email}</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex flex-col">
                          <p>{user.email}</p>
                          <span className="text-[10px] text-gray-600">
                            {timeDisconnected}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">
                    Aucun utilisateur déconnecté
                  </p>
                )}
              </div>
            </div>
          </div>
          <SheetTitle></SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ConnectedUsers;
