import { PrismaService } from "../prisma/prisma.service";
import { OrganizationName, Prisma } from "@prisma/client";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class OrganizationsAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: OrganizationName;
        code: string;
    }): Promise<{
        name: import(".prisma/client").$Enums.OrganizationName;
        id: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryOptionsDto): Prisma.PrismaPromise<({
        users: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            fullName: string | null;
        }[];
    } & {
        name: import(".prisma/client").$Enums.OrganizationName;
        id: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
//# sourceMappingURL=organizations.admin.service.d.ts.map