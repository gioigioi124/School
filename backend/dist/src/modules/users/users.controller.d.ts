import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
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
    updateProfile(user: any, updateData: UpdateProfileDto): Promise<{
        displayName: string | null;
        avatarUrl: string | null;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
