import { ClaimStatus, DeliveryType } from "@prisma/client";
export declare class QueryOptionsDto {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    status?: ClaimStatus;
    role?: string;
    doctor?: string;
    healthcare?: string;
    organization?: string;
    type?: DeliveryType;
    from?: string;
    to?: string;
}
//# sourceMappingURL=query-options.dto.d.ts.map