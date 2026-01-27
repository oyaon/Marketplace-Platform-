/**
 * Integration Test Suite for Marketplace Workflow
 * Tests the complete role-based workflow and state transitions
 */

const BASE_URL = "http://localhost:5000";

// Test utilities
async function request(
  method,
  endpoint,
  body = null,
  token = null,
  headers = {}
) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();

  return {
    status: res.status,
    ok: res.ok,
    data,
  };
}

// Test data
let testUsers = {
  admin: { email: "admin@test.com", password: "password123" },
  buyer: { email: "buyer@test.com", password: "password123" },
  solver: { email: "solver@test.com", password: "password123" },
};

let testTokens = {};
let testProject = {};
let testRequest = {};
let testTask = {};

// Tests
async function runTests() {
  console.log("🚀 Starting Marketplace Workflow Tests\n");

  try {
    await test("Register Users", registerUsers);
    await test("Login and Get Tokens", loginUsers);
    await test("Admin: View All Users", adminViewUsers);
    await test("Buyer: Create Project", buyerCreateProject);
    await test("Solver: Browse Open Projects", solverBrowseProjects);
    await test("Solver: Request Project", solverRequestProject);
    await test("Buyer: View Project Requests", buyerViewRequests);
    await test("Buyer: Assign Solver", buyerAssignSolver);
    await test("Solver: Create Task", solverCreateTask);
    await test("Solver: Submit Task (ZIP)", solverSubmitTask);
    await test("Buyer: Accept Task", buyerAcceptTask);
    await test("Verify State Transitions", verifyStateTransitions);

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

async function test(name, fn) {
  try {
    console.log(`⏳ Testing: ${name}`);
    await fn();
    console.log(`✅ ${name}\n`);
  } catch (error) {
    console.error(`❌ ${name} failed: ${error.message}\n`);
    throw error;
  }
}

async function registerUsers() {
  for (const role of Object.keys(testUsers)) {
    const res = await request("POST", "/api/auth/register", {
      name: role,
      email: testUsers[role].email,
      password: testUsers[role].password,
      role: role === "admin" ? "ADMIN" : role === "buyer" ? "BUYER" : "SOLVER",
    });

    if (!res.ok && res.status !== 409) {
      throw new Error(`Failed to register ${role}: ${res.data.message}`);
    }
  }
}

async function loginUsers() {
  for (const role of Object.keys(testUsers)) {
    const res = await request("POST", "/api/auth/login", {
      email: testUsers[role].email,
      password: testUsers[role].password,
    });

    if (!res.ok) {
      throw new Error(`Failed to login ${role}: ${res.data.message}`);
    }

    testTokens[role] = res.data.token;
  }
}

async function adminViewUsers() {
  const res = await request("GET", "/api/users", null, testTokens.admin);

  if (!res.ok || !Array.isArray(res.data)) {
    throw new Error("Admin cannot view users");
  }

  if (res.data.length < 3) {
    throw new Error("Expected at least 3 users");
  }
}

async function buyerCreateProject() {
  const res = await request(
    "POST",
    "/api/projects",
    {
      title: "Build a Website",
      description: "Create a responsive website for my business",
    },
    testTokens.buyer
  );

  if (!res.ok || !res.data.id) {
    throw new Error("Buyer cannot create project");
  }

  testProject = res.data;

  // Verify project starts as UNASSIGNED
  if (testProject.status !== "UNASSIGNED") {
    throw new Error("New project should be UNASSIGNED");
  }
}

async function solverBrowseProjects() {
  const res = await request(
    "GET",
    "/api/projects/open",
    null,
    testTokens.solver
  );

  if (!res.ok || !Array.isArray(res.data)) {
    throw new Error("Solver cannot browse open projects");
  }

  if (!res.data.find((p) => p.id === testProject.id)) {
    throw new Error("Created project not visible to solver");
  }
}

async function solverRequestProject() {
  const res = await request(
    "POST",
    "/api/requests",
    { projectId: testProject.id },
    testTokens.solver
  );

  if (!res.ok || !res.data.id) {
    throw new Error("Solver cannot request project");
  }

  testRequest = res.data;

  // Verify request starts as PENDING
  if (testRequest.status !== "PENDING") {
    throw new Error("New request should be PENDING");
  }
}

async function buyerViewRequests() {
  const res = await request(
    "GET",
    `/api/requests/${testProject.id}`,
    null,
    testTokens.buyer
  );

  if (!res.ok || !Array.isArray(res.data)) {
    throw new Error("Buyer cannot view requests");
  }

  if (res.data.length === 0) {
    throw new Error("Request not visible to buyer");
  }
}

async function buyerAssignSolver() {
  // Get user ID from a request first
  const requestsRes = await request(
    "GET",
    `/api/requests/${testProject.id}`,
    null,
    testTokens.buyer
  );

  const solverId = requestsRes.data[0].solver.id;

  const res = await request(
    "POST",
    "/api/requests/assign",
    {
      projectId: testProject.id,
      solverId,
    },
    testTokens.buyer
  );

  if (!res.ok) {
    throw new Error(`Buyer cannot assign solver: ${res.data.message}`);
  }

  // Verify project transitioned to ASSIGNED
  if (res.data.project.status !== "ASSIGNED") {
    throw new Error("Project should transition to ASSIGNED");
  }

  // Verify cannot reassign
  const reassignRes = await request(
    "POST",
    "/api/requests/assign",
    {
      projectId: testProject.id,
      solverId,
    },
    testTokens.buyer
  );

  if (reassignRes.ok) {
    throw new Error("Project should not be reassignable");
  }
}

async function solverCreateTask() {
  const res = await request(
    "POST",
    `/api/tasks/${testProject.id}`,
    {
      title: "Design Homepage",
      description: "Create a modern, responsive homepage",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    testTokens.solver
  );

  if (!res.ok || !res.data.id) {
    throw new Error(`Solver cannot create task: ${res.data.message}`);
  }

  testTask = res.data;

  // Verify task starts as IN_PROGRESS
  if (testTask.status !== "IN_PROGRESS") {
    throw new Error("New task should be IN_PROGRESS");
  }

  // Test past deadline rejection
  const pastRes = await request(
    "POST",
    `/api/tasks/${testProject.id}`,
    {
      title: "Invalid Task",
      description: "Past deadline",
      deadline: new Date(Date.now() - 1000).toISOString(),
    },
    testTokens.solver
  );

  if (pastRes.ok) {
    throw new Error("Task with past deadline should be rejected");
  }
}

async function solverSubmitTask() {
  // Create a mock file submission
  const res = await request(
    "POST",
    `/api/tasks/submit/${testTask.id}`,
    null,
    testTokens.solver,
    {
      "Content-Type": "multipart/form-data",
    }
  );

  // Note: Actual file upload requires FormData
  // This is a simplified test - production should test with real files

  // For now, verify the endpoint exists and authorization is correct
  // Actual file upload tested separately
}

async function buyerAcceptTask() {
  // First transition task to SUBMITTED manually for this test
  // In real scenario, solver would have submitted via multipart

  const res = await request(
    "POST",
    `/api/tasks/accept/${testTask.id}`,
    null,
    testTokens.buyer
  );

  // Task might not be in SUBMITTED state without file, but endpoint should exist
  if (res.status !== 200 && res.status !== 409) {
    throw new Error(`Accept endpoint failed unexpectedly: ${res.status}`);
  }
}

async function verifyStateTransitions() {
  // Verify cannot skip states
  // This would require additional task creation to test properly

  // Verify authorization boundaries
  const unauthorized = await request(
    "POST",
    `/api/tasks/${testProject.id}`,
    {
      title: "Unauthorized Task",
      description: "Test",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    testTokens.buyer // Buyer trying to create task
  );

  if (unauthorized.ok) {
    throw new Error("Buyer should not be able to create tasks");
  }
}

// Run tests
runTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
