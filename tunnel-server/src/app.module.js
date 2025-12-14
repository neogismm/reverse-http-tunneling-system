import { Module } from '@nestjs/common';
import { TunnelController } from './tunnel.controller';
import { TunnelGateway } from './tunnel.gateway';

@Module({
  imports: [],
  controllers: [TunnelController],
  providers: [TunnelGateway],
})
export class AppModule {}
