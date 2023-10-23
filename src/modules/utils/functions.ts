export function getPageFooter(meta: BuilderFunctionMetadata) {
  return `Showing ${meta.curPage * meta.pageSize + 1} - ${
    (meta.curPage + 1) * meta.pageSize
  } of ${meta.total}`;
}
