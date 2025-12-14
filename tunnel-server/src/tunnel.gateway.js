import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true }) // Allow connections from anywhere
export class TunnelGateway {
  constructor() {
    this.connectedClient = null; // We only support 1 client for now
    this.pendingRequests = new Map(); // Store HTTP requests waiting for a reply
  }

  @WebSocketServer()
  server;

  /**
   * 1. When a Client Agent connects
   */
  handleConnection(client) {
    console.log(`Client Agent connected: ${client.id}`);
    this.connectedClient = client.id;
  }

  handleDisconnect(client) {
    console.log(`Client Agent disconnected: ${client.id}`);
    if (this.connectedClient === client.id) {
      this.connectedClient = null;
    }
  }

  /**
   * 2. Send a request TO the Client Agent
   * We return a Promise that resolves when the agent replies.
   */
  async forwardRequestToAgent(requestId, method, url, body) {
    if (!this.connectedClient) {
      throw new Error('No Client Agent connected');
    }

    // Create a generic "container" for the response
    return new Promise((resolve, reject) => {
      // Timeout safety: If agent doesn't reply in 10s, fail.
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Gateway Timeout'));
      }, 10000);

      // Store the "resolve" function to call it later
      this.pendingRequests.set(requestId, { resolve, timeout });

      // Emit the event to the specific client
      this.server.to(this.connectedClient).emit('request-in', {
        requestId,
        method,
        url,
        body
      });
    });
  }

  /**
   * 3. Receive the response FROM the Client Agent
   */
  @SubscribeMessage('response-out')
  handleResponse(client, payload) {
    // payload = { requestId, status, data, headers }
    const { requestId, ...responseData } = payload;
    
    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(responseData); // Resume the HTTP request!
      this.pendingRequests.delete(requestId);
    }
  }
}