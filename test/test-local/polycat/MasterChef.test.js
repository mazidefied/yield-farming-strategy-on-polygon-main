/// Using local network
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))

/// web3.js related methods
const { toWei, fromWei, getEvents } = require('../web3js-helper/web3jsHelper')

/// Openzeppelin test-helper
const { time, constants, expectRevert, expectEvent } = require('@openzeppelin/test-helpers')

/// Import deployed-addresses
const contractAddressList = require("../../../migrations/addressesList/contractAddress/contractAddress.js")
const tokenAddressList = require("../../../migrations/addressesList/tokenAddress/tokenAddress.js")

/// Artifact of smart contracts 
const MasterChef = artifacts.require("MasterChef")
const FishToken = artifacts.require("FishToken")
const DAIMockToken = artifacts.require("DAIMockToken")

/// Deployed-addresses


/**
 * @notice - This is the test of MasterChef.sol
 * @notice - [Execution command]: $ truffle test ./test/test-local/MasterChef.test.js --network local
 * @notice - [Note]: When you execute this test, you need to execute "ganache-cli -d" in advance
 */
contract("MasterChef", function(accounts) {
    /// Acccounts
    let deployer = accounts[0]
    let admin = accounts[0]
    let user1 = accounts[1]
    let user2 = accounts[2]
    let user3 = accounts[3]
    let devAddress = accounts[4]
    let feeAddress = accounts[5]
    let vaultAddress = accounts[6]

    /// Global contract instance
    let masterChef
    let fishToken
    let daiToken

    /// Global variable for each contract addresses
    let MASTER_CHEF
    let FISH_TOKEN
    let DAI_TOKEN

    describe("\n Accounts", () => {
        it("Show accounts (wallet addresses) list that are used for this test", async () => {
            console.log('=== deployer ===', deployer)
            console.log('=== user1 ===', user1)
            console.log('=== user2 ===', user2)
            console.log('=== user3 ===', user3)
        })
    })

    describe("\n Setup smart-contracts", () => {
        it("Deploy the Fish Token", async () => {
            fishToken = await FishToken.new({ from: deployer })
            FISH_TOKEN = fishToken.address
        })

        it("Deploy the DAI Mock Token", async () => {
            daiToken = await DAIMockToken.new({ from: deployer })
            DAI_TOKEN = daiToken.address
        })

        it("Deploy the MasterChef contract", async () => {
            const startBlock = 1
            
            masterChef = await MasterChef.new(FISH_TOKEN, startBlock, devAddress, feeAddress, vaultAddress, { from: deployer })
            MASTER_CHEF = masterChef.address
        })

        it("Transfer ownership of the FishToken to the MasterChef contract", async () => {
            let txReceipt = await fishToken.transferOwnership(MASTER_CHEF, { from: deployer })
        })

        it("[Log]: Deployer-contract addresses", async () => {
            console.log('\n=== FISH_TOKEN ===', FISH_TOKEN)
            console.log('\n=== DAI_TOKEN ===', DAI_TOKEN)
            console.log('\n=== MASTER_CHEF ===', MASTER_CHEF)
        })
    })

    describe("\n Preparation in advance", () => {
        it("Transfer 1000 DAI from deployer to 3 users (user1, user2, user3)", async () => {
            const amount = toWei("1000")  /// 1000 $DAI
            let txReceipt1 = await daiToken.transfer(user1, amount, { from: deployer })
            let txReceipt2 = await daiToken.transfer(user2, amount, { from: deployer })
            let txReceipt3 = await daiToken.transfer(user3, amount, { from: deployer })
        })
    })

    describe("\n Workflow of the MasterChef contract", () => {
        it("fishPerBlock - FISH tokens created per block should be 1 $FISH", async () => {
            let FISH_PER_BLOCK = await masterChef.fishPerBlock()
            console.log('=== fishPerBlock ===', fromWei(FISH_PER_BLOCK))
        })

        it("add() - Add a new ERC20 Token (DAI) Pool as a target", async () => {
            /// [Note]: 1 FISH (1e18) tokens created per block
            const allocPoint = "100"
            const lpToken = DAI_TOKEN   /// [Note]: Using ERC20 Token (DAI) as a single staking pool
            const depositFeeBP = 4      /// [Note]: Deposit Fee == 4%
            let txReceipt = await masterChef.add(allocPoint, lpToken, depositFeeBP, { from: deployer })
        })

        it("deposit() - User1 stake 10 DAI at block 310", async () => {
            /// [Note]: Block to mint the FishToken start from block 300.
            /// User1 stake (deposit) 10 DAI tokens at block 310.
            await time.advanceBlockTo("309")

            const poolId = 0
            const stakeAmount = toWei('10')  /// 10 DAI
            const referrer = constants.ZERO_ADDRESS

            let txReceipt1 = await daiToken.approve(MASTER_CHEF, stakeAmount, { from: user1 })
            let txReceipt2 = await masterChef.deposit(poolId, stakeAmount, referrer, { from: user1 })
        })

        it("deposit() - User2 stake 20 DAI at block 314", async () => {
            /// [Note]: Block to mint the FishToken start from block 300.
            /// User2 stake (deposit) 20 DAI at block 314.
            await time.advanceBlockTo("313")

            const poolId = 0
            const stakeAmount = toWei('20')  /// 20 DAI
            const referrer = constants.ZERO_ADDRESS

            let txReceipt1 = await daiToken.approve(MASTER_CHEF, stakeAmount, { from: user2 })
            let txReceipt2 = await masterChef.deposit(poolId, stakeAmount, referrer, { from: user2 })
        })

        it("deposit() - User3 stake 30 DAI at block 318", async () => {
            /// [Note]: Block to mint the FishToken start from block 300.
            /// User3 stake (deposit) 30 DAI at block 318
            await time.advanceBlockTo("317")

            const poolId = 0
            const stakeAmount = toWei('30')  /// 30 DAI
            const referrer = constants.ZERO_ADDRESS

            let txReceipt1 = await daiToken.approve(MASTER_CHEF, stakeAmount, { from: user3 })
            let txReceipt2 = await masterChef.deposit(poolId, stakeAmount, referrer, { from: user3 })
        })

        it("deposit() - User1 stake more 10 DAI at block 320", async () => {
            /// [Note]: Block to mint the FishToken start from block 300.
            /// User1 stake (deposit) 10 more DAI at block 320.
            await time.advanceBlockTo("319")

            const poolId = 0
            const stakeAmount = toWei('10')  /// 10 DAI
            const referrer = constants.ZERO_ADDRESS

            let txReceipt1 = await daiToken.approve(MASTER_CHEF, stakeAmount, { from: user1 })
            let txReceipt2 = await masterChef.deposit(poolId, stakeAmount, referrer, { from: user1 })
        })


        it("Current block should be at block 321", async () => {
            let currentBlock = await time.latestBlock()
            console.log('=== currentBlock ===', String(currentBlock))

            assert.equal(
                currentBlock,
                "321",
                "Current block should be 321"
            )
        })

        it("Total Supply of the FishToken should be 11 (at block 321)", async () => {
            /// [Note]: 1 FISH (1e18) tokens created per block

            ///  At this point (At block 321): 
            ///      TotalSupply of FishToken: 1 * (321 - 310) = 11
            ///      User1 should have: 4*1 + 4*1/3*1 + 2*1/6*1 = 5.666
            ///      MasterChef contract should have the remaining: 11 - 5.666 = 6.334
            let totalSupplyOfFishToken = await fishToken.totalSupply()
            console.log('=== totalSupplyOfFishToken ===', fromWei(totalSupplyOfFishToken))
            assert.equal(
                Math.round(web3.utils.fromWei(totalSupplyOfFishToken, 'ether')),
                11,  /// [Note]: This is amount value rounded.
                "Total supply of the Governance tokens (at block 321) should be 11"
            )
        })

        it("FishToken balance of user1 should be 7 (at block 321)", async () => {
            let fishTokenBalanceOfUser1 = await fishToken.balanceOf(user1, { from: user1 })
            console.log('=== FishToken balance of user1 (before it is rounded) ===', fromWei(fishTokenBalanceOfUser1))
            assert.equal(
                Math.round(web3.utils.fromWei(fishTokenBalanceOfUser1, 'ether')),
                7,  /// [Note]: This is amount value rounded.
                "FishToken balance of user1 should be 7 (at block 321)"
            )
        })

        it("FishToken balance of user2, user3, admin (at block 321)", async () => {
            let fishTokenBalanceOfUser2 = await fishToken.balanceOf(user2, { from: user2 })
            console.log('=== FishToken balance of user2 ===', fromWei(fishTokenBalanceOfUser2))

            let fishTokenBalanceOfUser3 = await fishToken.balanceOf(user3, { from: user3 })
            console.log('=== FishToken balance of user3 ===', fromWei(fishTokenBalanceOfUser3))

            let fishTokenBalanceOfAdmin = await fishToken.balanceOf(admin, { from: user3 })
            console.log('=== FishToken balance of admin ===', fromWei(fishTokenBalanceOfAdmin))
        })

        it("FishToken balance of the MasterChef contract should be 4 (at block 321)", async () => {
            let fishTokenBalance = await fishToken.balanceOf(MASTER_CHEF, { from: user1 })
            console.log('=== FishToken balance of the MasterChef contract (before it is rounded) ===', fromWei(fishTokenBalance))
            assert.equal(
                Math.round(web3.utils.fromWei(fishTokenBalance, 'ether')),
                4,  /// [Note]: This is amount value rounded.
                "FishToken balance of the MasterChef contract should be 5 (at block 321)"
            )
        })

        it("Un-stake and withdraw 10 DAI and receive 7 FishToken as rewards (at block 322)", async () => {
            /// [Note]: Total DAI amount staked of user1 is 20 DAI tokens at block 321.
            /// [Note]: Therefore, maximum withdraw amount for user1 is 20 DAI
            const poolId = 0
            const unStakeAmount = toWei('10')  /// 10 DAI
            let txReceipt = await masterChef.withdraw(poolId, unStakeAmount, { from: user1 })
        
            let fishTokenBalanceOfUser1 = await fishToken.balanceOf(user1, { from: user1 })
            console.log('=== FishToken balance of user1 (before it is rounded) ===', fromWei(fishTokenBalanceOfUser1))
        })


    })

})
