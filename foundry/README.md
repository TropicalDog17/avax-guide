# Foundry Guide for Avalanche Subnet

This guide shows how to deploy and interact with smart contracts on your local Avalanche Subnet using Foundry.

## Project Structure

```
foundry/
├── src/
│   ├── ERC20Token.sol    # ERC-20 token contract
│   └── Greeter.sol       # Simple greeter contract
├── script/
│   ├── DeployERC20.s.sol    # Token deployment script
│   └── DeployGreeter.s.sol  # Greeter deployment script
└── foundry.toml          # Foundry configuration
```

## Setup

1. Make sure you have Foundry installed and your local Subnet running (see main README)

2. Set up your private key (local only):

```bash
export PK_EWOQ=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

3. Set your RPC URL:

```bash
export RPC="http://127.0.0.1:43179/ext/bc/Kqw5jDZCFipdNe2tCwVoFPq2Zm4mwr5uL7x2et3bdnLKNAbxZ/rpc"
```

## Deployment

### Deploy Greeter Contract

```bash
forge script src/script/DeployGreeter.s.sol \
  --rpc-url $RPC \
  --broadcast \
  --skip-simulation \
  --via-ir \
  -vvvv \
  --private-key $PK_EWOQ
```

### Deploy ERC-20 Token

```bash
forge script src/script/DeployERC20.s.sol \
  --rpc-url $RPC \
  --broadcast \
  --skip-simulation \
  --via-ir \
  -vvvv \
  --private-key $PK_EWOQ
```

Save the deployed contract addresses from the script output!

## Interaction with cast

Replace `$G` with your Greeter address and `$T` with your Token address in the following commands.

### Greeter Contract

Read the greeting:

```bash
cast call $G "greet()(string)" --rpc-url $RPC
```

Set a new greeting:

```bash
cast send $G "setGreeting(string)" "Xin chao, Subnet!" \
  --rpc-url $RPC --private-key $PK_EWOQ
```

### ERC-20 Token

Check balance:

```bash
cast call $T "balanceOf(address)(uint256)" 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC --rpc-url $RPC
```

Transfer tokens:

```bash
cast send $T "transfer(address,uint256)" 0x1111111111111111111111111111111111111111 1000ether \
  --rpc-url $RPC --private-key $PK_EWOQ
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
import {Greeter} from "src/Greeter.sol";

contract DeployGreeter is Script {
    function run() external returns (Greeter g) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        g = new Greeter("Hello, Avalanche!");
        vm.stopBroadcast();
    }
}
```

### DeployERC20.s.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "forge-std/Script.sol";
import {MyToken} from "src/MyToken.sol";

contract DeployToken is Script {
    function run() external returns (MyToken t) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        t = new MyToken("TuanTran Token", "TT", vm.addr(pk), 1_000_000 ether);
        vm.stopBroadcast();
    }
}
```

## Tips

- Use `-vvvv` for verbose output during deployment
- Save contract addresses after deployment
- The `--via-ir` flag enables the new IR-based pipeline for better optimization
- Use `--skip-simulation` for faster local deployments
