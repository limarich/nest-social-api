import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpException, HttpStatus, ArgumentsHost, Logger } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter<any>;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockRequest = {
    url: '/test-url',
  };

  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnThis(),
    getResponse: jest.fn().mockReturnValue(mockResponse),
    getRequest: jest.fn().mockReturnValue(mockRequest),
  } as unknown as ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter<any>>(AllExceptionsFilter);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException with string response', () => {
    const status = HttpStatus.BAD_REQUEST;
    const message = 'Test error message';
    const exception = new HttpException(message, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: status,
      message: message,
      path: mockRequest.url,
      timestamp: expect.any(String),
    });
  });

  it('should handle HttpException with object response', () => {
    const status = HttpStatus.UNPROCESSABLE_ENTITY;
    const responseBody = { message: ['error 1', 'error 2'], error: 'Unprocessable Entity' };
    const exception = new HttpException(responseBody, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: status,
      message: responseBody.message,
      path: mockRequest.url,
      timestamp: expect.any(String),
    });
  });

  it('should handle generic Error and return 500 status', () => {
    const exception = new Error('Database connection failed');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: mockRequest.url,
      timestamp: expect.any(String),
    });
  });

  it('should handle unknown exception types', () => {
    const exception = { some: 'random object' };

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: mockRequest.url,
      timestamp: expect.any(String),
    });
  });
});
