import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class TunnelGateway {
  constructor() {
    this.clients = new Map(); // client: <ClientID, SocketID>
    this.pendingRequests = new Map();
    this.validTokens = ['password1', 'password2']; // Could be loaded from config/DB
  }

  @WebSocketServer()
  server;

  // 1. Auth - happens after server is initialized
  afterInit(server) {
    server.use((socket, next) => {
      const { token, clientId } = socket.handshake.auth;

      if (!token || !this.validTokens.includes(token)) {
        console.log(`⛔ Connection rejected: Invalid Token`);
        return next(new Error('Authentication failed: Invalid token'));
      }

      if (!clientId) {
        console.log(`⛔ Connection rejected: Missing Agent ID`);
        return next(new Error('Authentication failed: Missing clientId'));
      }

      // Auth passed - allow connection
      next();
    });

    console.log('🚀 WebSocket Gateway initialized with auth middleware');
  }

  handleConnection(client) {
    const { clientId } = client.handshake.auth;

    console.log(`✅ Agent Connected: ${clientId} (Socket: ${client.id})`);
    this.clients.set(clientId, client.id);
  }

  handleDisconnect(client) {
    for (const [clientId, socketId] of this.clients.entries()) {
      if (socketId === client.id) {
        console.log(`❌ Agent Disconnected: ${clientId}`);
        this.clients.delete(clientId);
        break;
      }
    }
  }

  // 2. Forwarding Logic with Routing
  async forwardRequestToAgent(requestId, method, url, body, targetclientId) {
    // LOOKUP client
    const socketId = this.clients.get(targetclientId);

    if (!socketId) {
      throw new Error(`Agent '${targetclientId}' is not connected`);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Gateway Timeout'));
      }, 5000);

      this.pendingRequests.set(requestId, { resolve, timeout });

      // Send to SPECIFIC socket
      this.server.to(socketId).emit('request-in', {
        requestId,
        method,
        url,
        body,
      });
    });
  }

  @SubscribeMessage('response-out')
  handleResponse(client, payload) {
    const { requestId, ...responseData } = payload;
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(responseData);
      this.pendingRequests.delete(requestId);
    }
  }
}
