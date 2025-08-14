# Avalanche Subnet (Subnet‑EVM, PoA) – Local Deploy + Smart Contracts (Greeter & ERC‑20)

This guide uses your **avaxvn** Subnet that you just created and deployed locally with Avalanche‑CLI. It shows how to:

1. Stand up the local Subnet (already done)
2. Connect a wallet / tools
3. Deploy a **Greeter** contract
4. Deploy an **ERC‑20** token
5. Interact via **Foundry (cast/anvil/forge)** _or_ **Hardhat/ethers**
6. Troubleshoot and tear down

> **Your live values (from your logs):**
>
> - **RPC**: `http://127.0.0.1:43179/ext/bc/Kqw5jDZCFipdNe2tCwVoFPq2Zm4mwr5uL7x2et3bdnLKNAbxZ/rpc`
> - **Chain ID**: `12345`
> - **Network name**: `avaxvn`
> - **Funded account (ewoq)**: `0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC`

---

## 0) Prereqs

- Linux/macOS, Node.js ≥ 18, `npm` or `pnpm`
- **Foundry** (recommended) – [https://book.getfoundry.sh/getting-started/installation](https://book.getfoundry.sh/getting-started/installation)
- **Avalanche‑CLI** – you already installed & deployed
- Optional: **Hardhat** if you prefer JS/TS workflow

> ⚠️ **Local dev private key**: Avalanche local stack exposes a well‑known dev key ("ewoq"). Use only in local environments. Never use it on public networks.

---

## 1) Create + Deploy the Subnet

```bash
# Create a Subnet‑EVM chain (PoA)
avalanche blockchain create avaxvn

# Deploy to Local Network
avalanche blockchain deploy avaxvn
```

When done, CLI prints your RPC & Chain ID (listed above). The node is running locally.

---

## 2) Connect Tools & Wallet

### 2.1 Add network to MetaMask (optional)

- **Network Name**: `avaxvn`
- **RPC URL**: `http://127.0.0.1:43179/ext/bc/Kqw5jDZCFipdNe2tCwVoFPq2Zm4mwr5uL7x2et3bdnLKNAbxZ/rpc`
- **Chain ID**: `12345`
- **Currency Symbol**: `avaxvn`

### 2.2 Quick sanity with Foundry

```bash
cast chain-id --rpc-url http://127.0.0.1:43179/ext/bc/Kqw5jDZCFipdNe2tCwVoFPq2Zm4mwr5uL7x2et3bdnLKNAbxZ/rpc
cast block-number --rpc-url $RPC
```

Set an env var for convenience:

```bash
export RPC="http://127.0.0.1:43179/ext/bc/Kqw5jDZCFipdNe2tCwVoFPq2Zm4mwr5uL7x2et3bdnLKNAbxZ/rpc"
```

---

## 3) Choose Your Toolchain

Pick **Foundry** or **Hardhat** (both shown).

---

## 4) Contracts

### 4.1 `Greeter.sol`

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

### 4.2 Minimal ERC‑20 (`MyToken.sol`)

Using OpenZeppelin:

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

- Example initial supply for testing: `1_000_000 ether` (18 decimals)
- Initial holder can be your dev account `0x8db9…52FC`

---

## 5) Deploy & Interact with **Foundry**

### 5.1 Init project

```bash
mkdir avaxvn-foundry && cd $_
forge init --no-commit
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit
mkdir -p src/script
```

Place `Greeter.sol` and `MyToken.sol` in `src/`.

### 5.2 Set up private key (local only)

Put your **local** dev key in an env var (never commit it):

```bash
export PK_EWOQ=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

### 5.3 Deployment scripts

`src/script/DeployGreeter.s.sol`:

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

`src/script/DeployToken.s.sol`:

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

### 5.4 Deploy

```bash
forge script src/script/DeployGreeter.s.sol \
  --rpc-url $RPC \
  --broadcast \
  --skip-simulation \
  --via-ir \
  -vvvv \
  --private-key $PK_EWOQ

forge script src/script/DeployToken.s.sol \
  --rpc-url $RPC \
  --broadcast \
  --skip-simulation \
  --via-ir \
  -vvvv \
  --private-key $PK_EWOQ
```

The script output shows deployed addresses (save them!).

### 5.5 Interact with **cast**

Assume `G=0xYourGreeterAddress` and `T=0xYourTokenAddress`.

- Read greeting:

```bash
cast call $G "greet()(string)" --rpc-url $RPC
```

- Set greeting:

```bash
cast send $G "setGreeting(string)" "Xin chao, Subnet!" \
  --rpc-url $RPC --private-key $PK_EWOQ
```

- Check ERC‑20 balance:

```bash
cast call $T "balanceOf(address)(uint256)" 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC --rpc-url $RPC
```

- Transfer tokens:

```bash
cast send $T "transfer(address,uint256)" 0x1111111111111111111111111111111111111111 1000ether \
  --rpc-url $RPC --private-key $PK_EWOQ
```

---

## 6) Deploy & Interact with **Hardhat** (alternative)

### 6.1 Init project

```bash
mkdir avaxvn-hardhat && cd $_
npm init -y
npm i --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat init # or: npx hardhat (create empty project)
```

### 6.2 Files

- Put `Greeter.sol` and `MyToken.sol` into `contracts/`.
- Create `.env`:

```ini
RPC_URL=http://127.0.0.1:43179/ext/bc/Kqw5jDZCFipdNe2tCwVoFPq2Zm4mwr5uL7x2et3bdnLKNAbxZ/rpc
PK_EWOQ=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

- `hardhat.config.ts` (or `.js`):

```ts
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

- `scripts/deploy-greeter.ts`:

```ts
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

- `scripts/deploy-token.ts`:

```ts
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

### 6.3 Deploy

```bash
npx hardhat run scripts/deploy-greeter.ts --network avaxvn
npx hardhat run scripts/deploy-token.ts   --network avaxvn
```

### 6.4 Interact (ethers REPL or scripts)

- Read greeting:

```ts
import { ethers } from "hardhat";
const g = await ethers.getContractAt("Greeter", "0xYourGreeter");
await g.greet();
```

- Set greeting:

```ts
await g.setGreeting("Xin chao, Subnet!");
```

- ERC‑20 balance & transfer:

```ts
const t = await ethers.getContractAt("MyToken", "0xYourToken");
await t.balanceOf("0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC");
await t.transfer(
  "0x1111111111111111111111111111111111111111",
  ethers.parseEther("1000")
);
```

---

## 7) JSON‑RPC Examples (pure curl)

- Get chain ID:

```bash
curl -s $RPC \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

- Get block number:

```bash
curl -s $RPC -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 8) Troubleshooting

- **`nonce too low` / tx stuck**: increment nonce or wait a block; check with `cast nonce <addr> --rpc-url $RPC`.
- **Gas issues**: Subnet‑EVM PoA generally accepts standard 1 gwei; Foundry/Hardhat chooses automatically.
- **Wrong chain ID in wallet**: ensure `12345` matches your network; mismatch causes signature/tx errors.
- **Node health**: if RPC stops responding, restart the local network:

  ```bash
  avalanche network stop
  avalanche blockchain deploy avaxvn
  ```

- **Ports in use**: stop previous local networks, or edit ports in `~/.avalanche-cli` run config.

---

## 9) Teardown / Clean

```bash
# Stop local network
avalanche network stop

# (Optional) Remove local run artifacts
rm -rf ~/.avalanche-cli/local/avaxvn-local-node-local-network
```

---

## 10) What’s next?

- Add more validators (PoA) via the Validator Manager precompile/contract (CLI scaffolded it for you).
- Try **precompiles** (Warp, etc.).
- Enable **ICM** flows between C‑Chain and your L1 (CLI already deployed messenger/registry for you).

_You now have a repeatable workflow to deploy Subnet‑EVM locally, push contracts, and interact via Foundry or Hardhat._
