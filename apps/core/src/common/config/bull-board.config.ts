// src/common/config/bull-board.config.ts
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Injectable()
export class BullBoardService{
    private serverAdapter: ExpressAdapter;

    constructor(@InjectQueue('sync-products-woocommerce') private readonly syncProductWooQueue: Queue) {
      // Crear el adaptador de Express para Bull Board
      this.serverAdapter = new ExpressAdapter();
      this.serverAdapter.setBasePath('/bull-board');
  
      // Crear el dashboard de Bull Board
      createBullBoard({
        queues: [new BullAdapter(this.syncProductWooQueue)],
        serverAdapter: this.serverAdapter,
      });
    }
  
    getServerAdapter() {
      return this.serverAdapter;
    }
}
