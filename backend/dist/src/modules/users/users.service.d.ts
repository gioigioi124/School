import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        roleAssignments: ({
            role: {
                description: string | null;
                id: string;
                createdAt: Date;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            profileId: string;
            roleId: string;
        })[];
    } & {
        displayName: string | null;
        avatarUrl: string | null;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, updateData: UpdateProfileDto): Promise<{
        displayName: string | null;
        avatarUrl: string | null;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
