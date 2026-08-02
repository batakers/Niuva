const DEFAULT_LIMIT = 100;
const MAX_COMPATIBILITY_ITEMS = 500;

export function readB2BPage(payload) {
  if (
    !payload ||
    !Array.isArray(payload.items) ||
    !Object.prototype.hasOwnProperty.call(payload, "next_cursor") ||
    !(payload.next_cursor === null || typeof payload.next_cursor === "string")
  ) {
    throw new Error("invalid_b2b_page");
  }
  return { items: payload.items, nextCursor: payload.next_cursor || null };
}

export async function fetchB2BPages(
  client,
  endpoint,
  { params = {}, maxItems = MAX_COMPATIBILITY_ITEMS } = {}
) {
  const items = [];
  const seen = new Set();
  let cursor = null;

  do {
    const response = await client.get(endpoint, {
      params: { ...params, limit: DEFAULT_LIMIT, ...(cursor ? { cursor } : {}) },
    });
    const page = readB2BPage(response.data);
    items.push(...page.items.slice(0, Math.max(maxItems - items.length, 0)));
    if (!page.nextCursor || items.length >= maxItems) break;
    if (seen.has(page.nextCursor)) throw new Error("repeated_b2b_cursor");
    seen.add(page.nextCursor);
    cursor = page.nextCursor;
  } while (cursor);

  return items;
}
