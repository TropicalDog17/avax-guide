import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    local: {
      url: "http://127.0.0.1:64067/ext/bc/2GHMseet1iSGcyJAUZJpgErjkLvSHpbBJYJLvP9F39TVUw5Dku/rpc",
      chainId: 12345,
      accounts: ["0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027"],
    },
  },
};

export default config;
