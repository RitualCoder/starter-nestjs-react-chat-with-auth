import { useAuth } from "@/contexts/AuthContext";
import MessageForm from "../components/chat/MessageForm";
import MessageList from "../components/chat/MessageList";
import UserInfo from "../components/chat/UserInfo";
import LogoutButton from "../components/LogoutButton";
import { useSocket } from "@/contexts/SocketContext";
import ConnectedUsers from "@/components/chat/ConnectedUsers";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">
          Please sign in to access the chat.
        </h2>
        <Button
          onClick={() => navigate("/signin")}
          className="px-6 py-2 cursor-pointer"
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-gray-700">Loading chat...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-screen p-4 flex flex-col">
      <div className="flex-1 rounded-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <ConnectedUsers socket={socket} />
        </div>
        <div className="flex-1 overflow-y-scroll p-4">
          <MessageList socket={socket} />
        </div>
        {user && (
          <div className="p-4 border-t">
            <MessageForm socket={socket} />
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <UserInfo />
        <LogoutButton />
      </div>
    </div>
  );
};

export default Chat;
