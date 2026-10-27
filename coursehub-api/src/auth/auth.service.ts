import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dt.js';
import { LoginDto } from './dto/login.dto.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/users.entity.js';
import { JwtPayload } from './types/jwt-payload.type.js';

const INVALID_CREDENTIALS = 'Invalid credentials';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create(dto.email, passwordHash);
    return this.toPublicUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.validateCredentials(dto.email, dto.password);
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return this.toPublicUser(user);
  }

  private async validateCredentials(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  private toPublicUser(user: User) {
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }
}
