import assert from "node:assert/strict";
import test from "node:test";

const originalFetch = global.fetch;

test("login retries the backend fallback route when /auth/login returns 404", async () => {
  const calls = [];
  delete process.env.EXPO_PUBLIC_LOGIN_PATH;

  global.fetch = async (url) => {
    const requestUrl = String(url);
    calls.push(requestUrl);

    if (requestUrl.includes("/auth/login")) {
      return {
        ok: false,
        status: 404,
        headers: { get: () => "application/json" },
        json: async () => ({ message: "Not found" }),
      };
    }

    if (requestUrl.includes("/login")) {
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          token: "demo-token",
          user: { id: 23, name: "Test Teacher", role: "teacher" },
        }),
      };
    }

    throw new Error(`Unexpected URL: ${requestUrl}`);
  };

  try {
    const { login } = await import("../src/services/authApi.js");
    const result = await login("teacher@example.com", "secret");

    assert.equal(result.token, "demo-token");
    assert.equal(calls.length, 2);
    assert.ok(calls[0].includes("/auth/login"));
    assert.ok(calls[1].includes("/login"));
    assert.ok(!calls.some((call) => call.includes("%60")));
  } finally {
    delete process.env.EXPO_PUBLIC_LOGIN_PATH;
    global.fetch = originalFetch;
  }
});

test("login wraps invalid JSON auth failures as ApiError instead of crashing", async () => {
  delete process.env.EXPO_PUBLIC_LOGIN_PATH;
  global.fetch = async () => ({
    ok: false,
    status: 401,
    headers: { get: () => "application/json" },
    json: async () => {
      throw new SyntaxError("Unexpected token < in JSON at position 0");
    },
  });

  try {
    const { login } = await import("../src/services/authApi.js");

    await assert.rejects(login("teacher@example.com", "secret"), (error) => {
      assert.equal(error.name, "ApiError");
      assert.equal(error.status, 401);
      assert.match(error.message, /expired|login again/i);
      return true;
    });
  } finally {
    delete process.env.EXPO_PUBLIC_LOGIN_PATH;
    global.fetch = originalFetch;
  }
});
