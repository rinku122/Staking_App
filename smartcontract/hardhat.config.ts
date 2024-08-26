import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
    ],
  },
  networks: {
    hardhat: {
      //We will increase the time manually.
      allowBlocksWithSameTimestamp: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // sepolia: {
    //   url: `https://sepolia.infura.io/v3/${process.env.INFURA_SEPOLIA}`,
    //   accounts: [process.env.PVT_KEY!],
    // },
  },
};

export default config;
