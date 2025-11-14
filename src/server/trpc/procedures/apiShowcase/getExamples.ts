import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin", status: "active", createdAt: new Date("2024-01-15") },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user", status: "active", createdAt: new Date("2024-02-20") },
  { id: 3, name: "Carol Davis", email: "carol@example.com", role: "user", status: "inactive", createdAt: new Date("2024-03-10") },
  { id: 4, name: "David Wilson", email: "david@example.com", role: "moderator", status: "active", createdAt: new Date("2024-04-05") },
  { id: 5, name: "Eva Brown", email: "eva@example.com", role: "user", status: "active", createdAt: new Date("2024-05-12") },
];

const mockPosts = [
  { id: 1, title: "Getting Started with React", content: "Learn the basics of React development", author: "Alice Johnson", likes: 42, comments: 8, createdAt: new Date("2024-06-01") },
  { id: 2, title: "Advanced TypeScript Patterns", content: "Deep dive into TypeScript advanced features", author: "Bob Smith", likes: 38, comments: 12, createdAt: new Date("2024-06-15") },
  { id: 3, title: "API Integration Best Practices", content: "How to properly integrate APIs in your application", author: "Carol Davis", likes: 55, comments: 15, createdAt: new Date("2024-07-01") },
];

export const getUsers = baseProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
      role: z.enum(["admin", "user", "moderator"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
    })
  )
  .query(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    let filteredUsers = [...mockUsers];
    
    // Apply filters
    if (input.search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(input.search!.toLowerCase()) ||
        user.email.toLowerCase().includes(input.search!.toLowerCase())
      );
    }
    
    if (input.role) {
      filteredUsers = filteredUsers.filter(user => user.role === input.role);
    }
    
    if (input.status) {
      filteredUsers = filteredUsers.filter(user => user.status === input.status);
    }
    
    // Apply pagination
    const total = filteredUsers.length;
    const users = filteredUsers.slice(input.offset, input.offset + input.limit);
    
    return {
      users,
      total,
      hasMore: input.offset + input.limit < total,
    };
  });

export const getUserById = baseProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .query(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300));
    
    const user = mockUsers.find(u => u.id === input.id);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return { user };
  });

export const getPosts = baseProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(20).default(5),
      author: z.string().optional(),
      minLikes: z.number().min(0).default(0),
    })
  )
  .query(async ({ input }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 400));
    
    let filteredPosts = [...mockPosts];
    
    if (input.author) {
      filteredPosts = filteredPosts.filter(post => post.author === input.author);
    }
    
    if (input.minLikes > 0) {
      filteredPosts = filteredPosts.filter(post => post.likes >= input.minLikes);
    }
    
    const posts = filteredPosts.slice(0, input.limit);
    
    return { posts };
  });

export const getApiStats = baseProcedure
  .query(async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === "active").length,
      totalPosts: mockPosts.length,
      totalLikes: mockPosts.reduce((sum, post) => sum + post.likes, 0),
      apiCalls: Math.floor(Math.random() * 10000) + 1000,
      uptime: "99.9%",
    };
  });