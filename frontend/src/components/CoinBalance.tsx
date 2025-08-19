import { useState } from 'react';
import { formatUnits } from 'ethers';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface CoinBalanceProps {
  balance: bigint;
  symbol: string;
  onTransfer?: (amount: bigint, recipient: string) => Promise<void>;
  onMint?: (amount: bigint) => Promise<void>;
}

export function CoinBalance({ balance, symbol, onTransfer, onMint }: CoinBalanceProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [transferAmount, setTransferAmount] = useState('0');
  const [mintAmount, setMintAmount] = useState('0');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMint, setShowMint] = useState(false);

  const handleTransfer = async () => {
    if (!onTransfer) return;
    
    try {
      setIsTransferring(true);
      const amount = BigInt(Math.round(Number(transferAmount))) * BigInt(10 ** 18);
      await onTransfer(amount, recipientAddress);
      setShowTransfer(false);
      setTransferAmount('0');
      setRecipientAddress('');
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleMint = async () => {
    if (!onMint) return;
    
    try {
      setIsMinting(true);
      const amount = BigInt(Math.round(Number(mintAmount))) * BigInt(10 ** 18);
      await onMint(amount);
      setShowMint(false);
      setMintAmount('0');
    } catch (error) {
      console.error('Minting failed:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Game Coins</h3>
            <p className="text-sm text-gray-500">{Math.round(Number(formatUnits(balance, 18))).toLocaleString()} {symbol}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowMint(!showMint)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Mint
          </button>
          <button
            onClick={() => setShowTransfer(!showTransfer)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
          >
            Transfer
          </button>
        </div>
      </div>

      {showTransfer && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                placeholder="0.0"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                Recipient Address
              </label>
              <input
                type="text"
                id="recipient"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                placeholder="0x..."
              />
            </div>
            <button
              onClick={handleTransfer}
              disabled={isTransferring || !transferAmount || !recipientAddress}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 disabled:opacity-50"
            >
              {isTransferring ? 'Transferring...' : 'Send Coins'}
            </button>
          </div>
        </div>
      )}

      {showMint && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-700">
                Amount to Mint
              </label>
              <input
                type="number"
                id="mintAmount"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="0.0"
                min="0"
                step="1"
              />
            </div>
            <button
              onClick={handleMint}
              disabled={isMinting || !mintAmount}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
            >
              {isMinting ? 'Minting...' : 'Mint Coins'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
