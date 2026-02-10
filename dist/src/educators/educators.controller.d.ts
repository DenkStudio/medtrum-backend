import { EducatorsService } from "./educators.service";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class EducatorsController {
    private readonly educatorsService;
    constructor(educatorsService: EducatorsService);
    findMyPatients(user: AuthUser, query: QueryOptionsDto): Promise<import("../utils/paginate-query").PaginatedResult<any>>;
    findMyPatientById(user: AuthUser, id: string): Promise<{
        organization: {
            name: import(".prisma/client").$Enums.OrganizationName;
            id: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        healthcare: {
            name: string;
            id: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
        } | null;
        doctor: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            province: string;
            telephone: string | null;
        } | null;
        claims: {
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
        }[];
        hardwareSupplies: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.HardwareStatus;
            type: import(".prisma/client").$Enums.HardwareType;
            serialNumber: string;
            assignedDate: Date | null;
        }[];
        medicalEntries: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            createdById: string;
            visitDate: Date;
            notes: string;
        }[];
    } & {
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
    }>;
    updateMyPatient(user: AuthUser, id: string, dto: UpdatePatientDto): Promise<{
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
    }>;
}
//# sourceMappingURL=educators.controller.d.ts.map