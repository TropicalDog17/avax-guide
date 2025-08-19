interface ConnectWalletProps {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
}

export function ConnectWallet({ isConnected, address, onConnect }: ConnectWalletProps) {
  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      ) : (
        <button onClick={onConnect} className="btn-primary">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
