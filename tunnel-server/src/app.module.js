import { Module } from '@nestjs/common';
import { TunnelController } from './tunnel.controller';
import { TunnelGateway } from './tunnel.gateway';
import { MongooseModule } from '../node_modules/@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/tunnel-db'),
    UsersModule,
    AuthModule,
  ],
  controllers: [TunnelController],
  providers: [TunnelGateway],
})
export class AppModule {}
