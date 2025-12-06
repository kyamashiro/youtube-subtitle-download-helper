import { test, expect } from "vitest";
import { getParam } from "../url";

test("Query string retrieves videoid from URL.", () => {
  expect(
    getParam("https://www.youtube.com/watch?v=d0yGdNEWdn0")
  ).toBe("d0yGdNEWdn0");
});

test("Multi query string retrieves videoid from URL.", () => {
  expect(
    getParam(
      "https://www.youtube.com/watch?v=HayTt8clnKY&list=RDHayTt8clnKY&start_radio=1"
    )
  ).toBe("HayTt8clnKY");
});
