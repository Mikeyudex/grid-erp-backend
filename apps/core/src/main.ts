import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MongooseValidationFilter } from './mongoose-validation.filter';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  const configsService = new ConfigService();
  const app = await NestFactory.create(CoreModule);
  app.useGlobalFilters(new MongooseValidationFilter());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Inventory API')
    .setDescription('API de Grid ERP')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(configsService.get('PORT'));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
