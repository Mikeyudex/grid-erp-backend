import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WsAdapter } from '@nestjs/platform-ws';

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
  app.useWebSocketAdapter(new WsAdapter(app));
   app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = [];
        if (process.env.NODE_ENV === 'local' || process.env.ENV === 'LOCAL') {
          allowedOrigins.push('http://localhost:3000');
          allowedOrigins.push('http://localhost:3001');
          allowedOrigins.push('http://localhost:3002');
        } else if (process.env.NODE_ENV === 'dev') {
          allowedOrigins.push('http://149.130.186.128:8080');
        }
        else if (process.env.NODE_ENV === 'prod') {
          allowedOrigins.push('http://149.130.186.128:8080');
        } else {
          allowedOrigins.push('http://149.130.186.128:8080');
        }
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log("Allowed origins: " + allowedOrigins);
          console.log("Origin: " + origin);
          callback(new Error('No permitido por CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  
  await app.listen(configsService.get('PORT'));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
