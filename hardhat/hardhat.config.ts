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
