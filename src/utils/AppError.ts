class AppError extends Error {
  statusCode: number;
  path: string | string[];
  constructor(message: string, statusCode: number, path: string | string[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.path = path;
  }
}

export default AppError;
