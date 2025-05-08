export function FormatSortKey(sort) {
  if(!sort || !sort.field) return "none";
  const direction = sort.desc ? "desc" : "asc";
  return `${sort.field}_${direction}`;
}

export function StableStringify(object) {
  return JSON.stringify(
    Object.keys(object).sort().reduce((acc, key) => {
      acc[key] = object[key];
      return acc;
    }, {})
  );
}

export function GenerateCacheKey({folderId, sortBy, filter}) {
  const filterKey = StableStringify(filter);
  const sortKey= FormatSortKey(sortBy);

  return `${folderId}|sort=${sortKey}|filter=${filterKey}`;
}

export function GeneratePaginationCache(paging={}) {
  const {current, pages, limit} = paging;

  return {
    currentStartIndex: current,
    totalPages: pages,
    pageSize: limit
  };
}
