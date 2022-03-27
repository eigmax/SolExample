import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";

import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";

import {
  abi as ROUTER_ABI,
  bytecode as ROUTER_BYTECODE,
} from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";

import {
  abi as NFT_MANAGER_ABI,
  bytecode as NFT_MANAGER_BYTECODE,
} from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";

import { Token, Pool, Swap, Swap__factory } from "../typechain";

import bn from "bignumber.js";
import { BigNumber, BigNumberish } from "ethers";

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

// returns the sqrt price as a 64x96
function encodePriceSqrt(
  reserve1: BigNumberish,
  reserve0: BigNumberish
): BigNumber {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

const getMinTick = (tickSpacing: number) =>
  Math.ceil(-887272 / tickSpacing) * tickSpacing;
const getMaxTick = (tickSpacing: number) =>
  Math.floor(887272 / tickSpacing) * tickSpacing;
const getMaxLiquidityPerTick = (tickSpacing: number) =>
  BigNumber.from(2)
    .pow(128)
    .sub(1)
    .div((getMaxTick(tickSpacing) - getMinTick(tickSpacing)) / tickSpacing + 1);

let tokenA: Token;
let tokenB: Token;
let tokenC: Token;
let pool: Pool;
let swap: Swap;
let admin: SignerWithAddress;
let user: SignerWithAddress;

async function before() {
    [admin, user] = await ethers.getSigners()
    if (user === undefined){
        throw new Error("Invalid user")
    }
    console.log(`admin = ${admin.address}, user = ${user.address}`);
}
async function deployTokens() {
  console.log("Going to deploy 3 tokens...");
  let Token = await ethers.getContractFactory("Token");

  tokenA = (await Token.deploy("Token_A", "TKA")) as Token;
  tokenB = (await Token.deploy("Token_B", "TKB")) as Token;
  tokenC = (await Token.deploy("Token_C", "TKC")) as Token;
  await tokenA.deployed()
  await tokenB.deployed()
  await tokenC.deployed()

  if (Number(tokenA.address) > Number(tokenB.address)) {
    let tmp = tokenB;
    tokenB = tokenA;
    tokenA = tmp;
  }

  if (Number(tokenB.address) > Number(tokenC.address)) {
    let tmp = tokenC;
    tokenC = tokenB;
    tokenB = tmp;
  }
  console.log(
    `Finish deploying 3 tokens: ${tokenA.address}, ${tokenB.address}, ${tokenC.address}`
  );
}

async function deployPool() {
  console.log("Going to deploy pool...");
  let Token = await ethers.getContractFactory("Token");
  let token = (await Token.deploy("My Custom Token 0", "MCT0")) as Token;

  let FACTORY = new ethers.ContractFactory(
    FACTORY_ABI,
    FACTORY_BYTECODE,
    admin
  );
  let factory = await FACTORY.deploy();
  console.log(`factory is deployed on ${factory.address}`);

  let NFT_MANAGER = new ethers.ContractFactory(
    NFT_MANAGER_ABI,
    NFT_MANAGER_BYTECODE,
    admin
  );
  let nft_manager = await NFT_MANAGER.deploy(
    factory.address,
    token.address,
    token.address
  );
  console.log(`nft_manager is deployed on ${nft_manager.address}`);

  let Pool = await ethers.getContractFactory("Pool");
  pool = (await Pool.deploy(factory.address, nft_manager.address)) as Pool;

  console.log(`pool is deployed on ${pool.address}`);
  return [factory, token];
}

async function deploySwap(factory_adress: string, token_adrress: string) {
  console.log("Going to deploy swap...");

  let Router = new ethers.ContractFactory(ROUTER_ABI, ROUTER_BYTECODE, admin);
  let router = await Router.deploy(factory_adress, token_adrress);
  console.log(`router is deployed on ${router.address}`);

  let Swap = await ethers.getContractFactory("Swap");
  swap = (await Swap.deploy(router.address)) as Swap;
  console.log(`swap is deployed on ${swap.address}`);
}

async function initAll() {
  let amount = 10000000000000
  console.log("Create pool")
  await pool.createPool(
    tokenA.address,
    tokenB.address,
    3000,
    encodePriceSqrt(1, 1)
  );
  await pool.createPool(
    tokenC.address,
    tokenB.address,
    3000,
    encodePriceSqrt(1, 1)
  );

  console.log("Approve")
  let tx;
  tx = await tokenA.approve(pool.address, amount);
  await tx.wait();
  tx = await tokenB.approve(pool.address, amount);
  await tx.wait();
  tx = await tokenC.approve(pool.address, amount);
  await tx.wait();

  console.log("mintNewPosition")
  await (await pool.mintNewPosition(
    tokenA.address,
    tokenB.address,
    3000,
    getMinTick(3000),
    getMaxTick(3000),
    1000000000000,
    1000000000000,
  )).wait();

  console.log("mintNewPosition B C")
  await (await pool.mintNewPosition(
    tokenB.address,
    tokenC.address,
    3000,
    getMinTick(3000),
    getMaxTick(3000),
    1000000000000,
    1000000000000,
  )).wait();
  console.log("approve user")
  await (await tokenA.transfer(user.address, 10000)).wait()
  await tokenA.connect(user).approve(swap.address, 10000)
}

async function swapInAndOut() {
    console.log("swap in and out")
    let tx = await swap.connect(user).swapExactInputSingle(
        tokenA.address,
        tokenB.address,
        3000,
        100,
        96,
    )
    await tx.wait()
    console.log("out")

    tx = await swap.connect(user).swapExactOutputSingle(
        tokenA.address,
        tokenB.address,
        3000,
        100,
        105,
    )
    await tx.wait()
}

async function main() {
  await before()
  await deployTokens();
  let [factory, token] = await deployPool();
  await deploySwap(factory.address, token.address);
  await initAll();
  await swapInAndOut()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
