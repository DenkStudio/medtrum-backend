import { PrismaService } from "../prisma/prisma.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class DoctorsAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateDoctorDto, user: AuthUser): Promise<{
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
    update(id: string, data: Partial<CreateDoctorDto>, user: AuthUser): Promise<{
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
//# sourceMappingURL=doctors.admin.service.d.ts.map