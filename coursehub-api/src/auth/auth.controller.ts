import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { RegisterDto } from './dto/register.dt.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './types/jwt-payload.type.js';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.me(request.user.sub);
  }
}
