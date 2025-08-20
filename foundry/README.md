# Foundry Guide for Avalanche Subnet

This guide shows how to deploy and interact with smart contracts on your local Avalanche Subnet using Foundry.

## Project Structure

```
foundry/
├── src/
│   ├── ERC20Token.sol    # ERC-20 token contract
│   ├── Greeter.sol       # Simple greeter contract
│   └── GameItems.sol     # ERC-1155 game items contract
├── script/
│   ├── DeployERC20.s.sol    # Token deployment script
│   ├── DeployGreeter.s.sol  # Greeter deployment script
│   └── DeployGameItems.s.sol # Game items deployment script
└── foundry.toml          # Foundry configuration
```

## Setup

1. Make sure you have Foundry installed and your local Subnet running (see main README)

2. Install dependencies:
```bash
forge install foundry-rs/forge-std@v1.7.6 --no-commit
forge install OpenZeppelin/openzeppelin-contracts@v5.0.1 --no-commit
```

3. Set up environment variables (replace RPC_URL with your subnet's RPC URL):
```bash
# Private key for local development only
export PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027

# RPC URL from your subnet deployment
export RPC_URL="http://127.0.0.1:50184/ext/bc/FHfgAKseBqDgobF7Qc2AUpHvpHUqDL1fYYX1cufjQrdjLKGGn/rpc"

# Optional greeting message
export GREETING="Hello, Avalanche!"
```

## Deployment

### Deploy Greeter Contract

```bash
forge script script/DeployGreeter.s.sol \
  --rpc-url $
   \
  --broadcast \
  --skip-simulation \
  --via-ir \
  -vvvv \
  --verify false
```

### Deploy ERC-20 Token

```bash
forge script script/DeployERC20.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --skip-simulation \
  --via-ir \
  -vvvv \
  --verify false
```

### Deploy Game Items (ERC-1155)

```bash
forge script script/DeployGameItems.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --skip-simulation \
  --via-ir \
  -vvvv \
  --verify false
```

Save the deployed contract addresses from the script output!

## Interaction with cast

Replace `$GREETER` with your Greeter address and `$TOKEN` with your Token address in the following commands.

### Greeter Contract

Read the greeting:
```bash
cast call $GREETER "greet()(string)" --rpc-url $RPC_URL
```

Set a new greeting:
```bash
cast send $GREETER "setGreeting(string)" "Xin chao, Subnet!" \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### ERC-20 Token

Check balance:
```bash
cast call $TOKEN "balanceOf(address)(uint256)" \
  $(cast wallet address $PRIVATE_KEY) \
  --rpc-url $RPC_URL
```

Transfer tokens:
```bash
cast send $TOKEN "transfer(address,uint256)" \
  0x1111111111111111111111111111111111111111 1000ether \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Game Items (ERC-1155)

Replace `$GAME_ITEMS` with your deployed GameItems contract address.

Check balance of an item:
```bash
cast call $GAME_ITEMS "balanceOf(address,uint256)(uint256)" \
  $(cast wallet address $PRIVATE_KEY) 0 \
  --rpc-url $RPC_URL
```

Mint a new item (requires owner):
```bash
cast send $GAME_ITEMS "mint(address,uint256,uint256,bytes)" \
  $(cast wallet address $PRIVATE_KEY) 0 10 0x \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

Get item URI:
```bash
cast call $GAME_ITEMS "uri(uint256)(string)" 0 --rpc-url $RPC_URL
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

### ERC20Token.sol
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

### DeployGreeter.s.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "forge-std/Script.sol";
import {Greeter} from "../src/Greeter.sol";

contract DeployGreeter is Script {
    function run() external returns (Greeter g) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory greeting = vm.envOr("GREETING", string("Hello, Avalanche!"));
        
        vm.startBroadcast(pk);
        g = new Greeter(greeting);
        vm.stopBroadcast();
        
        console2.log("Greeter deployed at:", address(g));
    }
}
```

### DeployERC20.s.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "forge-std/Script.sol";
import {MyToken} from "../src/ERC20Token.sol";

contract DeployToken is Script {
    function run() external returns (MyToken t) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        
        vm.startBroadcast(pk);
        t = new MyToken("TuanTran Token", "TT", deployer, 1_000_000 ether);
        vm.stopBroadcast();
        
        console2.log("Token deployed at:", address(t));
    }
}
```

## Troubleshooting

1. **Contract verification errors**: 
   - For local development, use `--verify false` to skip verification
   - Verification is only needed for public networks

2. **Environment variables**:
   - Make sure `PRIVATE_KEY` is set correctly
   - Update `RPC_URL` to match your subnet's RPC endpoint
   - Optional: Set `GREETING` for custom greeting message

3. **Common errors**:
   - "No associated wallet": Make sure `PRIVATE_KEY` is set
   - "Invalid RPC URL": Check your subnet's RPC endpoint
   - "Nonce too low": Wait for a block or use `--nonce <value>`

## Tips

- Use `-vvvv` for verbose output during deployment
- Save contract addresses after deployment
- The `--via-ir` flag enables the new IR-based pipeline for better optimization
- Use `--skip-simulation` for faster local deployments
- For script imports, use relative paths (e.g., `../src/Greeter.sol`)