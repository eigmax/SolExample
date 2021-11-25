const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Swap Sample", function () {
  it("Should return the new greeting once it's changed", async function () {
    let factory = await ethers.getContractFactory("DAI");
    const dai = await factory.deploy(1000);
    await dai.deployed();

    factory = await ethers.getContractFactory("WETH9");
    const weth = await factory.deploy(10000);
    await weth.deployed();

    factory = await ethers.getContractFactory("SwapExamples");
    const swap = await factory.deploy();
    await swap.deployed();

  });
});
