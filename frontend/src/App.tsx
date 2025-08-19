import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatUnits, BaseContract } from 'ethers';
import { GameItem } from './components/GameItem';
import { ConnectWallet } from './components/ConnectWallet';
import toast, { Toaster } from 'react-hot-toast';

interface CharacterNFTContract extends BaseContract {
  balanceOf(owner: string): Promise<bigint>;
  ownerOf(tokenId: number): Promise<string>;
  mint(to: string): Promise<any>;
  transferFrom(from: string, to: string, tokenId: number): Promise<any>;
}

interface InventoryNFTContract extends BaseContract {
  balanceOf(account: string, id: number): Promise<bigint>;
  mint(to: string, id: number, amount: number): Promise<any>;
  equipToCharacter(characterId: number, itemId: number, amount: number): Promise<any>;
  unequipFromCharacter(characterId: number, itemId: number, amount: number): Promise<any>;
  getCharacterItems(characterId: number, itemId: number): Promise<bigint>;
}

const CHARACTER_NFT_ADDRESS = '0xc5812E2F22177682ad9731330814F0444Ac23E9e';
const INVENTORY_NFT_ADDRESS = '0x37913A8722954A0736F79Db25c2e0635118eeDC8';
const CHARACTER_NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function mint(address to)',
  'function transferFrom(address from, address to, uint256 tokenId)'
];

const INVENTORY_NFT_ABI = [
  'function SWORD() view returns (uint256)',
  'function SHIELD() view returns (uint256)',
  'function POTION() view returns (uint256)',
  'function LEGENDARY_ARMOR() view returns (uint256)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function mint(address to, uint256 id, uint256 amount)',
  'function equipToCharacter(uint256 characterId, uint256 itemId, uint256 amount)',
  'function unequipFromCharacter(uint256 characterId, uint256 itemId, uint256 amount)',
  'function getCharacterItems(uint256 characterId, uint256 itemId) view returns (uint256)'
];

interface GameItemData {
  id: number;
  name: string;
  description: string;
  stats: Record<string, number | string>;
  color: string;
}

const ITEMS: GameItemData[] = [
  {
    id: 0,
    name: 'Flaming Sword',
    description: 'A legendary blade imbued with eternal flames',
    stats: { damage: 120, speed: 90, rarity: 'Epic' },
    color: 'red'
  },
  {
    id: 1,
    name: 'Guardian Shield',
    description: 'Ancient shield that can deflect the mightiest blows',
    stats: { defense: 100, weight: 70, rarity: 'Rare' },
    color: 'blue'
  },
  {
    id: 2,
    name: 'Health Potion',
    description: 'Mystical brew that restores vitality',
    stats: { healing: 80, duration: 30, rarity: 'Common' },
    color: 'green'
  },
  {
    id: 3,
    name: 'Dragon Scale Armor',
    description: 'Armor forged from ancient dragon scales',
    stats: { defense: 150, resistance: 100, rarity: 'Legendary' },
    color: 'purple'
  }
];

