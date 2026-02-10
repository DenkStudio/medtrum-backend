import { UserRole } from "@prisma/client";
import { CreateHardwareItemDto } from "./create-hardware-item.dto";
export declare class CreateUserDto {
    email: string;
    password?: string;
    sendInvite?: boolean;
    role: UserRole;
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
    hardwares?: CreateHardwareItemDto[];
}
//# sourceMappingURL=create-user.dto.d.ts.map