import { JwtPayload } from "./utilTypes";

declare global {
  namespace Express {
    interface Request {
      JwtPayload?: JwtPayload;
    }
  }
}

export {};
