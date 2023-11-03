import BaseError from './base-error';

class CircuitOpen extends BaseError {
  constructor(message: string) {
    super(409, message);
  }
}

export default CircuitOpen;
