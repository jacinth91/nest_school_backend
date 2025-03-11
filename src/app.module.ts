import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { ParentsModule } from './parents/parents.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    StudentsModule,
    ParentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
