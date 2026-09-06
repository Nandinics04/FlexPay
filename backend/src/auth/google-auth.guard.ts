import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const next = typeof request.query.next === 'string' ? request.query.next : '/';
    return { state: next, session: false };
  }

  canActivate(context: ExecutionContext) {
    if (!this.config.get<string>('GOOGLE_CLIENT_ID')) {
      throw new BadRequestException(
        'Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      );
    }
    return super.canActivate(context);
  }
}
