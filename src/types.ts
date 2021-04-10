import { Request, Response } from 'express';
import { Session } from 'express-session';

export interface Context {
  req: Request & { session: CustomSession }; // & joins two types
  // req: Request;
  res: Response
}

export interface CustomSession extends Session {
  userId?: number;
}

export type Rating = 0 | 1 | 2 | 3;