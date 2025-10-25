import { auth } from "express-oauth2-jwt-bearer";
import "dotenv/config"
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

declare global {
  namespace Express {
    interface Request {
      auth0Id : string;
      userId : string
    }
  }
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE ?? "",
  issuerBaseURL: process.env.AUTH0_ISSUE_BASE_URL ?? "",
  tokenSigningAlg: 'RS256'
});

export const jwtParse =async (req: Request , res: Response , next : NextFunction) => {
    const {authorization} = req.headers;

    if(!authorization || !authorization.startsWith("Bearer")){
      return res.status(401)
    }

    const token = authorization.split(" ")[1];
    try {
        const decoded = jwt.decode(token as string) as jwt.JwtPayload;
        const auth0Id = decoded.sub;

        const user = await User.findOne({auth0Id});


        if(!user) {
          return res.status(401).json({ message: "User not found" });
        }

        req.auth0Id = auth0Id as string;
        req.userId = user._id.toString();
        next();
    } catch (error) {
          return res.sendStatus(401);
    }
}
