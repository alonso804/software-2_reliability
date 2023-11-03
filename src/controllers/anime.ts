import axios, { isAxiosError } from 'axios';
import type { Request, Response } from 'express';
import AnimeNotFound from 'src/errors/anime-not-found';
import AxiosError from 'src/errors/axios-error';
import AnimeModel from 'src/models/anime';

type ServerError = {
  code: number;
  message: string;
  response: {
    status: number;
    data: {
      message: string;
    };
  };
};

type Anime = {
  title: string;
  type: string;
  episodes: number;
  status: string;
  airing: boolean;
};

type Data<T> = {
  data: T;
};

class AnimeController {
  static async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      if (await AnimeModel.findOneById(Number(id))) {
        return res.status(200).json({ message: `Anime [${id}] already exists` });
      }

      const response = await axios.get<Data<Anime>>(`${process.env.ANIME_URI}/anime/${id}`);

      const {
        data: {
          data: { title, type, episodes, status, airing },
        },
      } = response;

      /* return res.status(200).json({
        id,
        title,
        type,
        episodes,
        status,
        airing,
      }); */

      await AnimeModel.create({
        id,
        title,
        type,
        episodes,
        status,
        airing,
      });

      return res.status(200).json({ message: `Anime [${id}] successfully created` });
    } catch (error) {
      if (isAxiosError<ServerError>(error)) {
        if (error.response?.status === 404) {
          throw new AnimeNotFound(error.response?.data.message ?? 'Anime not found');
        }

        throw new AxiosError(
          error.response?.status ?? 500,
          error.response?.data.message ?? 'Internal server error from Anime',
        );
      }

      throw error;
    }
  }
}

export default AnimeController;
