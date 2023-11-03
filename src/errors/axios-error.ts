import BaseError from './base-error';

class AxiosError extends BaseError {
  constructor(status: number, message: string) {
    super(status, message);
  }
}

export default AxiosError;
