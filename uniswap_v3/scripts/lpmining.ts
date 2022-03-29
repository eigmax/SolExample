import { types } from 'hardhat/config'
import { waffle, ethers, network } from "hardhat";
const dotenv = require('dotenv')
const fs = require('fs')
require('dotenv').config()
import { getMaxTick, getMinTick } from '../test/shared/ticks'
const PoolABI = require("../artifacts/contracts/Pool.sol/Pool.json");
const ERC20ABI = require("../artifacts/contracts/Token.sol/Token.json")

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
    console.log("Signer", admin.address)

    //console.log(PoolABI.abi)
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

    // get the details of the pool and find the best fee, just for demo
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
    const fee = currentBestPair.fee * FEE_DECIMALS
    console.log(fee)

    // get the token information from the pool
    const token0 = await getToken(tokenPair[0], waffle.provider)
    const token1 = await getToken(tokenPair[1], waffle.provider)
    console.log(token0)
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

    let amountA = 2000
    let amountB = 2000
    const tokenA = new ethers.Contract(token0.address, ERC20ABI.abi, admin)
    const tokenB = new ethers.Contract(token1.address, ERC20ABI.abi, admin)
    let balanceA = await tokenA.balanceOf(admin.address)
    let balanceB = await tokenB.balanceOf(admin.address)
    console.log("Balance A, B", balanceA.toString(), balanceB.toString())
    // 2. mint new position
    let tx = await pool.connect(admin).mintNewPosition(
        token0.address,
        token1.address,
        FEES.MEDIUM,
        getMinTick(3000),
        getMaxTick(3000),
        amountA,
        amountB,
    )
    console.log("mintNewPosition", tx)

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
    balanceA = await tokenA.balanceOf(admin.address)
    balanceB = await tokenB.balanceOf(admin.address)
    let res = await pool.receiveFees(tokenId)
    await res.wait()
    console.log(tokenA.balnaceOf(admin.address))
    console.log(tokenB.balnaceOf(admin.address))
}

main().then(() => {
    console.log("Done")
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
