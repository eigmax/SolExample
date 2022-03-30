import { task } from 'hardhat/config'
require('dotenv').config()
const fs = require('fs')
import { encodePriceSqrt } from '../test/shared/encodePriceSqrt'
import { getMaxTick, getMinTick } from '../test/shared/ticks'

const {
    getToken,
    getLPTokensData,
    getLPTokensDataByLpAddress,
    getPriceUniswapV3,
    queryFactoryForLPUniV3,

} = require('@thanpolas/uniswap-chain-queries');

const pool = process.env.POOL as string;
const tokenA = process.env.TOKEN_A as string;
const tokenB = process.env.TOKEN_B as string;
const tokenC = process.env.TOKEN_C as string;
const fee = 3000;

task('createPool', 'Creates a pool for the given two tokens and fee')
	.setAction(async ({  }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		const result = await contract.createPool(tokenB, tokenC, fee, encodePriceSqrt(1, 1))
		console.log(result);
	})

task('mint', 'Creates a new position wrapped in a NFT')
	.addParam('amount1', 'The amount of tokenA to add as liquidity')
	.addParam('amount2', 'The amount of tokenB to add as liquidity')
	.setAction(async ({ amount1, amount2 }, { ethers }) => {
		const contract = await ethers.getContractAt('Pool', pool)
		const result = await contract.mintNewPosition(
			tokenB,
			tokenC,
			fee,
			getMinTick(fee),
            getMaxTick(fee),
			amount1,
			amount2
			)
        const receipt = await result.wait()
        const event = receipt?.events.pop();
        console.log(event)
	})

task('increase', 'Adds liquidity')
	.addParam('id', 'The NFT ID of the position')	
	.addParam('amount1', 'The amount of tokenA to add as liquidity')
	.addParam('amount2', 'The amount of tokenB to add as liquidity')
	.setAction(async ({ id, amount1, amount2 }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Pool', pool)
		const result = await contract.increaseLiquidity(
			id,
			amount1,
			amount2
			)
	})

task('decrease', 'Decreases liquidity')
	.addParam('id', 'The NFT ID of the position')	
	.addParam('liq', 'The amount of liquidity to decrease')
	.addParam('amount1', 'The minimum amount of tokenA')
	.addParam('amount2', 'The minimum amount of tokenB')
	.setAction(async ({ id, liq, amount1, amount2 }, { ethers }) => {
		const contract = await ethers.getContractAt('Pool', pool)
		await contract.decreaseLiquidity(
			id,
			liq,
			amount1,
			amount2
			)
	})

task('receive', 'Decreases liquidity')
	.addParam('id', 'The NFT ID of the position')	
	.setAction(async ({ id  }, { ethers }) => {
		const contract = await ethers.getContractAt('Pool', pool)
		let tx = await contract.receiveFees(id);
	})

task('getPoolAddress', 'Returns the position of deposit')
	.addParam('tokena', 'The tokenA of the liquidity pool')
	.addParam('tokenb', 'The tokenB of the liquidity pool')
	.setAction(async ({ tokena, tokenb, fee }, { ethers }) => {
        //get all the pools for the given token pair
        const lpAddresses = await queryFactoryForLPUniV3(
            process.env.UNISWAP_FACTORY,
            ethers.provider,
            [tokena, tokenb],
        );

        const token0 = await getToken(tokena, ethers.provider)
        const token1 = await getToken(tokenb, ethers.provider)
        // get the details of the pool and find the best fee, just for demo
        let currentBestPair
        for (let lpAddress of lpAddresses) {
            const tokenPairPrice = await getPriceUniswapV3(
                lpAddress, ethers.provider, [token0.decimals, token1.decimals]);
            // this is useless, we'll deposit more
            if (currentBestPair == undefined) {
                currentBestPair = tokenPairPrice
            } else if (currentBestPair.price > tokenPairPrice) {
                currentBestPair = tokenPairPrice
            }
            console.log(tokenPairPrice)
        }

        const bestFee = Number(currentBestPair.fee.slice(0, -1)) * 10000;
        console.log("current the best fee is ", bestFee)
		const contract = await ethers.getContractAt('Pool', pool)
		const poolAddress = await contract.getPoolAddress(tokena, tokenb, bestFee);
		console.log("Pool Address: ", poolAddress);	
	})

task('getDepositInfo', 'Returns the position of deposit')
	.addParam('id', 'The NFT ID of the position')
	.setAction(async ({ id }, { ethers }) => {
		const contract = await ethers.getContractAt('Pool', pool)
		const info = await contract.deposits(id);
		console.log(info, "\n",
                   "amountA", info.amountA.toString(),
                   "amountB", info.amountB.toString()
                   );	
	})

