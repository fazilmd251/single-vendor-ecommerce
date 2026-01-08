import AppError from "./AppError";

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }

}

export class ValidationError extends AppError {
  constructor(message = "Invalid Request Data") {
    super(message, 400,)
  }
}

export class AuthError extends AppError {
    constructor(message = "Unauthorize") {
        super(message, 401)
    }
}


export class EmailError extends AppError {
  constructor(message = "Failed to send email") {
    super(message, 502); // Bad Gateway / external service failure
  }
}