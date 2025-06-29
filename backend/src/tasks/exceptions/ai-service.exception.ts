import { HttpException, HttpStatus } from '@nestjs/common';

export class AiServiceException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.SERVICE_UNAVAILABLE) {
    super(message, status);
  }
}

export class AiServiceTimeoutException extends AiServiceException {
  constructor(message: string = 'AI service timeout') {
    super(message, HttpStatus.REQUEST_TIMEOUT);
  }
}

export class AiServiceUnavailableException extends AiServiceException {
  constructor(message: string = 'AI service temporarily unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
