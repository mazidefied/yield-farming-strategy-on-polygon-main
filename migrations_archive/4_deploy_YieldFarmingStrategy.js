require('dotenv').config()

/// Import deployed-addresses
const contractAddressList = require("./addressesList/contractAddress/contractAddress.js")
const tokenAddressList = require("./addressesList/tokenAddress/tokenAddress.js")

/// Artifacts
const YieldFarmingStrategy = artifacts.require("YieldFarmingStrategy")
const MasterChef = artifacts.require("MasterChef")
const FishToken = artifacts.require("FishToken")

const MASTER_CHEF = MasterChef.address
//const MASTER_CHEF = contractAddressList["Polygon Mumbai"]["Polycat"]["MasterChef"]

/// Deployed-addresses on Polygon Mumbai
const LENDING_POOL_ADDRESSES_PROVIDER = contractAddressList["Polygon Mumbai"]["AAVE"]["LendingPoolAddressesProvider"]
//const DAI_TOKEN = tokenAddressList["Polygon Mumbai"]["ERC20"]["DAI"]


module.exports = async function(deployer) {
    await deployer.deploy(YieldFarmingStrategy, LENDING_POOL_ADDRESSES_PROVIDER, MASTER_CHEF)
};
