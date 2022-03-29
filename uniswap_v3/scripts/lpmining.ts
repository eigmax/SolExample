import { types } from 'hardhat/config'
import { waffle, ethers, network } from "hardhat";
const dotenv = require('dotenv')
const fs = require('fs')
require('dotenv').config()
import { getMaxTick, getMinTick } from '../test/shared/ticks'

const univ3prices = require('@thanpolas/univ3prices');

import { Pool } from '../typechain';

const {
    getToken,
    getLPTokensData,
    getLPTokensDataByLpAddress,
    getPriceUniswapV3,
    queryFactoryForLPUniV3,

} = require('@thanpolas/uniswap-chain-queries');

const FEES = {
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000,
};
const FEE_DECIMALS = 10000;
let admin

const main = async () => {

    // https://github.com/Uniswap/v3-periphery/blob/main/deploys.md
    [admin] = await ethers.getSigners()

    // Uniswap V3 Factory on mainsted
    const factoryAddress = process.env.UNISWAP_FACTORY;

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

    // get the details of the pool and find the best price
    let currentBestPair
    for (let lpAddress of lpAddresses) {
        const tokenPairPrice = await getPriceUniswapV3(lpAddress, waffle.provider, [18, 18]);
        if (currentBestPair == undefined) {
            currentBestPair = tokenPairPrice
        } else if (currentBestPair.price > tokenPairPrice) {
            currentBestPair = tokenPairPrice
        }
        console.log(tokenPairPrice)
    }

    // get the token information from the pool
    const token0 = await getToken(tokenPair[0], waffle.provider)
    const token1 = await getToken(tokenPair[1], waffle.provider)
    console.log(token0.decimals, token1.decimals)
    //const sqrtPrice = 10000
    //const price = univ3prices([token0.decimals, token1.decimals], sqrtPrice).toAuto();
    //console.log(price);
    const poolFac = await ethers.getContractFactory('Pool')
    const pool = await poolFac.deploy(
        process.env.UNISWAP_FACTORY,
        process.env.NONFUNGIBLE_MANAGER,
    ) as Pool;
    await pool.deployed()
    console.log("pool.address", pool.address)

    // 1. get or create pool
    const poolAddr = await pool.getPoolAddress(
        token0.address,
        token1.address,
        FEES.MEDIUM,
    );
    console.log(poolAddr)

    let amountA = 2000
    let amountB = 2000
    // 2. mint new position
    let tx = await pool.mintNewPosition(
        token0.address,
        token1.address,
        FEES.MEDIUM,
        getMinTick(3000),
        getMaxTick(3000),
        amountA,
        amountB,
    )

    // read minted tokenId
    let receipt = await tx.wait();
    let event = receipt.events?.pop();
    let tokenId = event?.args?.tokenId.toNumber()

    const deposit = await pool.deposits(tokenId)
    if (!deposit.amountA.eq(amountA) || !deposit.amountB.eq(amountB)) {
        console.log("amount deposited is not enough");
        process.exit(-1)
    }

    // 3. add liqudity,
    tx = await pool.increaseLiquidity(
        tokenId,
        amountA,
        amountB,
    )
    receipt = await tx.wait()
    event = receipt.events?.pop();
    console.log("increaseLiquidity", event)

    // 4.remove liquidity
    tx = await pool.decreaseLiquidity(
        tokenId,
        1800,
        0,
        0,
    )
    receipt = await tx.wait()
    event = receipt.events?.pop();
    console.log("decreaseLiquidity", event)

    // 5. receive fee
    const balanceA = await token0.balanceOf(admin.address)
    const balanceB = await token0.balanceOf(admin.address)
    let res = await pool.receiveFees(tokenId)
    await res.wait()
    console.log(token0.balnaceOf(admin.address))
    console.log(token1.balnaceOf(admin.address))
}

main().then(() => {
    console.log("Done")
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
