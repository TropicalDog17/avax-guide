import { useState } from 'react';
import { BoltIcon, ShieldCheckIcon, BeakerIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface GameItemProps {
  id: number;
  name: string;
  description: string;
  stats: Record<string, number | string>;
  color: string;
  balance: string;
  onMint: () => void;
  onTransfer?: (to: string, amount: number) => void;
  isOwner: boolean;
}

const icons = {
  0: BoltIcon,      // Sword
  1: ShieldCheckIcon,    // Shield
  2: BeakerIcon,    // Potion
  3: SparklesIcon,  // Legendary Armor
};

export function GameItem({ id, name, description, stats, color, balance, onMint, onTransfer, isOwner }: GameItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState(1);
  const Icon = icons[id as keyof typeof icons];

  const handleMint = async () => {
    setIsLoading(true);
    try {
      await onMint();
    } finally {
      setIsLoading(false);
    }
  };

  const getBgColor = (itemColor: string) => {
    switch (itemColor) {
      case 'red': return 'bg-red-50 hover:bg-red-100';
      case 'blue': return 'bg-blue-50 hover:bg-blue-100';
      case 'green': return 'bg-green-50 hover:bg-green-100';
      case 'purple': return 'bg-purple-50 hover:bg-purple-100';
      default: return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  const getIconColor = (itemColor: string) => {
    switch (itemColor) {
      case 'red': return 'text-red-600';
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${getBgColor(color)}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-4 rounded-lg ${color === 'red' ? 'bg-red-100' : color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-green-100' : 'bg-purple-100'}`}>
          <Icon className={`w-10 h-10 ${getIconColor(color)} game-item-icon`} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{name}</h3>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium rarity-badge ${
                stats.rarity === 'Legendary' ? 'bg-purple-100 text-purple-800' :
                stats.rarity === 'Epic' ? 'bg-red-100 text-red-800' :
                stats.rarity === 'Rare' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {stats.rarity}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.entries(stats).map(([key, value]) => (
              key !== 'rarity' && (
                <div key={key} className="bg-white bg-opacity-50 rounded-lg p-2 stat-card">
                  <span className="text-gray-600 text-sm capitalize">{key}</span>
                  <div className="font-semibold mt-1">{value}</div>
                </div>
              )
            ))}
          </div>

          <div className="flex flex-col mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">
                Balance: <span className="font-bold">{balance}</span>
              </div>
              <div className="flex gap-2">
                {parseInt(balance) > 0 && onTransfer && (
                  <button
                    onClick={() => setShowTransfer(!showTransfer)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      color === 'red' ? 'bg-red-100 hover:bg-red-200 text-red-700' :
                      color === 'blue' ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' :
                      color === 'green' ? 'bg-green-100 hover:bg-green-200 text-green-700' :
                      'bg-purple-100 hover:bg-purple-200 text-purple-700'
                    }`}
                  >
                    {showTransfer ? 'Cancel' : 'Transfer'}
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleMint}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 mint-button ${
                      color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                      color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                      color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                      'bg-purple-600 hover:bg-purple-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isLoading ? 'Minting...' : 'Mint'}
                  </button>
                )}
              </div>
            </div>
            
            {showTransfer && onTransfer && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Recipient address (0x...)"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={parseInt(balance)}
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(Math.min(parseInt(e.target.value), parseInt(balance)))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (transferTo && transferAmount > 0) {
                          onTransfer(transferTo, transferAmount);
                          setShowTransfer(false);
                          setTransferTo('');
                          setTransferAmount(1);
                        }
                      }}
                      disabled={!transferTo || transferAmount <= 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        'bg-purple-600 hover:bg-purple-700 text-white'
                      } disabled:opacity-50`}
                    >
                      Confirm Transfer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
