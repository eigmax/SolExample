import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'
import '@typechain/hardhat'
import 'solidity-coverage'
import 'hardhat-docgen'
import '@openzeppelin/hardhat-upgrades'
import "@nomiclabs/hardhat-etherscan"
import { task, HardhatUserConfig } from "hardhat/config";
require('dotenv').config()

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  },
  defaultNetwork: "ropsten",
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.DEVNET_PRIVKEY]
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.DEVNET_PRIVKEY]
    },
    metis: {
      url: "https://stardust.metis.io/?owner=588",
      accounts: [process.env.DEVNET_PRIVKEY]
    },
    tbsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.DEVNET_PRIVKEY]
    }, 
    tpolygon: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [process.env.DEVNET_PRIVKEY]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      ropsten: 'SAD1R3W6UGG6AMMR3NIQ5HX9RUM1JGX4IU',
    }
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 20,
    token: 'ETH',
    gasPriceApi: 'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice',
    coinmarketcap: 'f6673cc5-a673-4e07-8461-f7281a5de7d7',
    onlyCalledMethods: false
  }
}
