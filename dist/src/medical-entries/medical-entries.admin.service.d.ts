import { PrismaService } from "../prisma/prisma.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { PaginatedResult } from "src/utils/paginate-query";
export declare class MedicalEntriesAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    findByPatientId(patientId: string, query: QueryOptionsDto): Promise<PaginatedResult<any>>;
    findOne(id: string): Promise<{
        patient: {
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
        createdBy: {
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
        patientId: string;
        createdById: string;
        visitDate: Date;
        notes: string;
    }>;
}
//# sourceMappingURL=medical-entries.admin.service.d.ts.map