const hardhat = require("hardhat");

const smartRouterAbi = require('../abis/pancakeSmartRouter.json')
const smartRouterAddress = '0x9a489505a00cE272eAa5e07Dba6491314CaE3796'

const factoryAbi = require('../abis/pancakeFactory.json')
const factoryAddress = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73'

const wethAbi = require('../abis/weth.json')
const usdcAddress = '0x8d008B313C1d6C7fE2982F62d32Da7507cF43551'
const usdcAbi = require('../abis/erc20.json')
const wethAddress = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'

// Replace with your private key
const privateKey = "7a59a4818623f6da756f7b650f20f66502cbf1437413eeea2b8d04ae014b5eed";

async function main() {
    const provider = new hardhat.ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545");
    const wallet = new hardhat.ethers.Wallet(privateKey, provider);

    const factoryContract = new hardhat.ethers.Contract(factoryAddress, factoryAbi, provider)

    const poolAddress = await factoryContract.getPool(wethAddress, usdcAddress, '500')
    console.log('poolAddress', poolAddress)

    const signerAddress = wallet.address;
    console.log('signerAddress', signerAddress);

    const wethContract = new hardhat.ethers.Contract(wethAddress, wethAbi, provider)
    const usdcContract = new hardhat.ethers.Contract(usdcAddress, usdcAbi, provider)

    const amountIn = hardhat.ethers.utils.parseUnits('0.01', '18')

    await wethContract.connect(wallet).approve(smartRouterAddress, amountIn.toString())
    console.log('approved!')

    const smartRouterContract = new hardhat.ethers.Contract(smartRouterAddress, smartRouterAbi, provider)

    const params = {
        tokenIn: wethAddress,
        tokenOut: usdcAddress,
        fee: '500',
        recipient: signerAddress,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }

    let wethBalance
    let usdcBalance
    wethBalance = await wethContract.balanceOf(signerAddress)
    usdcBalance = await usdcContract.balanceOf(signerAddress)
    console.log('================= BEFORE SWAP')
    console.log('wethBalance:', hardhat.ethers.utils.formatUnits(wethBalance.toString(), 18))
    console.log('usdcBalance:', hardhat.ethers.utils.formatUnits(usdcBalance.toString(), 6))

    const tx = await smartRouterContract.connect(wallet).exactInputSingle(
        params,
        {
            gasLimit: hardhat.ethers.utils.hexlify(1000000)
        }
    );
    await tx.wait()

    wethBalance = await wethContract.balanceOf(signerAddress)
    usdcBalance = await usdcContract.balanceOf(signerAddress)
    console.log('================= AFTER SWAP')
    console.log('wethBalance:', hardhat.ethers.utils.formatUnits(wethBalance.toString(), 18))
    console.log('usdcBalance:', hardhat.ethers.utils.formatUnits(usdcBalance.toString(), 6))
}

/*
node scripts/01_swap.js
*/

main()
