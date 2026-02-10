import { CreateClaimDto } from "./dto/create-claim.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { ClaimsService } from "./claims.service";
export declare class Claimsontroller {
    private readonly service;
    constructor(service: ClaimsService);
    create(dto: CreateClaimDto, user: {
        userId: string;
    }): Promise<({
        user: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        supply: import(".prisma/client").$Enums.SupplyType | null;
        daysClaimed: number | null;
        status: import(".prisma/client").$Enums.ClaimStatus;
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
    }) | null>;
    findAll(query: QueryOptionsDto, user: {
        userId: string;
    }): Promise<({
        user: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        supply: import(".prisma/client").$Enums.SupplyType | null;
        daysClaimed: number | null;
        status: import(".prisma/client").$Enums.ClaimStatus;
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
    })[]>;
    findOne(claimId: string, user: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deliveries: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            userId: string;
            type: import(".prisma/client").$Enums.DeliveryType;
            claimId: string | null;
            quantity: number;
            daysReimbursed: number | null;
            itemName: string | null;
            date: Date;
            assignedById: string | null;
            observations: string | null;
        }[];
        userId: string;
        supply: import(".prisma/client").$Enums.SupplyType | null;
        daysClaimed: number | null;
        status: import(".prisma/client").$Enums.ClaimStatus;
        description: string | null;
        needChange: boolean;
        lotNumber: string | null;
        needsReplacement: boolean;
        photoUrl: string | null;
        failureDate: Date | null;
        colocationDate: Date | null;
    }>;
}
//# sourceMappingURL=claims.controller.d.ts.map