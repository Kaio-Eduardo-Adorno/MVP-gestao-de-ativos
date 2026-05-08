import { ErrorType, ErrorKey } from '../consts/error.const';

export class ErrorUtil extends Error {
  public readonly statusCode: number;
  public readonly errorName: string;

  constructor(typeKey: ErrorKey, message: string) {
    super(message);

    const config = ErrorType[typeKey];

    this.name = config.name;
    this.errorName = config.name;
    this.statusCode = config.statusCode;
  }
}
