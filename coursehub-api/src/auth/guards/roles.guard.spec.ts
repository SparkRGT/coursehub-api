import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/user-role.enum.js';
import { RolesGuard } from './roles.guard.js';

function contextWith(user?: { id: number; email: string; role: UserRole }) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  function build(roles?: UserRole[]) {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(roles),
    } as unknown as Reflector;

    return new RolesGuard(reflector);
  }

  it('permite la ruta cuando no declara roles', () => {
    expect(build().canActivate(contextWith())).toBe(true);
  });

  it('deja pasar al rol requerido', () => {
    const guard = build([UserRole.ADMIN]);

    expect(
      guard.canActivate(
        contextWith({ id: 1, email: 'admin@example.com', role: UserRole.ADMIN }),
      ),
    ).toBe(true);
  });

  it('rechaza a un rol distinto', () => {
    const guard = build([UserRole.ADMIN]);

    expect(
      guard.canActivate(
        contextWith({ id: 2, email: 'ana@example.com', role: UserRole.STUDENT }),
      ),
    ).toBe(false);
  });

  it('rechaza cuando no hay identidad autenticada', () => {
    const guard = build([UserRole.ADMIN]);

    expect(guard.canActivate(contextWith())).toBe(false);
  });
});
