export interface PaginatedResult<T> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: T[];
}
export declare function buildSearchFilter(search: string | undefined, searchableFields: string[]): {
    OR: Array<Record<string, {
        contains: string;
        mode: "insensitive";
    }>>;
} | undefined;
export declare function buildDateRangeFilter(from?: string, to?: string): {
    gte?: Date;
    lte?: Date;
} | undefined;
export declare function buildOrderBy(sort?: string): Record<string, "asc" | "desc"> | undefined;
//# sourceMappingURL=paginate-query.d.ts.map