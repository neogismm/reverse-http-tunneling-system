import {
  Controller,
  All,
  Req,
  Res,
  Dependencies,
  Bind,
  UseGuards,
} from '@nestjs/common';
import { TunnelGateway } from './tunnel.gateway';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '@nestjs/passport'; // Import AuthGuard

@Controller('api')
@Dependencies(TunnelGateway)
export class TunnelController {
  constructor(tunnelGateway) {
    this.tunnelGateway = tunnelGateway;
  }

  // --- THE SECURITY GUARD ---
  @UseGuards(AuthGuard('jwt'))
  @All('*')
  @Bind(Req(), Res())
  async handleIncomingRequest(req, res) {
    const requestId = uuidv4();

    // 1. Log the Authenticated User (Added bonus)
    console.log(`[AUTH] Request from user: ${req.user.username}`);

    const targetClientId = req.headers['x-agent-id'];

    if (!targetClientId) {
      return res.status(400).json({ error: 'Missing header: x-agent-id' });
    }

    console.log(`[HTTP] ${req.method} ${req.url} -> Agent: ${targetClientId}`);

    try {
      const response = await this.tunnelGateway.forwardRequestToAgent(
        requestId,
        req.method,
        req.url,
        req.body,
        targetClientId,
      );

      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      if (error.message.includes('not connected')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(502).json({ error: 'Bad Gateway' });
    }
  }
}
