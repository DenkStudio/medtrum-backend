import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { UsersAdminService } from "./users.admin.service";
import { ExcelExportService } from "../utils/excel-export.service";
import { AuthUser } from "../common/helpers/organization-filter.helper";
export declare class UsersAdminController {
    private readonly usersAdminService;
    private readonly excelExportService;
    constructor(usersAdminService: UsersAdminService, excelExportService: ExcelExportService);
    createOrUpdate(dto: CreateUserDto & {
        id?: string;
    }, user: AuthUser): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    invite(id: string): Promise<{
        message: string;
        data: {
            user: import("@supabase/auth-js").User;
        };
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<import("../utils/paginate-query").PaginatedResult<any>>;
    getPatientsOverview(user: AuthUser): Promise<{
        totalPatients: number;
        trendline: {
            labels: string[];
            data: number[];
        };
        recentPatients: {
            id: string;
            createdAt: Date;
            fullName: string | null;
        }[];
    }>;
    exportUsersWithClaims(query: QueryOptionsDto, user: AuthUser): Promise<import("@nestjs/common").StreamableFile>;
    findById(id: string, user: AuthUser): Promise<({
        organization: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: import(".prisma/client").$Enums.OrganizationName;
            code: string;
        } | null;
        healthcare: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            name: string;
            code: string;
        } | null;
        doctor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            name: string;
            province: string;
            telephone: string | null;
        } | null;
        educator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            organizationId: string | null;
            name: string;
            province: string;
            telephone: string | null;
        } | null;
        claims: {
            id: string;
            status: import(".prisma/client").$Enums.ClaimStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            supply: import(".prisma/client").$Enums.SupplyType | null;
            daysClaimed: number | null;
            description: string | null;
            needChange: boolean;
            lotNumber: string | null;
            needsReplacement: boolean;
            claimCategory: import(".prisma/client").$Enums.ClaimCategory | null;
            errorCode: import(".prisma/client").$Enums.ClaimErrorCode | null;
            photoUrl: string | null;
            failureDate: Date | null;
            colocationDate: Date | null;
            resolutionMessage: string | null;
            balanceAfterResolution: number | null;
            resolvedById: string | null;
            resolvedAt: Date | null;
        }[];
        deliveries: ({
            claim: {
                id: string;
                status: import(".prisma/client").$Enums.ClaimStatus;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                supply: import(".prisma/client").$Enums.SupplyType | null;
                daysClaimed: number | null;
                description: string | null;
                needChange: boolean;
                lotNumber: string | null;
                needsReplacement: boolean;
                claimCategory: import(".prisma/client").$Enums.ClaimCategory | null;
                errorCode: import(".prisma/client").$Enums.ClaimErrorCode | null;
                photoUrl: string | null;
                failureDate: Date | null;
                colocationDate: Date | null;
                resolutionMessage: string | null;
                balanceAfterResolution: number | null;
                resolvedById: string | null;
                resolvedAt: Date | null;
            } | null;
            assignedBy: {
                id: string;
                email: string;
                fullName: string | null;
            } | null;
        } & {
            id: string;
            type: import(".prisma/client").$Enums.DeliveryType;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            organizationId: string | null;
            date: Date;
            observations: string | null;
            claimId: string | null;
            quantity: number;
            daysReimbursed: number | null;
            itemName: string | null;
            assignedById: string | null;
        })[];
        hardwareSupplies: {
            id: string;
            type: import(".prisma/client").$Enums.HardwareType;
            serialNumber: string;
            status: import(".prisma/client").$Enums.HardwareStatus;
            assignedDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            organizationId: string | null;
        }[];
        medicalEntries: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            createdById: string;
            visitDate: Date;
            notes: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        supabaseId: string | null;
        email: string;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        healthcareId: string | null;
        fullName: string | null;
        phoneNumber: string | null;
        dni: string | null;
        address: string | null;
        birthDate: Date | null;
        province: string | null;
        doctorId: string | null;
        educatorId: string | null;
        balanceDaysSensor: number;
        balanceDaysParche: number;
    }) | null>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
//# sourceMappingURL=users.admin.controller.d.ts.map