import { BadRequestException, UseInterceptors } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname, join } from 'path';

import { mkdirSync } from 'fs';

export function ProductImageInterceptor() {
  return UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'products');

          mkdirSync(uploadPath, {
            recursive: true,
          });

          cb(null, uploadPath);
        },

        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;

          const fileExtension = extname(file.originalname);

          cb(null, `${uniqueSuffix}${fileExtension}`);
        },
      }),

      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Seuls les fichiers image JPG, JPEG, PNG et WEBP sont autorisés.',
            ),
            false,
          );
        }

        cb(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  );
}
