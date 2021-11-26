import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'
import '@typechain/hardhat'
import 'solidity-coverage'
import 'hardhat-docgen'
import '@openzeppelin/hardhat-upgrades'
import "@nomiclabs/hardhat-etherscan"

require('dotenv').config()
require('./tasks')

const chainIds: {[key:string]: number} = {
  ganache: 1337,
  dev: 44010,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3
}

// Ensure that we have all the environment variables we need.
/*
let mnemonic: string
if (!process.env.MNEMONIC) {
  throw new Error('Please set your MNEMONIC in a .env file')
} else {
  mnemonic = process.env.MNEMONIC
}
*/

let privateKeys = process.env.DEVNET_PRIVKEY?.split(",") || process.exit(-1);

let infuraApiKey: string
if (!process.env.INFURA_API_KEY) {
  throw new Error('Please set your INFURA_API_KEY in a .env file')
} else {
  infuraApiKey = process.env.INFURA_API_KEY
}

function createNetworkConfig (network:string) {
  let url = 'https://' + network + '.infura.io/v3/' + infuraApiKey
  if (network == "dev") {
      url = process.env.RPC || process.exit(-1)
  }
  return {
    accounts: privateKeys,
    chainId: chainIds[network],
    url,
    gas: 'auto',
    gasPrice: 100,
    gasLimit: 11111111
  }
}

module.exports = {
  defaultNetwork: 'hardhat',
  etherscan: {
    apiKey: process.env.SCAN_API_KEY
  },
  networks: {
    mainnet: createNetworkConfig('mainnet'),
    dev: createNetworkConfig('dev'),
    goerli: createNetworkConfig('goerli'),
    kovan: createNetworkConfig('kovan'),
    rinkeby: createNetworkConfig('rinkeby'),
    ropsten: createNetworkConfig('ropsten'),
    bsc_testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      chainId: 97,
      gasPrice: 'auto',
      // gasLimit: 10000000,
      //accounts: { mnemonic: mnemonic },
      accounts : privateKeys
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice: 'auto',
      // gasLimit: 10000000,
      accounts : privateKeys
    }
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.6',
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
  }
}
