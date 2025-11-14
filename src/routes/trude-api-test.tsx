import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Loader2, TestTube, AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Users, DollarSign, TrendingUp, Settings, Activity } from "lucide-react";

function TrudeAPITest() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState<Record<string, { status: 'pass' | 'fail' | 'running'; message: string; data?: any }>>({});
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  // Helper function to run tests
  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setRunningTests(prev => new Set(prev).add(testName));
    setTestResults(prev => ({ ...prev, [testName]: { status: 'running', message: 'Test in progress...' } }));

    try {
      const result = await testFunction();
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'pass', 
          message: '✅ Test passed',
          data: result 
        } 
      }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'fail', 
          message: `❌ Test failed: ${error.message}` 
        } 
      }));
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testName);
        return newSet;
      });
    }
  };

  // Test suite for Vault APIs
  const testVaultAPIs = async () => {
    // Test 1: Get all vaults
    await runTest('getVaults', async () => {
      const result = await trpc.getVaults.query({ limit: 10 });
      if (!result.vaults || !Array.isArray(result.vaults)) {
        throw new Error('Invalid response from getVaults');
      }
      return result;
    });

    // Test 2: Get vault by ID (if vaults exist)
    const vaultsResult = testResults.getVaults;
    if (vaultsResult?.status === 'pass' && vaultsResult.data?.vaults?.length > 0) {
      const vaultId = vaultsResult.data.vaults[0].id;
      
      await runTest('getVaultById', async () => {
        const result = await trpc.getVaultById.query({ vaultId });
        if (!result.vault) {
          throw new Error('Vault not found');
        }
        return result;
      });

      // Test 3: Get vault metrics
      await runTest('getVaultMetrics', async () => {
        const result = await trpc.getVaultMetrics.query({ vaultId });
        if (!result.metrics) {
          throw new Error('Metrics not found');
        }
        return result;
      });
    }
  };

  // Test suite for deposit and withdrawal APIs
  const testDepositWithdrawAPIs = async () => {
    // Test deposit preparation
    await runTest('prepareDeposit', async () => {
      const result = await trpc.prepareDeposit.mutate({
        userAddress: '0x742d35Cc6634C0532925a3b8D0D39D8F9F0aE2aB',
        vaultId: 1,
        amountDecimal: '100.5'
      });
      if (!result.prepared) {
        throw new Error('Deposit preparation failed');
      }
      return result;
    });

    // Test capital withdrawal preparation
    await runTest('requestWithdrawCapital', async () => {
      const result = await trpc.requestWithdrawCapital.mutate({
        userAddress: '0x742d35Cc6634C0532925a3b8D0D39D8F9F0aE2aB',
        vaultId: 1,
        amountDecimal: '50.25',
        signature: '0x1234567890abcdef',
        deadline: Math.floor(Date.now() / 1000) + 3600
      });
      return result;
    });
  };

  // Test suite for reporting APIs
  const testReportingAPIs = async () => {
    // Test dashboard stats
    await runTest('getDashboardStats', async () => {
      const result = await trpc.getDashboardStats.query();
      if (!result.stats) {
        throw new Error('Dashboard stats not available');
      }
      return result;
    });

    // Test revenue metrics
    await runTest('getRevenueMetrics', async () => {
      const result = await trpc.getRevenueMetrics.query({ rangeDays: 30 });
      if (!result.metrics) {
        throw new Error('Revenue metrics not available');
      }
      return result;
    });

    // Test user dashboard
    await runTest('getUserDashboard', async () => {
      const result = await trpc.getUserDashboard.query({ 
        userAddress: '0x742d35Cc6634C0532925a3b8D0D39D8F9F0aE2aB' 
      });
      return result;
    });
  };

  // Test suite for management APIs
  const testManagementAPIs = async () => {
    // Test factory settings
    await runTest('getFactorySettings', async () => {
      const result = await trpc.getFactorySettings.query();
      if (!result.settings) {
        throw new Error('Factory settings not available');
      }
      return result;
    });

    // Test token prices
    await runTest('getTokenPrices', async () => {
      const result = await trpc.getTokenPrices.query({ 
        symbols: ['ETH', 'USDC', 'USDT'] 
      });
      if (!result.prices) {
        throw new Error('Token prices not available');
      }
      return result;
    });

    // Test chain info
    await runTest('getChainInfo', async () => {
      const result = await trpc.getChainInfo.query();
      if (!result.chainInfo) {
        throw new Error('Chain info not available');
      }
      return result;
    });
  };

  // Test suite for utility APIs
  const testUtilityAPIs = async () => {
    // Test health check
    await runTest('healthCheck', async () => {
      const result = await trpc.healthCheck.query();
      if (result.status !== 'ok') {
        throw new Error('Health check failed');
      }
      return result;
    });
  };

  // Complete test of all APIs
  const runAllTests = async () => {
    setTestResults({});
    
    await testVaultAPIs();
    await testDepositWithdrawAPIs();
    await testReportingAPIs();
    await testManagementAPIs();
    await testUtilityAPIs();
  };

  // Specific tests for error cases
  const testErrorScenarios = async () => {
    // Test with invalid parameters
    await runTest('errorInvalidVaultId', async () => {
      try {
        await trpc.getVaultById.query({ vaultId: 999999 });
        throw new Error('Should have failed with invalid vault ID');
      } catch (error: any) {
        if (!error.message.includes('not found') && !error.message.includes('Vault')) {
          throw new Error('Unexpected error: ' + error.message);
        }
        return { errorHandled: true };
      }
    });

    // Test with invalid Ethereum address
    await runTest('errorInvalidAddress', async () => {
      try {
        await trpc.getUserDashboard.query({ 
          userAddress: 'invalid-address' 
        });
        throw new Error('Should have failed with invalid address');
      } catch (error: any) {
        return { errorHandled: true };
      }
    });
  };

  const TestResultDisplay = ({ testName }: { testName: string }) => {
    const result = testResults[testName];
    if (!result) return null;

    return (
      <div className="mt-2 p-3 rounded-lg border">
        <div className="flex items-center gap-2">
          {result.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {result.status === 'fail' && <XCircle className="h-5 w-5 text-red-500" />}
          {result.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          <span className="font-medium">{testName}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
        {result.data && (
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">TRuDe API Test Suite</h1>
        <p className="text-lg text-muted-foreground">
          Complete testing suite to verify all TRuDe APIs
        </p>
      </div>

      {/* Riepilogo test */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {Object.values(testResults).filter(r => r.status === 'pass').length}
              </div>
              <div className="text-sm text-muted-foreground">Tests Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {Object.values(testResults).filter(r => r.status === 'fail').length}
              </div>
              <div className="text-sm text-muted-foreground">Tests Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {Object.values(testResults).filter(r => r.status === 'running').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(testResults).length}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controlli principali */}
      <div className="flex gap-4 mb-8">
        <Button onClick={runAllTests} disabled={runningTests.size > 0}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Run All Tests
        </Button>
        <Button onClick={testErrorScenarios} variant="outline" disabled={runningTests.size > 0}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Test Errors
        </Button>
      </div>

      <Tabs defaultValue="vaults" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vaults">
            <Database className="h-4 w-4 mr-2" />
            Vault API
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <DollarSign className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="reporting">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reporting
          </TabsTrigger>
          <TabsTrigger value="management">
            <Settings className="h-4 w-4 mr-2" />
            Management
          </TabsTrigger>
          <TabsTrigger value="utility">
            <Activity className="h-4 w-4 mr-2" />
            Utility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vault API</CardTitle>
              <CardDescription>Test APIs for vault management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testVaultAPIs} disabled={runningTests.size > 0}>
                  Test Vault API
                </Button>
                <TestResultDisplay testName="getVaults" />
                <TestResultDisplay testName="getVaultById" />
                <TestResultDisplay testName="getVaultMetrics" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction API</CardTitle>
              <CardDescription>Test APIs for deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testDepositWithdrawAPIs} disabled={runningTests.size > 0}>
                  Test Transactions
                </Button>
                <TestResultDisplay testName="prepareDeposit" />
                <TestResultDisplay testName="requestWithdrawCapital" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporting API</CardTitle>
              <CardDescription>Test reporting and analytics APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testReportingAPIs} disabled={runningTests.size > 0}>
                  Test Reporting
                </Button>
                <TestResultDisplay testName="getDashboardStats" />
                <TestResultDisplay testName="getRevenueMetrics" />
                <TestResultDisplay testName="getUserDashboard" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Management API</CardTitle>
              <CardDescription>Test system management APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testManagementAPIs} disabled={runningTests.size > 0}>
                  Test Management
                </Button>
                <TestResultDisplay testName="getFactorySettings" />
                <TestResultDisplay testName="getTokenPrices" />
                <TestResultDisplay testName="getChainInfo" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utility API</CardTitle>
              <CardDescription>Test utility APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testUtilityAPIs} disabled={runningTests.size > 0}>
                  Test Utility
                </Button>
                <TestResultDisplay testName="healthCheck" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sezione Test Errori */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Handling Tests
          </CardTitle>
          <CardDescription>Verify how APIs handle errors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testErrorScenarios} variant="outline" disabled={runningTests.size > 0}>
              Test Errors
            </Button>
            <TestResultDisplay testName="errorInvalidVaultId" />
            <TestResultDisplay testName="errorInvalidAddress" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/trude-api-test")({
  component: TrudeAPITest,
});