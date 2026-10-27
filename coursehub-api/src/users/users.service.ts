import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/users.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email: this.normalizeEmail(email) });
  }

  findById(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmailWithPassword(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: this.normalizeEmail(email) })
      .getOne();
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const normalizedEmail = this.normalizeEmail(email);
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) throw new ConflictException('Email already registered');

    const user = this.usersRepository.create({
      email: normalizedEmail,
      passwordHash,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code === '23505';
  }
}
