const ENRTNTokenContract = artifacts.require("./ENRTNToken.sol");
const ENRTNCrowdsaleContract = artifacts.require("./ENRTNCrowdsale.sol");

module.exports = async function(deployer, network, accounts) {
    let wallet = accounts[9];
    let priceInWei = 100;

    deployer.then(async () => {
        await deployer.deploy(ENRTNTokenContract);

        await deployer.link(ENRTNTokenContract, ENRTNCrowdsaleContract);
        return await deployer.deploy(ENRTNCrowdsaleContract, ENRTNTokenContract.address, wallet, priceInWei);
    });

    console.log('Ok!');
};
