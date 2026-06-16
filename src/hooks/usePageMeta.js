import { useEffect } from "react";
import { setPageMeta } from "@/lib/seo";

/**
 * Hook to declaratively set page metadata.
 * Accepts the same options as setPageMeta.
 */
export function usePageMeta(options) {
  useEffect(() => {
    setPageMeta(options);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.title, options?.description, options?.url]);
}