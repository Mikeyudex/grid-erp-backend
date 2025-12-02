import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RoleUserService } from './role-user.service';
import { RoleUserController } from './role-user.controller';
import { RoleUser, RoleUserSchema } from './role-user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleUserValidationMiddleware } from './middlewares/role-user.middleware';
import { ResourceModule } from '../resource/resource.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoleUser.name, schema: RoleUserSchema }]),
    ResourceModule,
  ],
  providers: [RoleUserService],
  controllers: [RoleUserController],
  exports: [RoleUserService],
})
export class RoleUserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RoleUserValidationMiddleware)
      .forRoutes({ path: 'role-user/create', method: RequestMethod.POST });
  }
}
