const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Factory = await ethers.getContractFactory("Factory");
    const [owner, addr1] = await ethers.getSigners();
    const factory = await Factory.deploy();
    await factory.deployed();

    const salt = ethers.utils.formatBytes32String("123")
    const options = {value: ethers.utils.parseEther("1.0")}
    const tx = await factory.deploy(owner.address, 100, salt, options);
    const rec = await tx.wait()

    let abi = [ "event Deployed(address,bytes32)" ];
    let iface = new ethers.utils.Interface(abi);

    let log = iface.parseLog(rec.logs[0])
    let addr = log.args[0]
    console.log(rec)

    abi = [ "function getBalance() public view returns (uint)" ];
    const greeter = new ethers.Contract(addr, abi, owner);

    const balance = await greeter.getBalance()
    expect(balance).to.eq(options["value"])
  });
});
