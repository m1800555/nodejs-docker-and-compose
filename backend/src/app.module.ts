import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from './config/config';
import { DatabaseConfigFactory } from './config/db-config.factory';
import { AuthModule } from './auth/auth.module';
import { OffersModule } from './offers/offers.module';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useClass: DatabaseConfigFactory,
    }),
    AuthModule,
    OffersModule,
    UsersModule,
    WishesModule,
    WishlistsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
