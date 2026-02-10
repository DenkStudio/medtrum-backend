export interface PaginatedResult<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

export function buildSearchFilter(
  search: string | undefined,
  searchableFields: string[]
): { OR: Array<Record<string, { contains: string; mode: "insensitive" }>> } | undefined {
  if (!search || searchableFields.length === 0) return undefined;

  return {
    OR: searchableFields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" as const },
    })),
  };
}

export function buildDateRangeFilter(
  from?: string,
  to?: string
): { gte?: Date; lte?: Date } | undefined {
  if (!from && !to) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (from) filter.gte = new Date(from);
  if (to) filter.lte = new Date(to);
  return filter;
}

export function buildOrderBy(
  sort?: string
): Record<string, "asc" | "desc"> | undefined {
  if (!sort) return { createdAt: "desc" };

  const direction = sort.startsWith("-") ? "desc" : "asc";
  const field = sort.startsWith("-") ? sort.slice(1) : sort;

  return { [field]: direction };
}
