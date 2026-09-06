import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { frontendOrigin, safeNextPath } from './auth.utils';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserDocument } from './schemas/user.schema';

type AuthedRequest = Request & { user: ReturnType<AuthService['toPublicUser']> };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthedRequest) {
    return request.user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() request: AuthedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(request.user.id, dto);
  }

  @Post('logout')
  logout() {
    return { ok: true };
  }

  @Get('providers')
  providers() {
    return {
      google: Boolean(this.config.get<string>('GOOGLE_CLIENT_ID')),
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() request: Request & { user: UserDocument; query: { state?: string } },
    @Res() response: Response,
  ) {
    const result = this.authService.issueAuth(request.user);
    const next = encodeURIComponent(safeNextPath(request.query.state));
    const origin = frontendOrigin(this.config.get<string>('FRONTEND_ORIGIN'));
    response.redirect(`${origin}/login?token=${result.token}&next=${next}`);
  }
}
