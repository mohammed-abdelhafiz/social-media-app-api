import { JwtPayload } from "../utils/types";

declare global {
  namespace Express {
    interface Request {
      JwtPayload?: JwtPayload;
    }
  }
}

export {};
