import { DoctorsAdminService } from "./doctors.admin.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class DoctorsAdminController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsAdminService);
    create(body: CreateDoctorDto, user: AuthUser): Promise<{
        healthcares: ({
            healthcare: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                code: string;
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
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
    }>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<{
        healthcares: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            code: string;
        }[];
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
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
    }[]>;
    findById(id: string, user: AuthUser): Promise<{
        healthcares: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            code: string;
        }[];
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
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
    }>;
    update(id: string, body: Partial<CreateDoctorDto>, user: AuthUser): Promise<{
        healthcares: ({
            healthcare: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                code: string;
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
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
    }>;
    delete(id: string, user: AuthUser): Promise<{
        id: string;
        name: string;
        province: string;
        telephone: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
    }>;
}
//# sourceMappingURL=doctors.admin.controller.d.ts.map