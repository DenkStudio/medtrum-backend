import { MedicalEntriesService } from "./medical-entries.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class MedicalEntriesController {
    private readonly service;
    constructor(service: MedicalEntriesService);
    findMyEntries(user: {
        userId: string;
    }, query: QueryOptionsDto): Promise<import("../utils/paginate-query").PaginatedResult<any>>;
}
//# sourceMappingURL=medical-entries.controller.d.ts.map