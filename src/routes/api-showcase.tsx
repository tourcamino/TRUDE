import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC, useTRPCClient } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Loader2, Users, FileText, AlertTriangle, CheckCircle, XCircle, RefreshCw, Plus, Edit, Trash2, ThumbsUp, Book } from "lucide-react";

function ApiShowcase() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // API Stats Query
  const { data: apiStats, isLoading: statsLoading, error: statsError } = useQuery(
    trpc.getApiStats.queryOptions(undefined, { refetchInterval: 5000 })
  );

  // Users Query with filters
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useQuery(
    trpc.getUsers.queryOptions({
      search: searchTerm || undefined,
      role: roleFilter as "admin" | "user" | "moderator" | undefined,
      status: statusFilter as "active" | "inactive" | undefined,
      limit: 10,
    })
  );

  // Single User Query
  const { 
    data: userData, 
    isLoading: userLoading, 
    error: userError 
  } = useQuery(
    trpc.getUserById.queryOptions(
      { id: selectedUserId as number },
      { enabled: !!selectedUserId }
    )
  );

  // Posts Query
  const { 
    data: postsData, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery(
    trpc.getPosts.queryOptions({ limit: 5 })
  );

  // Mutations
  const createUserMutation = useMutation(
    trpc.createUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["apiStats"] });
      },
    })
  );

  const updateUserMutation = useMutation(
    trpc.updateUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user", selectedUserId] });
      },
    })
  );

  const deleteUserMutation = useMutation(
    trpc.deleteUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["apiStats"] });
        setSelectedUserId(null);
      },
    })
  );

  const createPostMutation = useMutation(
    trpc.createPost.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    })
  );

  const likePostMutation = useMutation(
    trpc.likePost.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    })
  );

  const handleCreateUser = () => {
    const names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Tom Brown"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomEmail = `user${Date.now()}@example.com`;
    
    createUserMutation.mutate({
      name: randomName,
      email: randomEmail,
      role: "user",
    });
  };

  const handleUpdateUser = (userId: number) => {
    updateUserMutation.mutate({
      id: userId,
      status: "inactive",
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate({ id: userId });
    }
  };

  const handleCreatePost = () => {
    createPostMutation.mutate({
      title: "New Blog Post",
      content: "This is a sample blog post created through the API showcase.",
      author: "API Showcase",
    });
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate({
      postId,
      userId: 1, // Mock user ID
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">API Integration Showcase</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive demonstration of API integration patterns with real examples
          </p>
        </div>
        <Link to="/api-documentation">
          <Button variant="outline" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            View Documentation
          </Button>
        </Link>
      </div>

      {/* API Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            API Statistics (Auto-refreshing)
          </CardTitle>
          <CardDescription>Real-time API metrics and system status</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : statsError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error loading stats</AlertTitle>
              <AlertDescription>{statsError.message}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats?.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats?.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats?.totalPosts}</div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats?.totalLikes}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats?.apiCalls}</div>
                <div className="text-sm text-muted-foreground">API Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{apiStats?.uptime}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="posts">Posts & Content</TabsTrigger>
          <TabsTrigger value="errors">Error Handling</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users List
                </span>
                <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </CardTitle>
              <CardDescription>Demonstrates GET with filtering and pagination</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => refetchUsers()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : usersError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error loading users</AlertTitle>
                  <AlertDescription>{usersError.message}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {usersData?.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === "admin" ? "default" : user.role === "moderator" ? "secondary" : "outline"}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateUser(user.id);
                          }}
                          disabled={updateUserMutation.isPending}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {usersData?.users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found matching your criteria
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Single User Details */}
          {selectedUserId && (
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Demonstrates GET by ID</CardDescription>
              </CardHeader>
              <CardContent>
                {userLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : userError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error loading user</AlertTitle>
                    <AlertDescription>{userError.message}</AlertDescription>
                  </Alert>
                ) : userData ? (
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {userData.user.name}</div>
                    <div><strong>Email:</strong> {userData.user.email}</div>
                    <div><strong>Role:</strong> {userData.user.role}</div>
                    <div><strong>Status:</strong> {userData.user.status}</div>
                    <div><strong>Created:</strong> {new Date(userData.user.createdAt).toLocaleDateString()}</div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {/* Posts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Blog Posts
                </span>
                <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </CardTitle>
              <CardDescription>Demonstrates content management APIs</CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : postsError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error loading posts</AlertTitle>
                  <AlertDescription>{postsError.message}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {postsData?.posts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-muted-foreground mt-1">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>By {post.author}</span>
                            <span>{post.likes} likes</span>
                            <span>{post.comments} comments</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLikePost(post.id)}
                          disabled={likePostMutation.isPending}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Like
                        </Button>
                      </div>
                    </div>
                  ))}
                  {postsData?.posts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <ErrorHandlingDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/api-showcase")({
  component: ApiShowcase,
});

function ErrorHandlingDemo() {
  const client = useTRPCClient();
  const [errorResults, setErrorResults] = useState<Record<string, string>>({});

  const testNetworkError = async () => {
    try {
      const result = await client.simulateNetworkError.query({ failRate: 0.7 });
      setErrorResults(prev => ({ ...prev, network: "Success: " + result.message }));
    } catch (error: any) {
      setErrorResults(prev => ({ ...prev, network: "Error: " + error.message }));
    }
  };

  const testAuthError = async () => {
    try {
      const result = await client.simulateAuthError.query({ userRole: "guest" });
      setErrorResults(prev => ({ ...prev, auth: "Success: " + result.message }));
    } catch (error: any) {
      setErrorResults(prev => ({ ...prev, auth: "Error: " + error.message }));
    }
  };

  const testValidationError = async () => {
    try {
      const result = await client.simulateValidationError.mutate({
        email: "invalid-email",
        age: 15,
        username: "ab",
        password: "weak",
      });
      setErrorResults(prev => ({ ...prev, validation: "Success: " + result.message }));
    } catch (error: any) {
      setErrorResults(prev => ({ ...prev, validation: "Error: " + error.message }));
    }
  };

  const testNotFoundError = async () => {
    try {
      const result = await client.simulateNotFoundError.query({ resourceId: "999" });
      setErrorResults(prev => ({ ...prev, notFound: "Success: " + result.message }));
    } catch (error: any) {
      setErrorResults(prev => ({ ...prev, notFound: "Error: " + error.message }));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Demonstrations</CardTitle>
          <CardDescription>Test different error scenarios and see how they're handled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Button onClick={testNetworkError} className="w-full">
                Test Network Error
              </Button>
              {errorResults.network && (
                <Alert variant={errorResults.network.startsWith("Success") ? "default" : "destructive"}>
                  {errorResults.network.startsWith("Success") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{errorResults.network}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Button onClick={testAuthError} className="w-full">
                Test Authentication Error
              </Button>
              {errorResults.auth && (
                <Alert variant={errorResults.auth.startsWith("Success") ? "default" : "destructive"}>
                  {errorResults.auth.startsWith("Success") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{errorResults.auth}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Button onClick={testValidationError} className="w-full">
                Test Validation Error
              </Button>
              {errorResults.validation && (
                <Alert variant={errorResults.validation.startsWith("Success") ? "default" : "destructive"}>
                  {errorResults.validation.startsWith("Success") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{errorResults.validation}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Button onClick={testNotFoundError} className="w-full">
                Test Not Found Error
              </Button>
              {errorResults.notFound && (
                <Alert variant={errorResults.notFound.startsWith("Success") ? "default" : "destructive"}>
                  {errorResults.notFound.startsWith("Success") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{errorResults.notFound}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}