## Usage

1. initialize context
```
yarn && yarn build
cp .env.sample .emv
npx hardhat node
```

2. deploy pool and swap

```
npx hardhat run scripts/deployAll.ts --network localhost
```

Or you can find an existing pool to add your liquidity by

```
npx hardhat getPoolAddress --network localhost --tokena ${tokenA} --tokenb ${tokenB} --high 1
```
where fee can be calculated by querying the best price with [uniswap-chain-queries](https://github.com/thanpolas/uniswap-chain-queries).
And the `tickPrice` is the marginal price of current tick. `--high` can be set 1 or y if you want to choose the highest price.

3. update `.env` with above factory, router, NFT manager, token A, B, C, pool and swap.

4. mine by providing liquidity

```
# approve
npx hardhat approve --network localhost --token ${tokenA} --amount 100000000000000000000000000
npx hardhat approve --network localhost --token ${tokenB} --amount 100000000000000000000000000
npx hardhat approve --network localhost --token ${tokenC} --amount 100000000000000000000000000

# query approval
npx hardhat approval --network localhost --token ${tokenA}
npx hardhat approval --network localhost --token ${tokenB}
npx hardhat approval --network localhost --token ${tokenC}

# query balance in advance

npx hardhat getBalance --network localhost --token ${token} --user ${user}

# mint position and get the token id

npx hardhat mint --network localhost --amount1 10000 --amount2 10000

# increase liquidity

npx hardhat increase --network localhost --id 4 --amount1 100 --amount2 100
npx hardhat getDepositInfo --network localhost  --id 4

# decrease liquidity

npx hardhat decrease --network localhost --id 4 --amount1 1000 --amount2 1000 --liq 10000

# receive fee

npx hardhat receive --network localhost --id 4

```

5. swap

```
npx hardhat swapExactInputSingle --network localhost --amountin 10000 --amountmin 1000
```
