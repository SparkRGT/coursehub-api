import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmailWithPassword: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();

    usersService = {
      findByEmailWithPassword: vi.fn(),
      create: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn().mockResolvedValue('signed-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('valida credenciales y firma el token solo después de validar', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 7,
      email: 'test@example.com',
      passwordHash: '$2b$12$abcdefghijklmnopqrstuv',
      createdAt,
    });
    (bcrypt.compare as any).mockResolvedValue(true);

    const result = await service.login({ email: 'test@example.com', password: 'secret123' });

    expect(bcrypt.compare).toHaveBeenCalledWith('secret123', '$2b$12$abcdefghijklmnopqrstuv');
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 7, email: 'test@example.com' });
    expect(result).toEqual({
      accessToken: 'signed-token',
      user: { id: 7, email: 'test@example.com', createdAt },
    });
  });
});
