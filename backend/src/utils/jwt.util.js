import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';

export const signJwt = (payload, options = {}) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    ...options
  });

export const verifyJwt = (token) =>
  jwt.verify(token, env.jwtSecret);

