import { useState } from 'react';
import { BoltIcon, ShieldCheckIcon, BeakerIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface GameItemProps {
  id: number;
  name: string;
  description: string;
  stats: Record<string, number | string>;
  color: string;
  balance: string;
  equippedAmount: string;
  onEquip: (amount: number) => void;
  onUnequip: (amount: number) => void;
  hasCharacter: boolean;
  onMint?: (amount: number) => void;
}

const icons = {
  0: BoltIcon,      // Sword
  1: ShieldCheckIcon,    // Shield
  2: BeakerIcon,    // Potion
  3: SparklesIcon,  // Legendary Armor
};

export function GameItem({ id, name, description, stats, color, balance, equippedAmount, onEquip, onUnequip, hasCharacter, onMint }: GameItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEquip, setShowEquip] = useState(false);
  const [showUnequip, setShowUnequip] = useState(false);
  const [showMint, setShowMint] = useState(false);
  const [equipAmount, setEquipAmount] = useState(1);
  const [unequipAmount, setUnequipAmount] = useState(1);
  const [mintAmount, setMintAmount] = useState(1);
  const Icon = icons[id as keyof typeof icons];

  const handleEquip = async () => {
    setIsLoading(true);
    try {
      await onEquip(equipAmount);
      setShowEquip(false);
      setEquipAmount(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnequip = async () => {
    setIsLoading(true);
    try {
      await onUnequip(unequipAmount);
      setShowUnequip(false);
      setUnequipAmount(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!onMint) return;
    setIsLoading(true);
    try {
      await onMint(mintAmount);
      setShowMint(false);
      setMintAmount(1);
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-medium">
                    Inventory: <span className="font-bold">{balance}</span>
                  </div>
                  {parseInt(balance) > 0 && hasCharacter && (
                    <span className="text-xs text-gray-500">(Available to equip)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Equipped: <span className="font-bold">{equippedAmount}</span>
                  </div>
                  {parseInt(equippedAmount) > 0 && hasCharacter && (
                    <span className="text-xs text-gray-500">(On your character)</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {onMint && (
                    <button
                      onClick={() => {
                        setShowMint(!showMint);
                        setShowEquip(false);
                        setShowUnequip(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        color === 'red' ? 'bg-red-100 hover:bg-red-200 text-red-700' :
                        color === 'blue' ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' :
                        color === 'green' ? 'bg-green-100 hover:bg-green-200 text-green-700' :
                        'bg-purple-100 hover:bg-purple-200 text-purple-700'
                      }`}
                    >
                      {showMint ? 'Cancel' : 'Mint'}
                    </button>
                  )}
                  {hasCharacter && parseInt(balance) > 0 && (
                    <button
                      onClick={() => {
                        setShowEquip(!showEquip);
                        setShowUnequip(false);
                        setShowMint(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        color === 'red' ? 'bg-red-100 hover:bg-red-200 text-red-700' :
                        color === 'blue' ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' :
                        color === 'green' ? 'bg-green-100 hover:bg-green-200 text-green-700' :
                        'bg-purple-100 hover:bg-purple-200 text-purple-700'
                      }`}
                    >
                      {showEquip ? 'Cancel' : 'Equip'}
                    </button>
                  )}
                </div>
                {hasCharacter && parseInt(equippedAmount) > 0 && (
                  <button
                    onClick={() => {
                      setShowUnequip(!showUnequip);
                      setShowEquip(false);
                      setShowMint(false);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                      color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                      color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                      'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {showUnequip ? 'Cancel' : 'Unequip'}
                  </button>
                )}
              </div>
            </div>
            
            {showEquip && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-600">How many {name}s would you like to equip to your character?</p>
                  <div className="flex gap-2">
                    <div className="flex flex-col">
                      <input
                        type="number"
                        min="1"
                        max={parseInt(balance)}
                        value={equipAmount}
                        onChange={(e) => setEquipAmount(Math.min(parseInt(e.target.value), parseInt(balance)))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500 mt-1">Max: {balance}</span>
                    </div>
                    <button
                      onClick={handleEquip}
                      disabled={isLoading || equipAmount <= 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        'bg-purple-600 hover:bg-purple-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {isLoading ? 'Equipping...' : 'Add to Character'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showUnequip && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-600">How many {name}s would you like to remove from your character?</p>
                  <div className="flex gap-2">
                    <div className="flex flex-col">
                      <input
                        type="number"
                        min="1"
                        max={parseInt(equippedAmount)}
                        value={unequipAmount}
                        onChange={(e) => setUnequipAmount(Math.min(parseInt(e.target.value), parseInt(equippedAmount)))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500 mt-1">Max: {equippedAmount}</span>
                    </div>
                    <button
                      onClick={handleUnequip}
                      disabled={isLoading || unequipAmount <= 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        'bg-purple-600 hover:bg-purple-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {isLoading ? 'Unequipping...' : 'Return to Inventory'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showMint && onMint && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-600">How many {name}s would you like to mint?</p>
                  <div className="flex gap-2">
                    <div className="flex flex-col">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(Math.min(parseInt(e.target.value) || 1, 10))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500 mt-1">Max: 10</span>
                    </div>
                    <button
                      onClick={handleMint}
                      disabled={isLoading || mintAmount <= 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        'bg-purple-600 hover:bg-purple-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {isLoading ? 'Minting...' : 'Mint Items'}
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
