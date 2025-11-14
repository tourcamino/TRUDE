import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { randomBytes } from "crypto";

// Simulate different error scenarios for demonstration

export const simulateNetworkError = baseProcedure
  .input(
    z.object({
      failRate: z.number().min(0).max(1).default(0.3),
    })
  )
  .query(async ({ input }) => {
    // Simulate network failure
    if (Math.random() < input.failRate) {
      throw new TRPCError({
        code: "TIMEOUT",
        message: "Network timeout - server took too long to respond",
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      message: "Request completed successfully",
    };
  });

export const simulateAuthError = baseProcedure
  .input(
    z.object({
      requireAuth: z.boolean().default(true),
      userRole: z.enum(["admin", "user", "guest"]).default("guest"),
    })
  )
  .query(async ({ input }) => {
    // Simulate authentication failure
    if (input.requireAuth && input.userRole === "guest") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required - please log in to access this resource",
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      message: "Authentication successful",
      userRole: input.userRole,
    };
  });

export const simulateValidationError = baseProcedure
  .input(
    z.object({
      email: z.string().email("Invalid email format"),
      age: z.number().min(18, "Must be at least 18 years old").max(120, "Age must be realistic"),
      username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username too long"),
      password: z.string().min(8, "Password must be at least 8 characters").regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    })
  )
  .mutation(async ({ input }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Additional business logic validation
    if (input.username.toLowerCase().includes("admin")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Username cannot contain reserved words",
      });
    }
    
    return {
      success: true,
      message: "Validation passed",
      user: {
        email: input.email,
        age: input.age,
        username: input.username,
        // Never return password in response
      },
    };
  });

export const simulateRateLimitError = baseProcedure
  .input(
    z.object({
      requestCount: z.number().min(1).default(1),
    })
  )
  .query(async ({ input }) => {
    // Simulate rate limiting
    if (input.requestCount > 5) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded - too many requests. Please try again later.",
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      message: `Request ${input.requestCount} processed successfully`,
      remainingRequests: 5 - input.requestCount,
    };
  });

export const simulateServerError = baseProcedure
  .input(
    z.object({
      triggerError: z.boolean().default(false),
    })
  )
  .query(async ({ input }) => {
    // Simulate server internal error
    if (input.triggerError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error - something went wrong on our end",
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      message: "Server responded successfully",
    };
  });

export const simulateNotFoundError = baseProcedure
  .input(
    z.object({
      resourceId: z.string(),
      resourceType: z.enum(["user", "post", "product", "order"]).default("user"),
    })
  )
  .query(async ({ input }) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate resource not found
    if (input.resourceId === "999" || input.resourceId === "notfound") {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `${input.resourceType} with ID ${input.resourceId} not found`,
      });
    }
    
    return {
      success: true,
      message: `${input.resourceType} found successfully`,
      resourceId: input.resourceId,
    };
  });

export const simulateConflictError = baseProcedure
  .input(
    z.object({
      email: z.string().email(),
      username: z.string().min(3),
    })
  )
  .mutation(async ({ input }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate resource conflict
    const existingEmails = ["alice@example.com", "bob@example.com", "carol@example.com"];
    const existingUsernames = ["alice", "bob", "carol"];
    
    if (existingEmails.includes(input.email)) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Email ${input.email} is already registered`,
      });
    }
    
    if (existingUsernames.includes(input.username)) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Username ${input.username} is already taken`,
      });
    }
    
    return {
      success: true,
      message: "Registration successful",
      user: {
        email: input.email,
        username: input.username,
      },
    };
  });

export const simulateTimeoutError = baseProcedure
  .input(
    z.object({
      delay: z.number().min(100).max(10000).default(5000),
      timeout: z.number().min(100).max(5000).default(3000),
    })
  )
  .query(async ({ input }) => {
    // Simulate timeout scenario
    const startTime = Date.now();
    
    await new Promise(resolve => setTimeout(resolve, input.delay));
    
    const elapsedTime = Date.now() - startTime;
    
    if (elapsedTime > input.timeout) {
      throw new TRPCError({
        code: "TIMEOUT",
        message: `Request timed out after ${input.timeout}ms`,
      });
    }
    
    return {
      success: true,
      message: "Request completed within timeout",
      elapsedTime,
    };
  });