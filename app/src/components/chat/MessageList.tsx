import React, { useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";
import { Socket } from "socket.io-client";

interface MessageListProps {
  socket: Socket;
}

const MessageList: React.FC<MessageListProps> = ({ socket }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: messageService.findAll,
  });

  const likeMutation = useMutation<Message, Error, string>({
    mutationFn: (messageId: string) => messageService.likeMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      socket.emit("likeMessageFromFront");
    },
  });

  // Fonction de rafraîchissement des messages (sans le scroll)

  useEffect(() => {
    const refreshMessages = () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    };

    const handleNewMessage = () => refreshMessages();
    const handleNewLike = () => refreshMessages();

    socket.on("sendMessageFromBack", handleNewMessage);
    socket.on("likeMessageFromBack", handleNewLike);

    return () => {
      socket.off("sendMessageFromBack", handleNewMessage);
      socket.off("likeMessageFromBack", handleNewLike);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (isLoading) return <div className="text-center">Loading messages...</div>;
  if (error)
    return (
      <div className="text-center text-red-600">
        Error loading messages. Please try again.
      </div>
    );

  return (
    <div className="space-y-4">
      {messages?.map((message) => {
        const likedByMe = message.likedBy.some((u) => u.id === user?.id);
        return (
          <div
            key={message.id}
            className="rounded-lg bg-white p-4 shadow-sm flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              {message.user.email[0]?.toUpperCase() || "U"}
            </div>
            <div className="w-full">
              <p className="text-gray-800 mb-2">{message.text}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{message.user.email}</p>
                  <p>
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => likeMutation.mutate(message.id)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedByMe ? "text-red-500" : "text-gray-500"
                    }`}
                  />
                  <span>{message.likedBy.length}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
