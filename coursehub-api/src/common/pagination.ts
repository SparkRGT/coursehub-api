export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export function resolvePage(page?: number): number {
  return page ?? DEFAULT_PAGE;
}

export function resolveLimit(limit?: number): number {
  return limit ?? DEFAULT_LIMIT;
}

export function buildPageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
