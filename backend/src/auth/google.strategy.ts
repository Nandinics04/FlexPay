import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret:
        config.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ??
        'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('Google account did not provide an email');
    }

    return this.authService.findOrCreateGoogleUser({
      googleId: profile.id,
      email,
      name: profile.displayName ?? email.split('@')[0],
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
  }
}
