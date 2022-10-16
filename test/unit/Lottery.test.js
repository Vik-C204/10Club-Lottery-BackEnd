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
                await expect(lottery.enterLottery()).to.be.revertedWith( // is reverted when not paid enough or raffle is not open
                    "Lottery__NotEnoughETHEntered"
                )
            })
            it("records player when they enter", async () => {
                await lottery.enterLottery({ value: entranceFee })
                const contractPlayer = await lottery.getPlayer(0)
                assert.equal(contractPlayer, deployer)
            })
            it("emits event on enter", async () => {
                await expect(lottery.enterLottery({ value: entranceFee })).to.emit( // emits RaffleEnter event if entered to index player(s) address
                    lottery,
                    "LotteryEnter"
                )
            })
            it("doesn't allow entrance when raffle is calculating", async () => {
                await lottery.enterLottery({ value: entranceFee })
                // for a documentation of the methods below, go here: https://hardhat.org/hardhat-network/reference
                await network.provider.request({ method: "evm_mine", params: [] })
                // we pretend to be a keeper for a second
                await lottery.requestRandomWinner() // changes the state to calculating for our comparison below
                await expect(lottery.enterLottery({ value: entranceFee })).to.be.revertedWith( // is reverted as raffle is calculating
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
                    VRFCoordinatorV2Mock.fulfillRandomWords(0, lottery.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request")
                await expect(
                    VRFCoordinatorV2Mock.fulfillRandomWords(1, lottery.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request")
            })})

    

})