import { PrismaService } from "../prisma/prisma.service";
import { SupplyType } from "@prisma/client";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    updateBalanceDays(patientId: string, delta?: number, supply?: SupplyType): Promise<{
        patientId: string;
        balanceDaysSensor: number;
        balanceDaysParche: number;
    }>;
    findMyProfile(userId: string): Promise<{
        disposables: {
            itemName: string | null;
            quantity: number;
            deliveryDate: Date;
            assignedBy: {
                id: string;
                email: string;
                fullName: string | null;
            } | null;
            observations: string | null;
        }[];
        hardware: ({
            activityLogs: ({
                user: {
                    id: string;
                    email: string;
                    fullName: string | null;
                };
                previousUser: {
                    id: string;
                    email: string;
                    fullName: string | null;
                } | null;
                newUser: {
                    id: string;
                    email: string;
                    fullName: string | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                type: import(".prisma/client").$Enums.HardwareActivityType;
                date: Date;
                observations: string | null;
                hardwareId: string;
                previousUserId: string | null;
                newUserId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.HardwareStatus;
            type: import(".prisma/client").$Enums.HardwareType;
            serialNumber: string;
            assignedDate: Date | null;
        })[];
        organization: {
            name: import(".prisma/client").$Enums.OrganizationName;
            id: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        deliveries: ({
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
        })[];
        healthcare: {
            name: string;
            id: string;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
        } | null;
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
//# sourceMappingURL=users.service.d.ts.map