export function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [characterContract, setCharacterContract] = useState<CharacterNFTContract | null>(null);
  const [inventoryContract, setInventoryContract] = useState<InventoryNFTContract | null>(null);
  const [address, setAddress] = useState<string>('');
  const [characterId, setCharacterId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<number[]>([]);
  const [balances, setBalances] = useState<Record<number, string>>({});
  const [equippedItems, setEquippedItems] = useState<Record<number, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      const provider = new BrowserProvider((window as any).ethereum);
      setProvider(provider);
      
      const characterContract = new Contract(CHARACTER_NFT_ADDRESS, CHARACTER_NFT_ABI, provider);
      setCharacterContract(characterContract as unknown as CharacterNFTContract);
      
      const inventoryContract = new Contract(INVENTORY_NFT_ADDRESS, INVENTORY_NFT_ABI, provider);
      setInventoryContract(inventoryContract as unknown as InventoryNFTContract);
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const getAllCharacters = async (userAddress: string) => {
    if (!characterContract) return [];
    try {
      const balance = await characterContract.balanceOf(userAddress);
      if (balance === 0n) return [];

      const characters: number[] = [];
      let foundCount = 0;
      let tokenId = 1;
      const maxAttempts = 20; // Reasonable limit to prevent too many attempts

      while (foundCount < Number(balance) && tokenId <= maxAttempts) {
        try {
          const owner = await characterContract.ownerOf(tokenId);
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            characters.push(tokenId);
            foundCount++;
          }
        } catch (error) {
          // Skip non-existent tokens silently
        }
        tokenId++;
      }
      
      return characters;
    } catch (error) {
      console.error('Failed to get characters:', error);
      toast.error('Failed to fetch characters. Please try again.');
      return [];
    }
  };


  const connectWallet = async () => {
    if (provider && characterContract && inventoryContract) {
      try {
        setIsLoading(true);
        const accounts = await provider.send('eth_requestAccounts', []);
        const userAddress = accounts[0];
        setAddress(userAddress);
        
        // Check character ownership
        const userCharacters = await getAllCharacters(userAddress);
        setCharacters(userCharacters);
        setCharacterId(userCharacters.length > 0 ? userCharacters[0] : null);
        
        if (userCharacters.length > 0) {
          try {
            await updateEquippedItems(userCharacters[0]);
          } catch (error) {
            console.error('Failed to update equipped items:', error);
          }
        }
        
        try {
          await updateBalances(userAddress);
        } catch (error) {
          console.error('Failed to update balances:', error);
        }
              } catch (error) {
          console.error('Failed to connect wallet:', error);
          toast.error('Failed to connect wallet. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

  const updateBalances = async (address: string) => {
    if (inventoryContract) {
      const newBalances: Record<number, string> = {};
      for (const item of ITEMS) {
        const balance = await inventoryContract.balanceOf(address, item.id);
        newBalances[item.id] = formatUnits(balance, 0);
      }
      setBalances(newBalances);
    }
  };

  const updateEquippedItems = async (characterId: number) => {
    if (inventoryContract) {
      const newEquipped: Record<number, string> = {};
      for (const item of ITEMS) {
        const equipped = await inventoryContract.getCharacterItems(characterId, item.id);
        newEquipped[item.id] = formatUnits(equipped, 0);
      }
      setEquippedItems(newEquipped);
    }
  };

  const equipItem = async (id: number, amount: number) => {
    if (!inventoryContract || !provider || !characterId) {
      console.error('Contract, provider, or character not initialized');
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = inventoryContract.connect(signer) as unknown as InventoryNFTContract;
      const toastId = toast.loading(`Equipping ${ITEMS[id].name}...`);
      const tx = await contractWithSigner.equipToCharacter(characterId, id, amount);
      await tx.wait();
      await updateBalances(address);
      await updateEquippedItems(characterId);
      toast.success(`Successfully equipped ${ITEMS[id].name}!`, { id: toastId });
    } catch (error) {
      console.error('Failed to equip:', error);
      toast.error('Failed to equip item. Make sure you have enough items and own the character.');
    }
  };

  const unequipItem = async (id: number, amount: number) => {
    if (!inventoryContract || !provider || !characterId) {
      console.error('Contract, provider, or character not initialized');
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = inventoryContract.connect(signer) as unknown as InventoryNFTContract;
      const toastId = toast.loading(`Unequipping ${ITEMS[id].name}...`);
      const tx = await contractWithSigner.unequipFromCharacter(characterId, id, amount);
      await tx.wait();
      await updateBalances(address);
      await updateEquippedItems(characterId);
      toast.success(`Successfully unequipped ${ITEMS[id].name}!`, { id: toastId });
    } catch (error) {
      console.error('Failed to unequip:', error);
      toast.error('Failed to unequip item. Make sure you have enough equipped items and own the character.');
    }
  };

  const mintItem = async (id: number, amount: number) => {
    if (!inventoryContract || !provider || !address) {
      console.error('Contract, provider, or address not initialized');
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = inventoryContract.connect(signer) as unknown as InventoryNFTContract;
      const toastId = toast.loading(`Minting ${amount} ${ITEMS[id].name}...`);
      const tx = await contractWithSigner.mint(address, id, amount);
      await tx.wait();
      await updateBalances(address);
      toast.success(`Successfully minted ${amount} ${ITEMS[id].name}!`, { id: toastId });
    } catch (error) {
      console.error('Failed to mint:', error);
      toast.error('Failed to mint item. You can only mint up to 10 items at once.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Toaster position="top-right" toastOptions={{
        success: {
          style: {
            background: 'green',
            color: 'white',
          },
        },
        error: {
          style: {
            background: 'red',
            color: 'white',
          },
        },
        loading: {
          style: {
            background: 'blue',
            color: 'white',
          },
        },
      }} />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Items Inventory</h1>
            {isLoading ? (
              <div className="mt-2">
                <p className="text-gray-600">Loading characters...</p>
              </div>
            ) : characters.length > 0 ? (
              <div className="mt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <select 
                      value={characterId || ''} 
                      onChange={(e) => {
                        const newCharacterId = parseInt(e.target.value);
                        setCharacterId(newCharacterId);
                        updateEquippedItems(newCharacterId);
                      }}
                      className="px-3 py-2 border rounded-lg bg-white text-gray-700"
                      disabled={isLoading}
                    >
                      {characters.map((id) => (
                        <option key={id} value={id}>Character #{id}</option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (!characterContract || !provider || !characterId) return;
                        
                        const recipientAddress = prompt('Enter recipient address:');
                        if (!recipientAddress) return;
                        
                        try {
                          const signer = await provider.getSigner();
                          const contractWithSigner = characterContract.connect(signer) as unknown as CharacterNFTContract;
                          
                          const toastId = toast.loading('Transferring character...');
                          const tx = await contractWithSigner.transferFrom(address, recipientAddress, characterId);
                          await tx.wait();
                          
                          // Update the characters list
                          const userCharacters = await getAllCharacters(address);
                          setCharacters(userCharacters);
                          setCharacterId(userCharacters.length > 0 ? userCharacters[0] : null);
                          
                          toast.success('Character transferred successfully!', { id: toastId });
                        } catch (error) {
                          console.error('Failed to transfer character:', error);
                          toast.error('Failed to transfer character. Please try again.');
                        }
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Transfer Character
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Click "Equip" to add items to your character or "Unequip" to return them to inventory</p>
                </div>
              </div>
            ) : address ? (
              <div className="mt-2">
                <p className="text-gray-500">You don't have a character yet</p>
                <button
                  onClick={async () => {
                    if (!characterContract || !provider) return;
                    try {
                      const signer = await provider.getSigner();
                      const contractWithSigner = characterContract.connect(signer) as unknown as CharacterNFTContract;
                      const toastId = toast.loading('Minting your character...');
                      const tx = await contractWithSigner.mint(address);
                      await tx.wait();
                      const userCharacters = await getAllCharacters(address);
                      setCharacters(userCharacters);
                      setCharacterId(userCharacters[userCharacters.length - 1]);
                      toast.success('Character minted successfully!', { id: toastId });
                    } catch (error) {
                      console.error('Failed to mint character:', error);
                      toast.error('Failed to mint character. Please try again.');
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mint Character
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Connect your wallet to view your character and manage equipment</p>
            )}
          </div>
          <ConnectWallet
            isConnected={!!address}
            address={address}
            onConnect={connectWallet}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {ITEMS.map((item) => (
            <GameItem
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              stats={item.stats}
              color={item.color}
              balance={balances[item.id] || '0'}
              equippedAmount={equippedItems[item.id] || '0'}
              onEquip={(amount) => equipItem(item.id, amount)}
              onUnequip={(amount) => unequipItem(item.id, amount)}
              onMint={(amount) => mintItem(item.id, amount)}
              hasCharacter={characterId !== null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


