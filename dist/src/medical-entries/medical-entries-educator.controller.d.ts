import { MedicalEntriesEducatorService } from "./medical-entries-educator.service";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { CreateMedicalEntryDto } from "./dto/create-medical-entry.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class MedicalEntriesEducatorController {
    private readonly service;
    constructor(service: MedicalEntriesEducatorService);
    create(dto: CreateMedicalEntryDto, user: AuthUser): Promise<{
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
    findByPatientId(patientId: string, query: QueryOptionsDto, user: AuthUser): Promise<import("../utils/paginate-query").PaginatedResult<any>>;
    findOne(id: string, user: AuthUser): Promise<{
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
//# sourceMappingURL=medical-entries-educator.controller.d.ts.map