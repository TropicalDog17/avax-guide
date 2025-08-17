# Hardhat Guide for Avalanche Subnet

This guide shows how to deploy and interact with smart contracts on your local Avalanche Subnet using Hardhat and TypeScript.

## Project Setup

1. Initialize the project:

```bash
npm init -y
npm i --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat init
```

2. Create `.env` file:

```ini
RPC_URL=http://127.0.0.1:43179/ext/bc/Kqw5jDZCFipdNe2tCwVoFPq2Zm4mwr5uL7x2et3bdnLKNAbxZ/rpc
PK_EWOQ=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

3. Configure `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    avaxvn: {
      url: process.env.RPC_URL!,
      chainId: 12345,
      accounts: [process.env.PK_EWOQ!],
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
│   └── MyToken.sol       # ERC-20 token contract
├── scripts/
│   ├── deploy-greeter.ts # Greeter deployment script
│   └── deploy-token.ts   # Token deployment script
├── .env                  # Environment variables
└── hardhat.config.ts     # Hardhat configuration
```

## Contract Source Code

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
  const g = await Greeter.deploy("Hello, Avalanche!");
  await g.deployed();
  console.log("Greeter:", g.address);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### deploy-token.ts

```typescript
import { ethers } from "hardhat";
async function main() {
  const Token = await ethers.getContractFactory("MyToken");
  const [signer] = await ethers.getSigners();
  const t = await Token.deploy(
    "TuanTran Token",
    "TT",
    signer.address,
    ethers.parseEther("1000000")
  );
  await t.deployed();
  console.log("Token:", t.address);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## Deployment

Deploy the contracts:

```bash
npx hardhat run scripts/deploy-greeter.ts --network avaxvn
npx hardhat run scripts/deploy-token.ts --network avaxvn
```

Save the deployed contract addresses!

## Contract Interaction

You can interact with the contracts using the Hardhat console or by creating scripts. Here are some examples:

### Using Hardhat Console

```bash
npx hardhat console --network avaxvn
```

### Read Greeting

```typescript
const g = await ethers.getContractAt("Greeter", "YOUR_GREETER_ADDRESS");
await g.greet();
```

### Set Greeting

```typescript
await g.setGreeting("Xin chao, Subnet!");
```

### Check Token Balance

```typescript
const t = await ethers.getContractAt("MyToken", "YOUR_TOKEN_ADDRESS");
await t.balanceOf("0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC");
```

### Transfer Tokens

```typescript
await t.transfer(
  "0x1111111111111111111111111111111111111111",
  ethers.parseEther("1000")
);
```

## Testing

Create tests in the `test` directory and run them with:

```bash
npx hardhat test
```

## Tips

- Use `hardhat-toolbox` for TypeScript support and testing utilities
- Save contract addresses after deployment
- Use environment variables for sensitive data
- The Hardhat console is great for quick interactions
- Use `ethers.parseEther()` for working with token amounts
