import { Controller, All, Req, Res, Dependencies, Bind } from '@nestjs/common';
import { TunnelGateway } from './tunnel.gateway';
import { v4 as uuidv4 } from 'uuid';

@Controller()
@Dependencies(TunnelGateway)
export class TunnelController {
  constructor(tunnelGateway) {
    this.tunnelGateway = tunnelGateway;
  }

  @All('*')
  @Bind(Req(), Res())
  async handleIncomingRequest(req, res) {
    const requestId = uuidv4();

    // READ ROUTING HEADER
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
        targetClientId, // Pass it to gateway
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
