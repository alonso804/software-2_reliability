import { getModelForClass, prop, type ReturnModelType } from '@typegoose/typegoose';
import type { Document } from 'mongoose';

export class Anime {
  @prop()
  id: number;

  @prop()
  title: string;

  @prop()
  type: string;

  @prop()
  episodes: number;

  @prop()
  status: string;

  @prop()
  airing: boolean;

  static async findOneById(
    this: ReturnModelType<typeof Anime>,
    id: number,
  ): Promise<AnimeDocument | null> {
    return this.findOne({ id });
  }
}

export type AnimeDocument = Anime & Document;

const AnimeModel = getModelForClass(Anime, {
  schemaOptions: {
    collection: 'anime',
  },
});
export default AnimeModel;
