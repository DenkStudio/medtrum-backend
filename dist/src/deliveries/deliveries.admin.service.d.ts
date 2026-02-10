import { PrismaService } from "../prisma/prisma.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { UsersService } from "../users/users.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { PaginatedResult } from "src/utils/paginate-query";
import { AuthUser } from "../common/helpers/organization-filter.helper";
export declare class DeliveriesAdminService {
    private prisma;
    private users;
    constructor(prisma: PrismaService, users: UsersService);
    create(dto: CreateDeliveryDto, assignedByUserId: string, user: AuthUser): Promise<{
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
    }>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<PaginatedResult<any>>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
        };
        claim: {
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
        } | null;
        assignedBy: {
            id: string;
            email: string;
            fullName: string | null;
        } | null;
    } & {
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
    }>;
    findByUserId(userId: string, user: AuthUser): Promise<({
        claim: {
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
        } | null;
        assignedBy: {
            id: string;
            email: string;
            fullName: string | null;
        } | null;
    } & {
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
    })[]>;
}
//# sourceMappingURL=deliveries.admin.service.d.ts.map