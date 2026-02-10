import { ClaimCategory, ClaimErrorCode, SupplyType } from "@prisma/client";
export declare class CreateClaimDto {
    supply?: SupplyType;
    daysClaimed: number;
    description?: string;
    lotNumber?: string;
    needsReplacement?: boolean;
    claimCategory?: ClaimCategory;
    errorCode?: ClaimErrorCode;
    photoUrl?: string;
    failureDate?: string;
    colocationDate?: string;
}
//# sourceMappingURL=create-claim.dto.d.ts.map