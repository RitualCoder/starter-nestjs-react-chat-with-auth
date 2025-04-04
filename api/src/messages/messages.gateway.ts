import { Server, Socket } from 'socket.io';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

interface User {
  id: string;
  email: string;
  isConnected?: boolean;
  lastConnection?: Date;
  lastDisconnection?: Date;
}

const users: User[] = [];

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    const email: string =
      (client.handshake.auth.email as string) || 'unknown@example.com';

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      // Mettre à jour l'ID du socket pour s'assurer que handleDisconnect fonctionne
      existingUser.id = client.id;
      existingUser.isConnected = true;
      existingUser.lastConnection = new Date();
      existingUser.lastDisconnection = undefined;
    } else {
      users.push({
        id: client.id,
        email,
        isConnected: true,
        lastConnection: new Date(),
        lastDisconnection: undefined,
      });
    }

    console.log('Client connected:', client.id);
    this.server.emit('connectedUsers', users);
  }

  handleDisconnect(client: Socket): void {
    console.log('Client disconnected:', client.id);
    const user = users.find((user) => user.id === client.id);

    if (user) {
      user.isConnected = false;
      user.lastDisconnection = new Date();
    }
    this.server.emit('connectedUsers', users);
  }

  @SubscribeMessage('sendMessageFromFront')
  handleMessage(client: Socket, payload: any): void {
    console.log('message', payload);
    this.server.emit('sendMessageFromBack', payload);
  }

  @SubscribeMessage('likeMessageFromFront')
  handleLike(): void {
    this.server.emit('likeMessageFromBack');
  }

  @SubscribeMessage('getConnectedUsers')
  handleGetConnectedUsers(client: Socket): void {
    console.log('getConnectedUsers', users);
    client.emit('connectedUsers', users);
  }
}
