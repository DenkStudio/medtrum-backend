import { OrganizationsAdminService } from "./organizations.admin.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { OrganizationName } from "@prisma/client";
export declare class OrganizationsAdminController {
    private readonly orgs;
    constructor(orgs: OrganizationsAdminService);
    create(body: {
        name: OrganizationName;
        code: string;
    }): Promise<{
        name: import(".prisma/client").$Enums.OrganizationName;
        id: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryOptionsDto): import(".prisma/client").Prisma.PrismaPromise<({
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
//# sourceMappingURL=organizations.admin.controller.d.ts.map