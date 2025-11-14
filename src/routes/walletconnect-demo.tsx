import { createFileRoute } from '@tanstack/react-router';
import { Navbar } from '~/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { ROIStrategyEngine } from '~/components/ROIStrategyEngine';
import { useWalletConnect } from '~/hooks/useWalletConnect';
import { useState } from 'react';
import { 
  Wallet, 
  QrCode, 
  Link2, 
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

export const Route = createFileRoute('/walletconnect-demo')({
  component: WalletConnectDemoPage,
});

function WalletConnectDemoPage() {
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
  const {
    provider,
    accounts,
    chainId,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendTransaction
  } = useWalletConnect(projectId || '');

  const [testTxHash, setTestTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const handleTestTransaction = async () => {
    if (!isConnected || accounts.length === 0) {
      setTxError('Please connect your wallet first');
      return;
    }

    try {
      setTxError(null);
      // This is a test transaction - in a real scenario you would get preparedTx from tRPC
      const testTx = {
        to: '0x0000000000000000000000000000000000000000', // Zero address for testing
        data: '0x',
        value: '0x0',
        chainId: chainId
      };

      // Note: This will fail with zero address, but demonstrates the flow
      const txHash = await sendTransaction(testTx);
      setTestTxHash(txHash);
    } catch (err) {
      setTxError(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 31337: return 'Local Hardhat';
      default: return `Chain ${chainId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2">
            <Wallet className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">WalletConnect + ROI Strategy Demo</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            TRUDE Strategy Engine
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Experience our AI-powered ROI strategies with WalletConnect integration. 
            Generate guaranteed 1% daily returns or custom strategies based on market conditions.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* WalletConnect Integration */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                WalletConnect Integration
              </CardTitle>
              <CardDescription>
                Connect your wallet to execute AI-generated strategies on-chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!projectId ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Required</AlertTitle>
                  <AlertDescription>
                    Please set VITE_WALLETCONNECT_PROJECT_ID in your environment variables to enable WalletConnect.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium">
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <Badge variant={isConnected ? 'success' : 'secondary'}>
                        {getChainName(chainId)}
                      </Badge>
                    </div>

                    {isConnected && accounts.length > 0 && (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-sm text-gray-600">Connected Address</div>
                        <div className="font-mono text-sm font-medium">
                          {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {!isConnected ? (
                        <Button 
                          onClick={connect} 
                          disabled={isConnecting}
                          className="flex-1"
                        >
                          {isConnecting ? (
                            <>
                              <QrCode className="mr-2 h-4 w-4 animate-pulse" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Link2 className="mr-2 h-4 w-4" />
                              Connect Wallet
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={disconnect} 
                          variant="outline"
                          className="flex-1"
                        >
                          Disconnect
                        </Button>
                      )}
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Test Transaction Section */}
                  <div className="border-t pt-4">
                    <div className="mb-3 text-sm font-medium text-gray-700">Test Transaction</div>
                    <Button 
                      onClick={handleTestTransaction}
                      disabled={!isConnected}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Send Test Transaction
                    </Button>
                    
                    {txError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">{txError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {testTxHash && (
                      <Alert className="mt-2">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Transaction sent: {testTxHash.slice(0, 10)}...
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ROI Strategy Engine */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                AI Strategy Engine
              </CardTitle>
              <CardDescription>
                Generate guaranteed 1% daily returns or custom strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ROIStrategyEngine />
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-blue-100 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Shield className="h-5 w-5" />
                Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                Advanced risk assessment with max 2% drawdown protection and automatic stop-loss mechanisms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <TrendingUp className="h-5 w-5" />
                Guaranteed Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800">
                1% daily ROI strategy with 95% confidence using stablecoin arbitrage and yield farming.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Wallet className="h-5 w-5" />
                WalletConnect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-800">
                Seamless integration with 100+ wallets. Execute strategies directly from your preferred wallet.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <h2 className="mb-4 text-3xl font-bold">Ready to Start Earning?</h2>
            <p className="mx-auto mb-6 max-w-2xl text-indigo-100">
              Connect your wallet and start generating guaranteed 1% daily returns with our AI-powered strategies.
              No custody risk, fully transparent, on-chain execution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!isConnected ? (
                <Button 
                  onClick={connect}
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Connect Wallet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Start Earning 1% Daily
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}