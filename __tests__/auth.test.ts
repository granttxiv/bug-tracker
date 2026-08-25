import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateToken, verifyToken } from "@/lib/auth/jwt";

describe("Auth - Password", () => {
  it("should hash and verify password", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject wrong password", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword("WrongPassword", hash);
    expect(isValid).toBe(false);
  });
});

describe("Auth - JWT", () => {
  it("should create and verify token", () => {
    const payload = { id: "user-123", role: "agent", email: "agent@example.com" } as const;
    const token = generateToken(payload);
    expect(token).toBeTruthy();

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe("user-123");
    expect(verified?.role).toBe("agent");
  });

  it("should reject invalid token", () => {
    const verified = verifyToken("invalid.token.here");
    expect(verified).toBeNull();
  });

  it("should reject expired token", () => {
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsInJvbGUiOiJhZ2VudCIsImlhdCI6MTAwLCJleHAiOjEwMH0.invalid";
    const verified = verifyToken(expiredToken);
    expect(verified).toBeNull();
  });
});
