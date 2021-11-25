import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

import { task, HardhatUserConfig } from "hardhat/config";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.6",
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
  },
  networks: {
      l1: {
          url: "http://localhost:7545",
          accounts: ["0xd26e62d7726062e735d6d130b3c624e97921eecc3bde9263b404121f6f0dccc4"]
      }
  }
};
