import { fetchB2BPages, readB2BPage } from "./b2bPagination";

test("reads the bounded B2B page envelope", () => {
  expect(readB2BPage({ items: [{ id: "one" }], next_cursor: "next" })).toEqual({
    items: [{ id: "one" }],
    nextCursor: "next",
  });
  expect(readB2BPage({ items: [], next_cursor: null })).toEqual({
    items: [],
    nextCursor: null,
  });
});

test.each([
  null,
  [],
  {},
  { items: [] },
  { items: {}, next_cursor: null },
  { items: [], next_cursor: "" },
])(
  "rejects an invalid B2B page without guessing a compatibility shape",
  (payload) => {
    expect(() => readB2BPage(payload)).toThrow("invalid_b2b_page");
  }
);

test("rejects a continuation cursor when the page makes no progress", () => {
  expect(() => readB2BPage({ items: [], next_cursor: "next" })).toThrow(
    "invalid_b2b_page"
  );
});

test("collects bounded cursor pages for embedded B2B consumers", async () => {
  const get = jest
    .fn()
    .mockResolvedValueOnce({
      data: { items: [{ id: "three" }, { id: "two" }], next_cursor: "cursor-2" },
    })
    .mockResolvedValueOnce({
      data: { items: [{ id: "one" }], next_cursor: null },
    });

  await expect(
    fetchB2BPages({ get }, "/admin/b2b/work-orders", {
      params: { project_id: "project-1" },
    })
  ).resolves.toEqual([{ id: "three" }, { id: "two" }, { id: "one" }]);
  expect(get).toHaveBeenNthCalledWith(1, "/admin/b2b/work-orders", {
    params: { project_id: "project-1", limit: 100 },
  });
  expect(get).toHaveBeenNthCalledWith(2, "/admin/b2b/work-orders", {
    params: { project_id: "project-1", limit: 100, cursor: "cursor-2" },
  });
});

test("stops the embedded compatibility reader at the approved old cap", async () => {
  const items = Array.from({ length: 100 }, (_, index) => ({ id: `${index}` }));
  const get = jest.fn().mockResolvedValue({
    data: { items, next_cursor: "another-page" },
  });

  const result = await fetchB2BPages({ get }, "/admin/b2b/material-shortages", {
    maxItems: 150,
  });
  expect(result).toHaveLength(150);
  expect(get).toHaveBeenCalledTimes(2);
});

test("rejects a repeated cursor instead of looping forever", async () => {
  const get = jest.fn().mockResolvedValue({
    data: { items: [{ id: "one" }], next_cursor: "same" },
  });

  await expect(fetchB2BPages({ get }, "/admin/b2b/work-orders")).rejects.toThrow(
    "repeated_b2b_cursor"
  );
});
