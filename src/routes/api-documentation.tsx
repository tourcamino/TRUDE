import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Code, Copy, Check, Book, Zap, Shield, AlertTriangle } from "lucide-react";

function ApiDocumentation() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const apiEndpoints = [
    {
      method: "GET",
      path: "/api/getUsers",
      description: "Retrieve users with filtering and pagination",
      parameters: [
        { name: "limit", type: "number", required: false, default: "10", description: "Number of users to return" },
        { name: "offset", type: "number", required: false, default: "0", description: "Number of users to skip" },
        { name: "search", type: "string", required: false, description: "Search term for name or email" },
        { name: "role", type: "string", required: false, description: "Filter by user role (admin, user, moderator)" },
        { name: "status", type: "string", required: false, description: "Filter by user status (active, inactive)" },
      ],
      response: `{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 1,
  "hasMore": false
}`,
      example: `const { data } = await api.getUsers.query({
  limit: 10,
  search: "alice",
  role: "admin"
});`,
    },
    {
      method: "GET",
      path: "/api/getUserById",
      description: "Retrieve a single user by ID",
      parameters: [
        { name: "id", type: "number", required: true, description: "User ID" },
      ],
      response: `{
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}`,
      example: `const { data } = await api.getUserById.query({ id: 1 });`,
    },
    {
      method: "POST",
      path: "/api/createUser",
      description: "Create a new user",
      parameters: [
        { name: "name", type: "string", required: true, description: "User's full name (2-50 characters)" },
        { name: "email", type: "string", required: true, description: "Valid email address" },
        { name: "role", type: "string", required: false, default: "user", description: "User role (admin, user, moderator)" },
      ],
      response: `{
  "success": true,
  "user": {
    "id": 6,
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2024-07-01T12:00:00.000Z"
  }
}`,
      example: `const result = await api.createUser.mutate({
  name: "John Doe",
  email: "john@example.com",
  role: "user"
});`,
    },
    {
      method: "PUT",
      path: "/api/updateUser",
      description: "Update an existing user",
      parameters: [
        { name: "id", type: "number", required: true, description: "User ID to update" },
        { name: "name", type: "string", required: false, description: "New name (2-50 characters)" },
        { name: "email", type: "string", required: false, description: "New email address" },
        { name: "role", type: "string", required: false, description: "New role (admin, user, moderator)" },
        { name: "status", type: "string", required: false, description: "New status (active, inactive)" },
      ],
      response: `{
  "success": true,
  "user": {
    "id": 1,
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}`,
      example: `const result = await api.updateUser.mutate({
  id: 1,
  name: "Updated Name",
  status: "inactive"
});`,
    },
    {
      method: "DELETE",
      path: "/api/deleteUser",
      description: "Delete a user (admin users cannot be deleted)",
      parameters: [
        { name: "id", type: "number", required: true, description: "User ID to delete" },
      ],
      response: `{
  "success": true,
  "user": {
    "id": 1,
    "name": "Deleted User",
    "email": "deleted@example.com",
    "role": "user",
    "status": "inactive",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}`,
      example: `const result = await api.deleteUser.mutate({ id: 1 });`,
    },
  ];

  const errorCodes = [
    { code: "400", name: "Bad Request", description: "Invalid input parameters" },
    { code: "401", name: "Unauthorized", description: "Authentication required" },
    { code: "403", name: "Forbidden", description: "Insufficient permissions" },
    { code: "404", name: "Not Found", description: "Resource not found" },
    { code: "409", name: "Conflict", description: "Resource conflict (e.g., duplicate email)" },
    { code: "429", name: "Too Many Requests", description: "Rate limit exceeded" },
    { code: "500", name: "Internal Server Error", description: "Server error" },
    { code: "503", name: "Service Unavailable", description: "Service temporarily unavailable" },
  ];

  const bestPractices = [
    {
      title: "Error Handling",
      description: "Always implement proper error handling with try-catch blocks and user-friendly error messages.",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: "Loading States",
      description: "Show loading indicators during API calls to improve user experience.",
      icon: Zap,
      color: "text-blue-500",
    },
    {
      title: "Optimistic Updates",
      description: "Update UI immediately and rollback on error for better perceived performance.",
      icon: Shield,
      color: "text-green-500",
    },
    {
      title: "Caching Strategy",
      description: "Implement proper caching to reduce unnecessary API calls and improve performance.",
      icon: Book,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive guide to integrating with our API
        </p>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="errors">Error Codes</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {apiEndpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={endpoint.method === "GET" ? "default" : 
                              endpoint.method === "POST" ? "secondary" :
                              endpoint.method === "PUT" ? "outline" : "destructive"}
                    >
                      {endpoint.method}
                    </Badge>
                    <CardTitle className="text-lg">{endpoint.path}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                  >
                    {copied === `endpoint-${index}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="flex items-start gap-3 p-2 rounded-lg bg-muted">
                          <div className="min-w-[100px]">
                            <code className="text-sm font-mono">{param.name}</code>
                            <Badge variant={param.required ? "default" : "secondary"} className="ml-2">
                              {param.required ? "Required" : "Optional"}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-medium">Type: </span>
                              <code className="text-xs bg-background px-1 rounded">{param.type}</code>
                              {param.default && (
                                <span className="ml-2">
                                  <span className="font-medium">Default: </span>
                                  <code className="text-xs bg-background px-1 rounded">{param.default}</code>
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{param.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-2">Response</h4>
                  <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm">{endpoint.response}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Example Usage</h4>
                  <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                    <code className="text-sm">{endpoint.example}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>Common error codes and their meanings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorCodes.map((error, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="min-w-[60px]">
                      <Badge variant="destructive">{error.code}</Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{error.name}</h4>
                      <p className="text-sm text-muted-foreground">{error.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Response Format</CardTitle>
              <CardDescription>Standard error response structure</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                <code className="text-sm">{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "expected": "valid email address"
    }
  }
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic GET Request</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                  <code className="text-sm">{`// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['users', { limit: 10 }],
  queryFn: () => api.getUsers.query({ limit: 10 })
});

// Handle loading state
if (isLoading) return <div>Loading...</div>;

// Handle errors
if (error) return <div>Error: {error.message}</div>;

// Render data
return (
  <div>
    {data?.users.map(user => (
      <div key={user.id}>{user.name}</div>
    ))}
  </div>
);`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>POST Request with Mutation</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                  <code className="text-sm">{`// Using React Query Mutation
const createUserMutation = useMutation({
  mutationFn: api.createUser.mutate,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }
});

// Handle form submission
const handleSubmit = async (formData) => {
  try {
    await createUserMutation.mutateAsync(formData);
    toast.success('User created successfully!');
  } catch (error) {
    toast.error('Failed to create user');
  }
};`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Handling</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                  <code className="text-sm">{`// Comprehensive error handling
try {
  const result = await api.createUser.mutate(userData);
  return result;
} catch (error) {
  if (error.code === 'CONFLICT') {
    // Handle duplicate email
    toast.error('Email already exists');
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    setFormErrors(error.details);
  } else {
    // Handle generic errors
    toast.error('Something went wrong');
  }
  throw error;
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimistic Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                  <code className="text-sm">{`// Optimistic UI updates
const deleteUserMutation = useMutation({
  mutationFn: api.deleteUser.mutate,
  onMutate: async (deletedUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['users'] });
    
    // Snapshot previous value
    const previousUsers = queryClient.getQueryData(['users']);
    
    // Optimistically update
    queryClient.setQueryData(['users'], (old) => ({
      ...old,
      users: old.users.filter(u => u.id !== deletedUser.id)
    }));
    
    return { previousUsers };
  },
  onError: (err, deletedUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['users'], context.previousUsers);
  }
});`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {bestPractices.map((practice, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${practice.color}`}>
                      <practice.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{practice.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{practice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span>Use pagination for large datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span>Implement request debouncing for search inputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span>Use React Query's staleTime and cacheTime for optimal caching</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span>Implement proper error boundaries for graceful error handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span>Use TypeScript for type safety and better developer experience</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/api-documentation")({
  component: ApiDocumentation,
});