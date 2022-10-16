const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let VRFCoordinatorV2Address, subID

    if (developmentChains.includes  (network.name)) {
        const VRFCoordinatorV2AddressMock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2Address = VRFCoordinatorV2AddressMock.address
        const transactionResponse = await VRFCoordinatorV2AddressMock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subID = transactionReceipt.events[0].args.subId
        await VRFCoordinatorV2AddressMock.fundSubscription(subID, ethers.utils.parseEther("5"))


    } else {
        VRFCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subID = networkConfig[chainId]["subID"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]

    const args = [VRFCoordinatorV2Address, entranceFee, gasLane, subID, callbackGasLimit]

    const lottery = await deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(lottery.address, args)
    }
}

module.exports.tags = ["all", "lottery"]