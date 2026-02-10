import { HealthcareAdminService } from "./healthcare.admin.service";
import { CreateHealthcareDto } from "./dto/create-healthcare.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class HealthcareAdminController {
    private readonly healthcareService;
    constructor(healthcareService: HealthcareAdminService);
    create(body: CreateHealthcareDto, user: AuthUser): Promise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
    }>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<({
        users: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            fullName: string | null;
        }[];
        doctors: ({
            doctor: {
                id: string;
                name: string;
                province: string;
                telephone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            healthcareId: string;
            doctorId: string;
        })[];
    } & {
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
    })[]>;
}
//# sourceMappingURL=healthcare.admin.controller.d.ts.map