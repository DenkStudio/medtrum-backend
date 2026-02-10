import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { PaginatedResult } from "src/utils/paginate-query";
import { HardwareAdminService } from "../hardware/hardware.admin.service";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { SupabaseService } from "../supabase/supabase.service";
export declare class UsersAdminService {
    private prisma;
    private hardwareService;
    private supabase;
    private config;
    constructor(prisma: PrismaService, hardwareService: HardwareAdminService, supabase: SupabaseService, config: ConfigService);
    invite(id: string): Promise<{
        message: string;
        data: {
            user: import("@supabase/auth-js").User;
        };
    }>;
    create(dto: CreateUserDto, createdByUserId?: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findByEmail(email: string): Promise<{
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
    } | null>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<PaginatedResult<any>>;
    findById(id: string, user?: AuthUser): Promise<({
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
    update(id: string, dto: any): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    getUsersWithClaims(user: AuthUser): Promise<({
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
    })[]>;
    getUsers(user: AuthUser, query?: QueryOptionsDto): Promise<({
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
    })[]>;
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
}
//# sourceMappingURL=users.admin.service.d.ts.map