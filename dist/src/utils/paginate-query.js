"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSearchFilter = buildSearchFilter;
exports.buildDateRangeFilter = buildDateRangeFilter;
exports.buildOrderBy = buildOrderBy;
function buildSearchFilter(search, searchableFields) {
    if (!search || searchableFields.length === 0)
        return undefined;
    return {
        OR: searchableFields.map((field) => ({
            [field]: { contains: search, mode: "insensitive" },
        })),
    };
}
function buildDateRangeFilter(from, to) {
    if (!from && !to)
        return undefined;
    const filter = {};
    if (from)
        filter.gte = new Date(from);
    if (to)
        filter.lte = new Date(to);
    return filter;
}
function buildOrderBy(sort) {
    if (!sort)
        return { createdAt: "desc" };
    const direction = sort.startsWith("-") ? "desc" : "asc";
    const field = sort.startsWith("-") ? sort.slice(1) : sort;
    return { [field]: direction };
}
//# sourceMappingURL=paginate-query.js.map