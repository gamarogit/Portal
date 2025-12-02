import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TrainingModule,
  ],
})
export class AppModule {}
