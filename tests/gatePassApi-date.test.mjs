import assert from "node:assert/strict";
import test from "node:test";

const originalFetch = global.fetch;

test("gate pass create uses the issue endpoint and exact payload contract", async () => {
  global.fetch = async (url, options) => {
    const requestUrl = new URL(url);
    const body = JSON.parse(options.body);

    assert.equal(requestUrl.pathname, "/api/gate-pass");
    assert.equal(body.student_id, 101);
    assert.equal(body.reason, "Sudden headache / fever - parent pickup");
    assert.equal(body.guardian_name, "Ramesh Sharma");
    assert.equal(body.guardian_mobile, "9876543210");
    assert.equal(body.out_time, "11:30 AM");

    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({
        success: true,
        message: "Gate pass created successfully",
      }),
    };
  };

  try {
    const { gatePassApi } = await import("../src/services/gatePassApi.js");

    const result = await gatePassApi.create(
      {
        studentId: 101,
        reason: "Sudden headache / fever - parent pickup",
        guardianName: "Ramesh Sharma",
        guardianMobile: "9876543210",
        outTime: "11:30 AM",
      },
      { token: "demo" },
    );

    assert.deepEqual(result, {
      success: true,
      message: "Gate pass created successfully",
    });
  } finally {
    global.fetch = originalFetch;
  }
});
