import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { Parent } from './entities/parent.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parent, Student]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ParentsController],
  providers: [ParentsService],
})
export class ParentsModule {} 