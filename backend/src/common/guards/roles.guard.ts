import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) {
      return false;
    }

    // 1. Direct claim check if available (e.g. app_metadata)
    if (user.role && requiredRoles.includes(user.role)) {
      return true;
    }

    // 2. Query assigned roles from database
    const userRoleAssignments = await this.prisma.roleAssignment.findMany({
      where: { profileId: user.id },
      include: { role: true },
    });

    const userRoles = userRoleAssignments.map((ra) => ra.role.name.toLowerCase());
    return requiredRoles.some((role) => userRoles.includes(role.toLowerCase()));
  }
}
