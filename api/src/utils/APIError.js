export class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends APIError {
  constructor(message) {
    super(message || "Bad request", 400);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message) {
    super(message || "Unauthorized", 401);
  }
}

export class NotFoundError extends APIError {
  constructor(message) {
    super(message || "The requested resource was not found", 404);
  }
}

export class UnprocessableContentError extends APIError {
  constructor(message) {
    super(message || "Unprocessable content", 422);
  }
}

export class TooManyRequestsError extends APIError {
  constructor(message) {
    super(message || "Too many requests", 429);
  }
}
