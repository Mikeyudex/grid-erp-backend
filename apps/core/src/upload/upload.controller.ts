import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { makeStorageId } from '../common/utils/formats';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        }
      }),
      limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
      }
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = this.uploadService.getFileUrl(file.filename);
    return { url };
  }

    @UseGuards(JwtAuthGuard)
  @Post('/img-product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/products',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        }
      }),
      limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
      }
    })
  )
  async uploadImgProduct(@UploadedFile() file: Express.Multer.File) {
    const url = `/static/products/${file.filename}`;
    return { url };
  }
}


