import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;      // USID
  role: string;     // User role
  iat?: number;     // Issued at
  exp?: number;     // Expiration time
}

export const GetUsid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      // Decode JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      
      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token: USID not found in sub claim');
      }

      return decoded.sub;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  },
); 