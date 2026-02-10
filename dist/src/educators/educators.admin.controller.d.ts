import { EducatorsAdminService } from "./educators.admin.service";
import { CreateEducatorDto } from "./dto/create-educator.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class EducatorsAdminController {
    private readonly educatorsService;
    constructor(educatorsService: EducatorsAdminService);
    create(body: CreateEducatorDto, user: AuthUser): Promise<{
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        userId: string | null;
    }>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<({
        patients: {
            id: string;
            province: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            fullName: string | null;
            phoneNumber: string | null;
            dni: string | null;
            address: string | null;
            birthDate: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        userId: string | null;
    })[]>;
    findById(id: string, user: AuthUser): Promise<{
        patients: {
            id: string;
            province: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            fullName: string | null;
            phoneNumber: string | null;
            dni: string | null;
            address: string | null;
            birthDate: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        userId: string | null;
    }>;
    update(id: string, body: Partial<CreateEducatorDto>, user: AuthUser): Promise<{
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        userId: string | null;
    }>;
    delete(id: string, user: AuthUser): Promise<{
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        userId: string | null;
    }>;
}
//# sourceMappingURL=educators.admin.controller.d.ts.map