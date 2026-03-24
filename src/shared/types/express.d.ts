import { JwtPayload } from ".";

declare global {
  namespace Express {
    interface Request {
      JwtPayload?: JwtPayload;
    }
  }
}

export {};
