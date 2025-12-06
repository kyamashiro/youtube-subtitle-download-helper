import { expect, test } from "vitest";
import { getParam } from "./url";

test("Query string retrieves videoid from URL.", () => {
  expect(getParam("https://www.youtube.com/watch?v=d0yGdNEWdn0")).toBe(
    "d0yGdNEWdn0",
  );
});

test("returns null if query string does not contain parameter", () => {
  // expect(() => getParam('http://example.com')).toThrowError(
  //   'Url query parameter does not contain videoid.',
  // )

  // Modified to return null instead of throwing
  expect(getParam("http://example.com")).toBeNull();
});

test("Multi query string retrieves videoid from URL.", () => {
  expect(
    getParam(
      "https://www.youtube.com/watch?v=HayTt8clnKY&list=RDHayTt8clnKY&start_radio=1",
    ),
  ).toBe("HayTt8clnKY");
});
