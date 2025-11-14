import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { randomBytes } from "crypto";

// Type definitions
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
};

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  createdAt: Date;
};

// Mock data storage (in real app, this would be a database)
let mockUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin", status: "active", createdAt: new Date("2024-01-15") },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user", status: "active", createdAt: new Date("2024-02-20") },
  { id: 3, name: "Carol Davis", email: "carol@example.com", role: "user", status: "inactive", createdAt: new Date("2024-03-10") },
  { id: 4, name: "David Wilson", email: "david@example.com", role: "moderator", status: "active", createdAt: new Date("2024-04-05") },
  { id: 5, name: "Eva Brown", email: "eva@example.com", role: "user", status: "active", createdAt: new Date("2024-05-12") },
];

let mockPosts = [
  { id: 1, title: "Getting Started with React", content: "Learn the basics of React development", author: "Alice Johnson", likes: 42, comments: 8, createdAt: new Date("2024-06-01") },
  { id: 2, title: "Advanced TypeScript Patterns", content: "Deep dive into TypeScript advanced features", author: "Bob Smith", likes: 38, comments: 12, createdAt: new Date("2024-06-15") },
  { id: 3, title: "API Integration Best Practices", content: "How to properly integrate APIs in your application", author: "Carol Davis", likes: 55, comments: 15, createdAt: new Date("2024-07-01") },
];

let nextUserId = 6;
let nextPostId = 4;

export const createUser = baseProcedure
  .input(
    z.object({
      name: z.string().min(2).max(50),
      email: z.string().email(),
      role: z.enum(["admin", "user", "moderator"]).default("user"),
    })
  )
  .mutation(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Check if email already exists
    const existingUser = mockUsers.find(user => user.email === input.email);
    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }
    
    const newUser = {
      id: nextUserId++,
      name: input.name,
      email: input.email,
      role: input.role,
      status: "active" as const,
      createdAt: new Date(),
    };
    
    mockUsers.push(newUser);
    
    return {
      success: true,
      user: newUser,
    };
  });

export const updateUser = baseProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(2).max(50).optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "user", "moderator"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 400));
    
    const userIndex = mockUsers.findIndex(user => user.id === input.id);
    
    if (userIndex === -1) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    
    // Check if email already exists (excluding current user)
    if (input.email) {
      const existingUser = mockUsers.find(user => user.email === input.email && user.id !== input.id);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use by another user",
        });
      }
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex]!,
      ...input,
    };
    
    return {
      success: true,
      user: mockUsers[userIndex],
    };
  });

export const deleteUser = baseProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 300));
    
    const userIndex = mockUsers.findIndex(user => user.id === input.id);
    
    if (userIndex === -1) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    
    // Prevent deletion of admin users
    if (mockUsers[userIndex]!.role === "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot delete admin users",
      });
    }
    
    const deletedUser = mockUsers.splice(userIndex, 1)[0];
    
    return {
      success: true,
      user: deletedUser,
    };
  });

export const createPost = baseProcedure
  .input(
    z.object({
      title: z.string().min(5).max(100),
      content: z.string().min(10).max(1000),
      author: z.string().min(2).max(50),
    })
  )
  .mutation(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 700 + 400));
    
    const newPost = {
      id: nextPostId++,
      title: input.title,
      content: input.content,
      author: input.author,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
    };
    
    mockPosts.push(newPost);
    
    return {
      success: true,
      post: newPost,
    };
  });

export const likePost = baseProcedure
  .input(
    z.object({
      postId: z.number(),
      userId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200));
    
    const postIndex = mockPosts.findIndex(post => post.id === input.postId);
    
    if (postIndex === -1) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Post not found",
      });
    }
    
    if (mockPosts[postIndex]) {
      mockPosts[postIndex].likes += 1;
    }
    
    return {
      success: true,
      post: mockPosts[postIndex],
    };
  });

export const bulkUpdateUsers = baseProcedure
  .input(
    z.object({
      userIds: z.array(z.number()).min(1).max(10),
      updates: z.object({
        status: z.enum(["active", "inactive"]).optional(),
        role: z.enum(["admin", "user", "moderator"]).optional(),
      }),
    })
  )
  .mutation(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 800));
    
    const updatedUsers = [];
    
    for (const userId of input.userIds) {
      const userIndex = mockUsers.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        // Skip admin users for bulk updates
        if (mockUsers[userIndex] && mockUsers[userIndex].role === "admin" && input.updates.role && input.updates.role !== "admin") {
          continue;
        }
        
        if (mockUsers[userIndex]) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            ...input.updates,
          } as User;
        }
        
        updatedUsers.push(mockUsers[userIndex]);
      }
    }
    
    return {
      success: true,
      updatedCount: updatedUsers.length,
      users: updatedUsers,
    };
  });