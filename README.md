# Avalanche Subnet (Subnet‑EVM, PoA) – Local Setup Guide

This guide helps you set up a local Avalanche Subnet for development. It covers:

1. Prerequisites and installation
2. Creating and deploying a local Subnet
3. Connecting tools and wallets
4. Choosing your development toolchain (Foundry or Hardhat)

## Prerequisites

- Linux/macOS
- Node.js ≥ 18, `npm` or `pnpm`
- **Avalanche‑CLI** – For subnet management
- **Foundry** (optional) – For Solidity development with Foundry
- **Hardhat** (optional) – For JavaScript/TypeScript development workflow

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

When you deploy your subnet, you'll get the following configuration values:

- **RPC URL**: Look for the HTTP URL in your deployment logs
- **Chain ID**: Default is 12345 for local development
- **Network name**: The name you chose (e.g., "avaxvn")
- **Funded account**: The pre-funded "ewoq" account address
- **Private key**: The "ewoq" development private key

Save these values as you'll need them to connect your wallet and deploy contracts.

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

This repository contains two implementation paths:

- [Foundry Guide](./foundry/README.md) - For Solidity-native development
- [Hardhat Guide](./hardhat/README.md) - For JavaScript/TypeScript development

Choose the one that best fits your workflow.

## Troubleshooting

- **`nonce too low` / tx stuck**: increment nonce or wait a block
- **Gas issues**: Subnet‑EVM PoA generally accepts standard 1 gwei
- **Wrong chain ID in wallet**: ensure `12345` matches your network
- **Node health**: if RPC stops responding, restart the local network:

  ```bash
  avalanche network stop
  avalanche blockchain deploy avaxvn
  ```

- **Ports in use**: stop previous local networks, or edit ports in `~/.avalanche-cli` run config

## Teardown / Clean

```bash
# Stop local network
avalanche network stop

# (Optional) Remove local run artifacts
rm -rf ~/.avalanche-cli/local/avaxvn-local-node-local-network
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

_Choose your preferred development environment ([Foundry](./foundry/README.md) or [Hardhat](./hardhat/README.md)) to start deploying contracts!_
