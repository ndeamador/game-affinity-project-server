import { Request, Response } from 'express';
import { Session } from 'express-session';
import { RedisClient } from 'redis';

export interface Context {
  req: Request & { session: CustomSession }; // & joins two types
  // req: Request;
  res: Response,
  igdb_access_token: string,
  redis_client: RedisClient,
}

export interface CustomSession extends Session {
  userId?: number;
}

export type Rating = 0 | 1 | 2 | 3 | 4;

export interface IGDBCredentials {
  access_token: string,
  expires_in: number,
  token_type: string
}


export interface IGDBGameQueryError {
  title: string,
  status: number,
  cause: string
}