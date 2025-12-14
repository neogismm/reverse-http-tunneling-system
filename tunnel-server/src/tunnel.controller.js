import {
  Controller,
  All,
  Req,
  Res,
  Body,
  Param,
  Query,
  Dependencies,
  Bind,
} from '@nestjs/common';
import { TunnelGateway } from './tunnel.gateway';
import { v4 as uuidv4 } from 'uuid';

@Controller()
@Dependencies(TunnelGateway) // Inject the Gateway
export class TunnelController {
  constructor(tunnelGateway) {
    this.tunnelGateway = tunnelGateway;
  }

  @All('*')
  @Bind(Req(), Res())
  async handleIncomingRequest(req, res) {
    // 1. Generate ID
    const requestId = uuidv4();
    console.log(
      `[HTTP] Incoming request ${requestId}: ${req.method} ${req.url}`,
    );

    try {
      // 2. Forward to the Agent via Gateway
      const responseFromAgent = await this.tunnelGateway.forwardRequestToAgent(
        requestId,
        req.method,
        req.url,
        req.body,
      );

      // 3. Send response back to user
      // responseFromAgent looks like: { status: 200, data: {...}, headers: {...} }
      return res.status(responseFromAgent.status).json(responseFromAgent.data);
    } catch (error) {
      console.error(error.message);
      return res
        .status(502)
        .json({ error: 'Bad Gateway - Could not reach Client Agent' });
    }
  }
}