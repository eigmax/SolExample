import {Swap} from '../typechain'
import {ethers, run} from 'hardhat'
import {delay} from '../utils'

require('dotenv').config()
const router = process.env.UNISWAP_ROUTER as string;

async function deploySwap() {
    const Swap = await ethers.getContractFactory('Swap')
    console.log('starting deploying swap...')
    const swap = await Swap.deploy(router) as Swap
    console.log('Swap` deployed with address: ' + swap.address)
    console.log('wait of deploying...')
    await swap.deployed()
    console.log('starting verify swap...')
    try {
        await run('verify:verify', {
            address: swap!.address,
            contract: 'contracts/Swap.sol:Swap',
            constructorArguments: [router],
        });
        console.log('verify success')
    } catch (e: any) {
        console.log(e.message)
    }
}

deploySwap()
.then(() => process.exit(0))
.catch(error => {
    console.error(error)
    process.exit(1)
})
