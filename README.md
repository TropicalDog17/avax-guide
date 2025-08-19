# Avalanche Subnet (Subnet‑EVM, PoA) – Local Setup Guide

This guide helps you set up a local Avalanche Subnet for development and deploy smart contracts using different toolchains.

## Token Standards & Resources

Key token standards and RMRK modules:

- [ERC20](https://eips.ethereum.org/EIPS/eip-20) - Fungible Token Standard
- [ERC721](https://eips.ethereum.org/EIPS/eip-721) - Non-Fungible Token Standard
- [ERC1155](https://eips.ethereum.org/EIPS/eip-1155) - Multi Token Standard
- [ERC7401 (Nestable)](https://evm.rmrk.app/rmrk-modules/nestable) - NFTs that can own other NFTs

## Table of Contents

1. [Setup and Installation](#prerequisites)
2. [Create and Deploy Subnet](#create--deploy-the-subnet)
3. [Configure Network](#1-network-configuration)
4. [Development Guides](#development-guides)
   - [Foundry Guide](./foundry/README.md)
   - [Hardhat Guide](./hardhat/README.md)
5. [Advanced Topics](#adding-new-validators)

## Prerequisites

- Linux/macOS
- Node.js ≥ 18, `npm` or `pnpm`
- **Avalanche‑CLI** – For subnet management
- **Foundry** (optional) – For Solidity development with Foundry
- **Hardhat** (optional) – For JavaScript/TypeScript development workflow

## Installation Guide

### 1. Node.js and npm

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version  # Should be ≥ 18
npm --version
```

### 2. Avalanche-CLI

```bash
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s

# Add to your PATH (add this to your ~/.bashrc or ~/.zshrc)
export PATH=$PATH:$HOME/.avalanche-cli/bin

# Verify installation
avalanche --version
```

### 3. Foundry (if using Solidity-native development)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
cast --version

# Initialize git submodules (required for Foundry dependencies)
git submodule update --init --recursive

# This will install:
# - forge-std (Foundry's standard library)
# - OpenZeppelin contracts
```

> **Note**: This project uses git submodules to manage Foundry dependencies. If you clone this repository, make sure to initialize the submodules to get all required dependencies.

### 4. Hardhat (if using TypeScript development)

```bash
# Create a new directory for your project
mkdir my-avalanche-project
cd my-avalanche-project

# Initialize a new npm project
npm init -y

# Install Hardhat and dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init
```

> **Tip**: For local development, using the pre-funded "ewoq" account is the easiest way to get started. This account comes with test tokens and is ready to use.
>
> **Security Note**: The "ewoq" private key is well-known and should ONLY be used for local development. Never use it on public networks or with real funds.

## Create + Deploy the Subnet

```bash
# Create a Subnet‑EVM chain (PoA)
avalanche blockchain create avaxvn

# Deploy to Local Network
avalanche blockchain deploy avaxvn
```

When done, CLI prints your RPC & Chain ID. Save these values for development.

## Important Configuration Values

After deploying your subnet, you'll get several important configuration values. Here's how to find and use them:

### 1. Network Configuration

To quickly get your network status, RPC URLs and node information:

```bash
# Show full network status with all details
avalanche network status

# Show only essential information (hide node tables)
avalanche network status --hide-table-nodes
```

This will show:

- Network health status
- Number of nodes and blockchains
- RPC URLs for each subnet
- Node IDs and their endpoints

Example output structure:

```
Network is Up:
  Number of Nodes: 4
  Number of Blockchains: 2
  Network Healthy: true
  Blockchains Healthy: true

+-------------------------------------------------------------------------------------------------+
|                                        SUBNET RPC URLS                                          |
+-----------+-------------------------------------------------------------------------------------+
| Localhost | http://127.0.0.1:9650/ext/bc/[BLOCKCHAIN-ID]/rpc                                    |
+-----------+-------------------------------------------------------------------------------------+

+------------------------------------------------------------------+
|                           PRIMARY NODES                           |
+------------------------------------------+-----------------------+
| NODE ID                                  | LOCALHOST ENDPOINT    |
+------------------------------------------+-----------------------+
| NodeID-[UNIQUE-NODE-ID]                  | http://127.0.0.1:9650 |
+------------------------------------------+-----------------------+
```

This output provides several important pieces of information:

1. **RPC URLs**: Each subnet has its own unique RPC URL with a specific blockchain ID. The URL format follows the pattern: `http://127.0.0.1:9650/ext/bc/[BLOCKCHAIN-ID]/rpc`

2. **Primary Nodes**: These are the main validator nodes running your local network. Each node has a unique NodeID and endpoint.

When setting up your development environment, use the RPC URL provided in the output for your specific subnet. The blockchain ID will be unique for each subnet you create.

- **RPC URL**: Found in the network status output under each subnet's section

  - Example: `http://127.0.0.1:9650/ext/bc/[BLOCKCHAIN-ID]/rpc`
  - Save this URL - you'll need it for all interactions with your subnet

- **Chain ID**: `12345`
  - This is fixed for local development
  - Used in wallet configuration and contract deployment
- **Network Name**: Your chosen subnet name (e.g., `avaxvn`)
  - The name you chose during creation
  - Used for wallet and configuration identification

### 2. Pre-funded Development Account

The subnet comes with a pre-funded account for development:

```bash
# Main funded account (ewoq)
Address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
Private Key: 56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
Initial Balance: 1,000,000 TEST
```

**Security Note**: This is a well-known development account. Never use it on public networks or with real funds.

### 3. Environment Variables

Set these for easy access in your development environment:

```bash
# Save in your ~/.bashrc or ~/.zshrc
export SUBNET_RPC="YOUR_RPC_URL"
export PK_EWOQ="56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027"
```

### 4. Quick Verification

Verify your configuration is working:

```bash
# Check if RPC is responding
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  $SUBNET_RPC

# Expected response: {"jsonrpc":"2.0","id":1,"result":"0x3039"} (12345 in hex)
```

Save these values carefully - you'll need them for:

- Connecting MetaMask or other wallets
- Deploying and interacting with smart contracts
- Setting up development environments (Hardhat/Foundry)
- Running scripts and tests

## Connect Tools & Wallet

### Add network to MetaMask (optional)

- **Network Name**: `avaxvn`
- **RPC URL**: Your RPC URL from above
- **Chain ID**: Your Chain ID from above
- **Currency Symbol**: `avaxvn`

### Quick Sanity Check

Set an env var for convenience:

```bash
export RPC="YOUR_RPC_URL_FROM_DEPLOYMENT_LOGS"
```

Test with Foundry's cast:

```bash
cast chain-id --rpc-url $RPC
cast block-number --rpc-url $RPC
```

## Development Guides

This repository contains three main components:

- [Foundry Guide](./foundry/README.md) - For Solidity-native development
- [Hardhat Guide](./hardhat/README.md) - For JavaScript/TypeScript development
- [Frontend UI](./frontend/README.md) - React-based UI for interacting with game items

### Frontend UI Setup

The frontend provides a visual interface for interacting with the GameItems contract:

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure the contract address:
- Open `src/App.tsx`
- Update `GAME_ITEMS_ADDRESS` with your deployed contract address

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and connect MetaMask to interact with your game items.

Features:
- Visual display of game items (Sword, Shield, Potion, Legendary Armor)
- Real-time balance updates
- Minting interface for contract owner
- MetaMask integration for transactions
- Responsive design for all devices

Choose the development environment that best fits your workflow.

## Teardown / Clean

```bash
# Stop local network
avalanche network stop

# Remove local run artifacts
rm -rf ~/.avalanche-cli/local/
```

## Adding New Validators

Your subnet starts with a single validator. Here's how to add more validators using the Validator Manager precompile:

### 1. Get the Validator Manager Contract

The Validator Manager is a precompiled contract at address: `0x0200000000000000000000000000000000000000`

Interface:

```solidity
interface IValidatorManager {
    function addValidator(address nodeID) external;
    function removeValidator(address nodeID) external;
    function getValidators() external view returns (address[] memory);
}
```

### 2. Generate New Node ID

1. Create a new node directory:

```bash
avalanche subnet create testNode
cd testNode
```

2. Generate node credentials:

```bash
avalanche key create
```

Save the NodeID - this is what you'll add as a validator.

### 3. Add the Validator

Using Foundry's cast (replace NODE_ID with your new node's ID):

```bash
cast send --rpc-url $RPC \
  --private-key $PK_EWOQ \
  0x0200000000000000000000000000000000000000 \
  "addValidator(address)" \
  $NODE_ID
```

Or using a deployment script:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IValidatorManager {
    function addValidator(address nodeID) external;
}

contract AddValidator {
    IValidatorManager constant validatorManager =
        IValidatorManager(0x0200000000000000000000000000000000000000);

    function addNewValidator(address nodeID) external {
        validatorManager.addValidator(nodeID);
    }
}
```

### 4. Verify Validators

Check current validators:

```bash
cast call --rpc-url $RPC \
  0x0200000000000000000000000000000000000000 \
  "getValidators()(address[])"
```

## References

- [RMRK Wizard](https://evm.rmrk.app/quick-start/wizard) - A convenient tool for building Modular NFT solutions with RMRK modules

_Choose your preferred development environment ([Foundry](./foundry/README.md) or [Hardhat](./hardhat/README.md)) to start deploying contracts!_
