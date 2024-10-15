import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CoreService } from './core.service';

@Controller()
export class CoreController {
  constructor(
    private readonly coreservice: CoreService,
  ) { }


}
