import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { CoreModule } from './core.module';
import { MongooseValidationFilter } from './mongoose-validation.filter';
import { BullBoardService } from './common/config/bull-board.config';

declare const module: any;

async function bootstrap() {
  const configsService = new ConfigService();
  const app = await NestFactory.create(CoreModule);

  //BullBoard configs
  const bullBoardService = app.get(BullBoardService);
  const serverAdapter = bullBoardService.getServerAdapter();

  // Configurar ruta para Bull Board
  app.use('/bull-board', serverAdapter.getRouter());

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
