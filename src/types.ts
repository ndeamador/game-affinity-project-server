import { Request, Response } from 'express';
import { Session } from 'express-session';
import { Field, ObjectType } from 'type-graphql';
import { DeleteResult } from 'typeorm';

export interface Context {
  req: Request & { session: CustomSession }; // & joins two types
  // req: Request;
  res: Response
}

export interface CustomSession extends Session {
  userId?: number;
}