import CircuitOpen from 'src/errors/circuit-open';
import { logger } from 'src/logger';

const STATE = {
  OPENED: 'OPENED',
  CLOSED: 'CLOSED',
  HALF: 'HALF',
} as const;

type State = (typeof STATE)[keyof typeof STATE];

type Options = {
  failureThreshold: number;
  timeout: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Req = (params: any) => Promise<Record<string, unknown>>;

class CircuitBreaker {
  #request: Req;
  #state: State = STATE.CLOSED;
  #failureCount = 0;
  #failureThreshold = 5;
  #resetAfter = 50000;
  #timeout = 5000;

  constructor(request: Req, options?: Options) {
    this.#request = request;
    this.#state = STATE.CLOSED;
    this.#failureCount = 0;

    this.#resetAfter = Date.now();
    if (options) {
      this.#failureThreshold = options.failureThreshold;
      this.#timeout = options.timeout;
    } else {
      this.#failureThreshold = 5;
      this.#timeout = 5000; // in ms
    }
  }

  async fire(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (this.#state === STATE.OPENED) {
      if (this.#resetAfter <= Date.now()) {
        this.#state = STATE.HALF;
        this.#failureCount = 0;
      } else {
        throw new CircuitOpen(
          `Circuit is in open state right now. Please try again at ${new Date(
            this.#resetAfter,
          ).toISOString()}.`,
        );
      }
    }
    try {
      const response = await this.#request(params);

      this.success();

      return response;
    } catch (err) {
      this.failure();

      throw new CircuitOpen(
        `[X] Circuit is in open state right now. Please try again at ${new Date(
          this.#resetAfter,
        ).toISOString()}.`,
      );
      // throw err;
    }
  }

  success(): void {
    logger.info({ message: 'Success', failureCount: this.#failureCount, state: this.#state });
    this.#failureCount = 0;

    if (this.#state === STATE.HALF) {
      this.#state = STATE.CLOSED;
    }
  }

  failure(): void {
    this.#failureCount += 1;

    if (this.#state === STATE.HALF || this.#failureCount >= this.#failureThreshold) {
      this.#state = STATE.OPENED;
      this.#resetAfter = Date.now() + this.#timeout;
    }

    logger.warn({
      message: 'Failure',
      failureCount: this.#failureCount,
      state: this.#state,
      resetAfter: new Date(this.#resetAfter).toISOString(),
    });
  }
}

export default CircuitBreaker;
