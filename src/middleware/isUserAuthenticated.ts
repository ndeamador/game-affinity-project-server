import { MiddlewareFn } from 'type-graphql';
import { Context } from '../types';

export const isUserAuthenticated: MiddlewareFn<Context> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('No user logged in.');
  }

  return next();
};