import { Module } from '@nestjs/common';
import { ShelfService } from './shelf.service';
import { ShelfController } from './shelf.controller';

@Module({ providers: [ShelfService], controllers: [ShelfController] })
export class ShelfModule {}
