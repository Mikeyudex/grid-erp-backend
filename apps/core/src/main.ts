import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core.module';
import { globalConfigs } from 'configs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MongooseValidationFilter } from './mongoose-validation.filter';

async function bootstrap() {
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
  
  await app.listen(globalConfigs.PORT);
}
bootstrap();
