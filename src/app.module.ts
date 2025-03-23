import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { ParentsModule } from './parents/parents.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { FeedbackModule } from './feedback/feedback.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BundlesModule } from './bundles/bundles.module';
import { ClassCategoriesModule } from './class-categories/class-categories.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig),
    StudentsModule,
    ParentsModule,
    ProductsModule,
    CartModule,
    AuthModule,
    FeedbackModule,
    NotificationsModule,
    BundlesModule,
    ClassCategoriesModule,
    ProfilesModule,
    OrdersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
