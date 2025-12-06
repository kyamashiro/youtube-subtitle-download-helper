import { afterAll, afterEach, beforeAll, vi } from "vitest";

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
    lastError: null,
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
};

// @ts-ignore
global.chrome = mockChrome;

// Setup DOM
beforeAll(() => {
  Object.defineProperty(window, "location", {
    value: {
      href: "https://www.youtube.com/watch?v=test",
    },
    writable: true,
  });
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Clean up
});
