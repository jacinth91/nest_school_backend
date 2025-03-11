import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'gondola.proxy.rlwy.net',
  port: 46797,
  username: 'postgres',
  password: 'owYAsYigpchTBWvoCRaXTOvfzwbboFfO',
  database: 'railway',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Disable automatic schema synchronization
  logging: true,
}; 