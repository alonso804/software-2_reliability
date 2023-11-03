import BaseError from './base-error';

class AnimeNotFound extends BaseError {
  constructor(message: string) {
    super(404, message);
  }
}

export default AnimeNotFound;
