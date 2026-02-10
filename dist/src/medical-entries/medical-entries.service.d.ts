import { PrismaService } from "../prisma/prisma.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { PaginatedResult } from "src/utils/paginate-query";
export declare class MedicalEntriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findMyEntries(userId: string, query: QueryOptionsDto): Promise<PaginatedResult<any>>;
}
//# sourceMappingURL=medical-entries.service.d.ts.map