import { Link } from "@tanstack/react-router";
import { Wallet, LayoutDashboard, Code, Users, Settings, LogOut, Copy, Check, Zap, TestTube, Bot } from "lucide-react";
import { useState } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useWalletStore } from "~/stores/walletStore";
import { formatAddress, disconnectWallet } from "~/utils/walletConnection";
import { WalletConnectionModal } from "~/components/WalletConnectionModal";
import toast from "react-hot-toast";

export function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { address, isConnected } = useWalletStore();

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                TRUDE
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden items-center space-x-1 md:flex">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/developers"
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Code className="h-4 w-4" />
                <span>Developers</span>
              </Link>
              <Link
                to="/ai-execute-orders"
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Bot className="h-4 w-4" />
                <span>AI Execute</span>
              </Link>
              <Link
                to="/api-showcase"
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Zap className="h-4 w-4" />
                <span>API Showcase</span>
              </Link>
              <Link
                to="/trude-api-test"
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <TestTube className="h-4 w-4" />
                <span>TRuDe API Test</span>
              </Link>
              <Link
                to="/affiliates"
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Users className="h-4 w-4" />
                <span>Affiliates</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Wallet Button */}
            {isConnected && address ? (
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
                  <Wallet className="h-4 w-4" />
                  <span>{formatAddress(address)}</span>
                </MenuButton>
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <MenuItem>
                      <button
                        onClick={handleCopyAddress}
                        className="flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        {copiedAddress ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span>{copiedAddress ? "Copied!" : "Copy Address"}</span>
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={handleDisconnect}
                        className="flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Disconnect</span>
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <WalletConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
