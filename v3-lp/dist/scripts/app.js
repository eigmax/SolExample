"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const IUniswapV3Pool_json_1 = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/8f2ce165f78746f68d41a7b9f7f403dc");
// https://docs.uniswap.org/protocol/reference/deployments
const poolAddress = "0xb575417bD7980aCe6619a0f3a42ecb56eF093f88";
const poolContract = new ethers_1.ethers.Contract(poolAddress, IUniswapV3Pool_json_1.abi, provider);
async function getPoolImmutables() {
    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
        poolContract.factory(),
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.tickSpacing(),
        poolContract.maxLiquidityPerTick(),
    ]);
    const immutables = {
        factory,
        token0,
        token1,
        fee,
        tickSpacing,
        maxLiquidityPerTick,
    };
    return immutables;
}
async function getPoolState() {
    const [liquidity, slot] = await Promise.all([
        poolContract.liquidity(),
        poolContract.slot0(),
    ]);
    const PoolState = {
        liquidity,
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],
        observationCardinality: slot[3],
        observationCardinalityNext: slot[4],
        feeProtocol: slot[5],
        unlocked: slot[6],
    };
    return PoolState;
}
async function main() {
    const [immutables, state] = await Promise.all([
        getPoolImmutables(),
        getPoolState(),
    ]);
    const TokenA = new sdk_core_1.Token(3, immutables.token0, 6, "USDC", "USD Coin");
    const TokenB = new sdk_core_1.Token(3, immutables.token1, 18, "WETH", "Wrapped Ether");
    const poolExample = new v3_sdk_1.Pool(TokenA, TokenB, immutables.fee, state.sqrtPriceX96.toString(), state.liquidity.toString(), state.tick);
    console.log(poolExample);
}
main();
