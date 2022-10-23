const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("Lottery", async () => {
        let lottery, VRFCoordinatorV2Mock, entranceFee, deployer
        const chainId = networkConfig.chainId

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            lottery = await ethers.getContract("Lottery", deployer)
            VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            entranceFee = await lottery.getEntranceFee()
        })

        describe("constructor", async function() {
            it("constructor", async function() {
                const LotteryState = await lottery.getLotteryState()
                assert.equal(LotteryState.toString(), "0")
            })
        })

        describe("enterLottery", function () {
            it("reverts when you don't pay enough", async () => {
                await expect(lottery.enterLottery()).to.be.revertedWith( 
                    "Lottery__NotEnoughETHEntered"
                )
            })
            it("records player when they enter", async () => {
                await lottery.enterLottery({ value: entranceFee })
                const contractPlayer = await lottery.getPlayer(0)
                assert.equal(contractPlayer, deployer)
            })
            it("emits event on enter", async () => {
                await expect(lottery.enterLottery({ value: entranceFee })).to.emit( 
                    lottery,
                    "LotteryEnter"
                )
            })
            it("doesn't allow entrance when lottery is calculating", async () => {
                await lottery.enterLottery({ value: entranceFee })
                
                await network.provider.request({ method: "evm_mine", params: [] })
                
                await lottery.requestRandomWinner() 
                await expect(lottery.enterLottery({ value: entranceFee })).to.be.revertedWith(
                    "Lottery__NotOpen"
                )
            })
        })

        describe("fulfillRandomWords", function () {
            beforeEach(async () => {
                await lottery.enterLottery({ value: entranceFee })
                await network.provider.request({ method: "evm_mine", params: [] })
            })
            it("can only be called after performupkeep", async () => {
                await expect(
                    VRFCoordinatorV2Mock.fulfillRandomWords(0, lottery.address) 
                ).to.be.revertedWith("nonexistent request")
                await expect(
                    VRFCoordinatorV2Mock.fulfillRandomWords(1, lottery.address) 
                ).to.be.revertedWith("nonexistent request")
            })})

    

})