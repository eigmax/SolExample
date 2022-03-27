import { types } from 'hardhat/config'
import { waffle, ethers, network } from "hardhat";
const dotenv = require('dotenv')
const fs = require('fs')
const envConfig = dotenv.parse(fs.readFileSync('.env'))
for (const k in envConfig) {
	process.env[k] = envConfig[k]
}

const univ3prices = require('@thanpolas/univ3prices');

const {
    getToken,
    getLPTokensData,
    getLPTokensDataByLpAddress,
    getPriceUniswapV3,
    queryFactoryForLPUniV3,

} = require('@thanpolas/uniswap-chain-queries');

const main = async () => {

    // Uniswap V3 Factory on mainsted
    const factoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
    const tokenPair = [
        '0xaD6D458402F60fD3Bd25163575031ACDce07538D', // DAI
        '0xc778417E063141139Fce010982780140Aa0cD5Ab', // WETH
    ];

    //get all the pools for the given token pair
    const lpAddresses = await queryFactoryForLPUniV3(
        factoryAddress,
        waffle.provider,
        tokenPair,
    );

    console.log(lpAddresses);

    // get the details of the pool
    for (let lpAddress of lpAddresses) {
        const tokenPairPrice = await getPriceUniswapV3(lpAddress, waffle.provider, [18, 18]);
        console.log(tokenPairPrice)
    }

    // get the token information from the pool
    const DAI = await getToken(tokenPair[0], waffle.provider)
    const WETH = await getToken(tokenPair[1], waffle.provider)

    
    const sqrtPrice = 10000
    const price = univ3prices([DAI.decimals, WETH.decimals], sqrtPrice).toAuto();

    console.log(price);

    // mint new position
}

main().then(() => {
    console.log("Done")
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
