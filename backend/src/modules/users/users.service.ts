import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        ...(updateData.displayName !== undefined && { displayName: updateData.displayName }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.school !== undefined && { school: updateData.school }),
        ...(updateData.avatarUrl !== undefined && { avatarUrl: updateData.avatarUrl }),
      },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });
  }
}
