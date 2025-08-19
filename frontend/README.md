# Game Items Frontend

A modern React-based UI for interacting with the GameItems ERC1155 contract on your Avalanche subnet.

## Features

- 🎮 Visual display of game items (Sword, Shield, Potion, Legendary Armor)
- 💰 Real-time balance updates
- 🔨 Minting interface for contract owner
- 🦊 MetaMask integration
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with Vite for fast development

## Prerequisites

- Node.js ≥ 18
- npm or yarn
- MetaMask browser extension
- A running Avalanche subnet with the GameItems contract deployed

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure the contract address:
- Open `src/App.tsx`
- Update `GAME_ITEMS_ADDRESS` with your deployed contract address

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Connecting to the Game

1. Make sure your MetaMask is connected to your Avalanche subnet:
   - Network Name: `avaxvn`
   - RPC URL: Your subnet's RPC URL
   - Chain ID: `12345`
   - Currency Symbol: `avaxvn`

2. Click "Connect Wallet" in the UI

3. As the contract owner, you can:
   - Mint new items
   - View all balances
   - Transfer items

4. As a regular user, you can:
   - View your item balances
   - See item metadata
   - Transfer items you own

## Development

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── GameItem.tsx     # Individual game item component
│   │   └── ConnectWallet.tsx # Wallet connection component
│   ├── App.tsx              # Main application component
│   └── index.css            # Global styles and Tailwind
├── public/                  # Static assets
└── index.html              # HTML template
```

### Customization

1. Modify item metadata in `metadata/*.json`
2. Update item icons in `GameItem.tsx`
3. Customize styles in `index.css`
4. Add new features in `App.tsx`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request