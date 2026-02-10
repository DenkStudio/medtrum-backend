import { UserRole } from "@prisma/client";
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    role?: UserRole;
    organization?: string;
    healthcare?: string;
    fullName?: string;
    phoneNumber?: string;
    dni?: string;
    address?: string;
    birthDate?: string;
    doctor?: string;
    educator?: string;
    province?: string;
    balanceDaysSensor?: number;
    balanceDaysParche?: number;
}
//# sourceMappingURL=update-user.dto.d.ts.map