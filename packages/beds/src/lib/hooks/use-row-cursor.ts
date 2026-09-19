"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

type RowCursor = { id: string; query: string };

function indexOfCursor(
  rows: readonly { id: string }[],
  query: string,
  cursor: RowCursor | null,
) {
  if (cursor === null || cursor.query !== query) return -1;
  return rows.findIndex((row) => row.id === cursor.id);
}

/**
 * Keeps active-descendant state tied to a row id and the query that selected
 * it, so a changed result set cannot commit a stale row.
 *
 * Adapted from beUI's MIT-licensed hook.
 */
export function useRowCursor(rows: readonly { id: string }[], query: string) {
  const [cursor, setCursor] = useState<RowCursor | null>(null);
  const latest = useRef({ rows, query });
  useLayoutEffect(() => {
    latest.current = { rows, query };
  });

  const cursorRow = indexOfCursor(rows, query, cursor);
  if (cursor !== null && cursorRow < 0) setCursor(null);

  const moveTo = useCallback(
    (id: string | null) =>
      setCursor(id === null ? null : { id, query: latest.current.query }),
    [],
  );

  const moveActive = useCallback((direction: 1 | -1) => {
    const { rows: live, query: liveQuery } = latest.current;
    const last = live.length - 1;
    if (last < 0) return;
    setCursor((current) => {
      const at = Math.max(indexOfCursor(live, liveQuery, current), 0);
      const next = Math.min(Math.max(at + direction, 0), last);
      return { id: live[next].id, query: liveQuery };
    });
  }, []);

  return { activeIndex: cursorRow < 0 ? 0 : cursorRow, moveTo, moveActive };
}
