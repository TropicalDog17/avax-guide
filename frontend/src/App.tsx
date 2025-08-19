import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatUnits, BaseContract } from 'ethers';
import { GameItem } from './components/GameItem';
import { ConnectWallet } from './components/ConnectWallet';
import toast, { Toaster } from 'react-hot-toast';

interface GameItemsContract extends BaseContract {
  mint(account: string, id: number, amount: number, data: string): Promise<any>;
  owner(): Promise<string>;
  balanceOf(account: string, id: number): Promise<bigint>;
  safeTransferFrom(from: string, to: string, id: number, amount: number, data: string): Promise<any>;
}

const GAME_ITEMS_ADDRESS = '0x789a5FDac2b37FCD290fb2924382297A6AE65860';
const GAME_ITEMS_ABI = [
  'function SWORD() view returns (uint256)',
  'function SHIELD() view returns (uint256)',
  'function POTION() view returns (uint256)',
  'function LEGENDARY_ARMOR() view returns (uint256)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function mint(address account, uint256 id, uint256 amount, bytes memory data)',
  'function owner() view returns (address)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data)'
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
  const [contract, setContract] = useState<GameItemsContract | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);
  const [balances, setBalances] = useState<Record<number, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      const provider = new BrowserProvider((window as any).ethereum);
      setProvider(provider);
      const contract = new Contract(GAME_ITEMS_ADDRESS, GAME_ITEMS_ABI, provider);
      setContract(contract as unknown as GameItemsContract);
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send('eth_requestAccounts', []);
        setAddress(accounts[0]);
        
        if (contract) {
          const owner = await contract.owner();
          setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());
          await updateBalances(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const updateBalances = async (address: string) => {
    if (contract) {
      const newBalances: Record<number, string> = {};
      for (const item of ITEMS) {
        const balance = await contract.balanceOf(address, item.id);
        newBalances[item.id] = formatUnits(balance, 0);
      }
      setBalances(newBalances);
    }
  };

  const mintItem = async (id: number) => {
    if (!contract || !provider) {
      console.error('Contract or provider not initialized');
      return;
    }
    
    if (!isOwner) {
      console.error('Only the contract owner can mint items');
      alert('Only the contract owner can mint items');
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer) as unknown as GameItemsContract;
      const toastId = toast.loading(`Minting ${ITEMS[id].name}...`);
      const tx = await contractWithSigner.mint(address, id, 1, '0x');
      await tx.wait();
      await updateBalances(address);
      toast.success(`Successfully minted ${ITEMS[id].name}!`, { id: toastId });
    } catch (error) {
      console.error('Failed to mint:', error);
      toast.error('Failed to mint item. Make sure you are the contract owner and have enough funds.');
    }
  };

  const transferItem = async (id: number, to: string, amount: number) => {
    if (!contract || !provider || !address) {
      console.error('Contract, provider, or address not initialized');
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer) as unknown as GameItemsContract;
      const toastId = toast.loading(`Transferring ${ITEMS[id].name}...`);
      const tx = await contractWithSigner.safeTransferFrom(address, to, id, amount, '0x');
      await tx.wait();
      await updateBalances(address);
      toast.success(`Successfully transferred ${amount} ${ITEMS[id].name}!`, { id: toastId });
    } catch (error) {
      console.error('Failed to transfer:', error);
      toast.error('Failed to transfer item. Make sure you have enough balance and the recipient address is correct.');
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
          <h1 className="text-3xl font-bold text-gray-900">Game Items Inventory</h1>
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
              onMint={() => mintItem(item.id)}
              onTransfer={(to, amount) => transferItem(item.id, to, amount)}
              isOwner={isOwner}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

