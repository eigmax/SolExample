import { task } from 'hardhat/config'
require('dotenv').config()
const fs = require('fs')

const swap = process.env.SWAP as string;
const pool = process.env.POOL as string;

task('getBalance', 'Balance of user')
    .addParam('token', 'the token address')
	.addParam('user', 'The address of the user')
	.setAction(async ({ user , token }, { ethers }) => {	  
		const contract = await ethers.getContractAt('Token', token)
        const balance = await contract.balanceOf(user);
		console.log(balance.toString());
	})

task('transfer', 'transfer tokens')
    .addParam('token', 'the token address') 
    .addParam('amount', 'the amount of tokens')
	.setAction(async ({ amount, token }, { ethers }) => {
		const contract = await ethers.getContractAt('Token', token)
        await contract.transfer(swap, amount);
	})

task('approve', 'approve tokens')
    .addParam('token', 'the token address')
    .addParam('amount', 'the amount of tokens')
	.setAction(async ({ token, amount }, { ethers }) => {
		const contract = await ethers.getContractAt('Token', token)
        let [admin] = await ethers.getSigners()
        console.log("user", admin.address, " approve ", amount, " to pool ", pool,
                   " and swap ", swap)
        await contract.approve(pool, amount);
        await contract.approve(swap, amount);
	})

task('approval', 'approval infomation')
    .addParam('token', 'the token address')
	.setAction(async ({ token }, { ethers }) => {
		const contract = await ethers.getContractAt('Token', token)
        let [admin] = await ethers.getSigners()
        let amount = await contract.allowance(admin.address, pool);
        console.log("user", admin.address, " approved ", amount.toString(), " to pool ", pool)
        amount = await contract.allowance(admin.address, swap);
        console.log("user", admin.address, " approved ", amount.toString(), " to swap ", swap)
	})
