import { 
  AiServiceException, 
  AiServiceTimeoutException, 
  AiServiceUnavailableException 
} from './ai-service.exception';
import { HttpStatus } from '@nestjs/common';

describe('AiServiceException', () => {
  describe('constructor', () => {
    it('should create exception with default status', () => {
      const message = 'AI service is unavailable';
      const exception = new AiServiceException(message);

      expect(exception.message).toBe(message);
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should create exception with custom status', () => {
      const message = 'AI service timeout';
      const status = HttpStatus.REQUEST_TIMEOUT;
      const exception = new AiServiceException(message, status);

      expect(exception.message).toBe(message);
      expect(exception.getStatus()).toBe(status);
    });

    it('should create exception with different status', () => {
      const message = 'AI service error';
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const exception = new AiServiceException(message, status);

      expect(exception.message).toBe(message);
      expect(exception.getStatus()).toBe(status);
    });
  });

  describe('inheritance', () => {
    it('should be instance of HttpException', () => {
      const message = 'Test exception';
      const exception = new AiServiceException(message);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toHaveProperty('getStatus');
      expect(typeof exception.getStatus).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle empty message', () => {
      const exception = new AiServiceException('');

      expect(exception.message).toBe('');
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should handle long message', () => {
      const longMessage = 'A'.repeat(1000);
      const exception = new AiServiceException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'AI service error: "Connection failed" (code: 500)';
      const exception = new AiServiceException(specialMessage);

      expect(exception.message).toBe(specialMessage);
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });

  describe('status codes', () => {
    it('should handle 503 Service Unavailable', () => {
      const message = 'Service unavailable';
      const exception = new AiServiceException(message, HttpStatus.SERVICE_UNAVAILABLE);

      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should handle 500 Internal Server Error', () => {
      const message = 'Internal server error';
      const exception = new AiServiceException(message, HttpStatus.INTERNAL_SERVER_ERROR);

      expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should handle 408 Request Timeout', () => {
      const message = 'Request timeout';
      const exception = new AiServiceException(message, HttpStatus.REQUEST_TIMEOUT);

      expect(exception.getStatus()).toBe(HttpStatus.REQUEST_TIMEOUT);
    });

    it('should handle 502 Bad Gateway', () => {
      const message = 'Bad gateway';
      const exception = new AiServiceException(message, HttpStatus.BAD_GATEWAY);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    });
  });

  describe('usage in try-catch', () => {
    it('should be catchable in try-catch block', () => {
      const message = 'AI service failed';
      const baseException = new AiServiceException(message);

      try {
        throw baseException;
      } catch (error) {
        expect(error).toBe(baseException);
        expect(error.message).toBe(message);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      }
    });

    it('should be catchable as HttpException', () => {
      const message = 'AI service error';
      const baseException = new AiServiceException(message);

      try {
        throw baseException;
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('getStatus');
      }
    });
  });

  describe('serialization', () => {
    it('should serialize correctly', () => {
      const message = 'AI service unavailable';
      const exception = new AiServiceException(message);

      const serialized = JSON.stringify(exception);
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe(message);
    });

    it('should include status in response', () => {
      const message = 'AI service error';
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const exception = new AiServiceException(message, status);

      expect(exception.getStatus()).toBe(status);
    });
  });

  describe('AiServiceTimeoutException', () => {
    it('should create an instance with default message', () => {
      const exception = new AiServiceTimeoutException('AI service request timed out');
      expect(exception).toBeInstanceOf(AiServiceTimeoutException);
      expect(exception).toBeInstanceOf(AiServiceException);
      expect(exception.message).toBe('AI service request timed out');
      expect(exception.name).toBe('AiServiceTimeoutException');
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'Custom timeout error';
      const exception = new AiServiceTimeoutException(customMessage);
      expect(exception.message).toBe(customMessage);
    });

    it('should be an instance of Error', () => {
      const exception = new AiServiceTimeoutException('Test timeout');
      expect(exception).toBeInstanceOf(Error);
    });

    it('should have correct stack trace', () => {
      const exception = new AiServiceTimeoutException('Test timeout');
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
    });
  });

  describe('AiServiceUnavailableException', () => {
    it('should create an instance with default message', () => {
      const exception = new AiServiceUnavailableException('AI service is unavailable');
      expect(exception).toBeInstanceOf(AiServiceUnavailableException);
      expect(exception).toBeInstanceOf(AiServiceException);
      expect(exception.message).toBe('AI service is unavailable');
      expect(exception.name).toBe('AiServiceUnavailableException');
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'Custom unavailable error';
      const exception = new AiServiceUnavailableException(customMessage);
      expect(exception.message).toBe(customMessage);
    });

    it('should be an instance of Error', () => {
      const exception = new AiServiceUnavailableException('Test unavailable');
      expect(exception).toBeInstanceOf(Error);
    });

    it('should have correct stack trace', () => {
      const exception = new AiServiceUnavailableException('Test unavailable');
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
    });
  });
}); 