import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiErrorResponses } from '../common/openapi/error-response.dto.js';
import { AuthService } from './auth.service.js';
import {
  AuthenticatedUserDto,
  LoginResponseDto,
  PublicUserDto,
} from './dto/auth-response.dto.js';
import { RegisterDto } from './dto/register.dt.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthenticatedUser } from './types/jwt-payload.type.js';

type RequestWithUser = Request & { user: AuthenticatedUser };

@ApiTags('autenticación')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar una cuenta',
    description:
      'Toda cuenta nueva recibe el rol `student`. El rol nunca se toma del cuerpo de la petición.',
  })
  @ApiCreatedResponse({ type: PublicUserDto })
  @ApiErrorResponses(400, 409)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Devuelve el JWT que viaja en `Authorization: Bearer <token>`. Limitado a 5 intentos por minuto e IP.',
  })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiErrorResponses(400, 401, 429)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Identidad del token',
    description: 'Devuelve el usuario que el guard dejó en la petición.',
  })
  @ApiOkResponse({ type: AuthenticatedUserDto })
  @ApiErrorResponses(401)
  me(@Req() request: RequestWithUser) {
    return request.user;
  }
}
