# Hardhat Guide for Avalanche Subnet

This guide shows how to deploy and interact with smart contracts on your local Avalanche Subnet using Hardhat and TypeScript.

## Project Setup

1. Initialize the project and install dependencies:
```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @types/node typescript dotenv
npx hardhat init
```

2. Create TypeScript configuration (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

3. Set up environment variables:

Option 1 - Create `.env` file:
```ini
RPC_URL=http://127.0.0.1:50184/ext/bc/FHfgAKseBqDgobF7Qc2AUpHvpHUqDL1fYYX1cufjQrdjLKGGn/rpc
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

Option 2 - Set environment variables directly:
```bash
export RPC_URL=http://127.0.0.1:50184/ext/bc/FHfgAKseBqDgobF7Qc2AUpHvpHUqDL1fYYX1cufjQrdjLKGGn/rpc
export PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

4. Configure `hardhat.config.ts`:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    avaxvn: {
      url: process.env.RPC_URL ?? "",
      chainId: 12345,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

## Project Structure

```
hardhat/
├── contracts/
│   ├── Greeter.sol       # Simple greeter contract
│   ├── MyToken.sol       # ERC-20 token contract
│   └── GameItems.sol     # ERC-1155 game items contract
├── scripts/
│   ├── deploy-greeter.ts # Greeter deployment script
│   ├── deploy-token.ts   # Token deployment script
│   └── deploy-gameitems.ts # Game items deployment script
├── .env                  # Environment variables (optional)
├── tsconfig.json         # TypeScript configuration
└── hardhat.config.ts     # Hardhat configuration
```

## Contract Source Code

### GameItems.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameItems is ERC1155, Ownable {
    uint256 public constant SWORD = 0;
    uint256 public constant SHIELD = 1;
    uint256 public constant POTION = 2;
    uint256 public constant LEGENDARY_ARMOR = 3;

    string private _baseUri;

    constructor(string memory baseUri) ERC1155(baseUri) Ownable(msg.sender) {
        _baseUri = baseUri;
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseUri, _toString(tokenId), ".json"));
    }
}
```

### Greeter.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Greeter {
    string private greeting;

    event GreetingChanged(address indexed by, string newGreeting);

    constructor(string memory _greeting) {
        greeting = _greeting;
    }

    function greet() external view returns (string memory) {
        return greeting;
    }

    function setGreeting(string calldata _greeting) external {
        greeting = _greeting;
        emit GreetingChanged(msg.sender, _greeting);
    }
}
```

### MyToken.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(string memory name_, string memory symbol_, address initialHolder, uint256 initialSupply)
        ERC20(name_, symbol_)
        Ownable(msg.sender)
    {
        _mint(initialHolder, initialSupply);
    }
}
```

## Deployment Scripts

### deploy-greeter.ts
```typescript
import { ethers } from "hardhat";

async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Avalanche!");
  await greeter.waitForDeployment();
  
  const address = await greeter.getAddress();
  console.log("Greeter deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### deploy-token.ts
```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("MyToken");
  
  const token = await Token.deploy(
    "TuanTran Token",
    "TT",
    deployer.address,
    ethers.parseEther("1000000")
  );
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log("Token deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Deployment

Deploy the contracts:
```bash
# Deploy Greeter
npx hardhat run scripts/deploy-greeter.ts --network avaxvn

# Deploy Token
npx hardhat run scripts/deploy-token.ts --network avaxvn

# Deploy Game Items
npx hardhat run scripts/deploy-gameitems.ts --network avaxvn
```

Save the deployed contract addresses!

## Contract Interaction

You can interact with the contracts using the Hardhat console or by creating scripts:

### Using Hardhat Console
```bash
npx hardhat console --network avaxvn
```

### Read Greeting
```typescript
const greeter = await ethers.getContractAt("Greeter", "YOUR_GREETER_ADDRESS");
await greeter.greet();
```

### Set Greeting
```typescript
await greeter.setGreeting("Xin chao, Subnet!");
```

### Check Token Balance
```typescript
const token = await ethers.getContractAt("MyToken", "YOUR_TOKEN_ADDRESS");
const [signer] = await ethers.getSigners();
await token.balanceOf(signer.address);
```

### Transfer Tokens
```typescript
await token.transfer(
  "0x1111111111111111111111111111111111111111",
  ethers.parseEther("1000")
);
```

### Game Items (ERC-1155) Interaction

```typescript
const gameItems = await ethers.getContractAt("GameItems", "YOUR_GAME_ITEMS_ADDRESS");

// Check balance of an item (SWORD = 0)
const [signer] = await ethers.getSigners();
const swordBalance = await gameItems.balanceOf(signer.address, 0);
console.log("SWORD balance:", swordBalance);

// Mint new items (requires owner)
await gameItems.mint(signer.address, 0, 10, "0x"); // Mint 10 SWORDs
await gameItems.mint(signer.address, 1, 5, "0x");  // Mint 5 SHIELDs

// Get item URI
const itemUri = await gameItems.uri(0);
console.log("Item URI:", itemUri);
```

## Testing

Create tests in the `test` directory and run them with:
```bash
npx hardhat test
```

## Troubleshooting

1. **Node.js Version Warning**:
   - Hardhat works best with LTS versions of Node.js
   - Current code is tested with Node.js v18.x

2. **Environment Variables**:
   - Make sure `RPC_URL` points to your subnet's RPC endpoint
   - Ensure `PRIVATE_KEY` is set correctly
   - When using `.env`, make sure the file is in the project root

3. **Common Errors**:
   - "Invalid RPC URL": Check your subnet's RPC endpoint
   - "Missing private key": Check environment variables
   - "Contract deployment failed": Check network connection

## Tips

- Use `hardhat-toolbox` for TypeScript support and testing utilities
- Save contract addresses after deployment
- Use environment variables for sensitive data
- The Hardhat console is great for quick interactions
- Use `ethers.parseEther()` for working with token amounts
- Always use `await contract.waitForDeployment()` after deployment