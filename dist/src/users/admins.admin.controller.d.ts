import { AdminsAdminService } from "./admins.admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class AdminsAdminController {
    private readonly adminsService;
    constructor(adminsService: AdminsAdminService);
    create(dto: CreateAdminDto, user: AuthUser): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<({
        organization: {
            name: import(".prisma/client").$Enums.OrganizationName;
            id: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        province: string | null;
        doctorId: string | null;
        healthcareId: string | null;
        supabaseId: string | null;
        email: string;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        fullName: string | null;
        phoneNumber: string | null;
        dni: string | null;
        address: string | null;
        birthDate: Date | null;
        educatorId: string | null;
        balanceDaysSensor: number;
        balanceDaysParche: number;
    })[]>;
    findById(id: string): Promise<{
        organization: {
            name: import(".prisma/client").$Enums.OrganizationName;
            id: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        province: string | null;
        doctorId: string | null;
        healthcareId: string | null;
        supabaseId: string | null;
        email: string;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        fullName: string | null;
        phoneNumber: string | null;
        dni: string | null;
        address: string | null;
        birthDate: Date | null;
        educatorId: string | null;
        balanceDaysSensor: number;
        balanceDaysParche: number;
    }>;
    update(id: string, dto: Partial<CreateAdminDto>): Promise<{
        organization: {
            name: import(".prisma/client").$Enums.OrganizationName;
            id: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        province: string | null;
        doctorId: string | null;
        healthcareId: string | null;
        supabaseId: string | null;
        email: string;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        fullName: string | null;
        phoneNumber: string | null;
        dni: string | null;
        address: string | null;
        birthDate: Date | null;
        educatorId: string | null;
        balanceDaysSensor: number;
        balanceDaysParche: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
//# sourceMappingURL=admins.admin.controller.d.ts.map