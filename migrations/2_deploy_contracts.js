const ENRTNTokenContract = artifacts.require("./ENRTNToken.sol");
const ENRTNCrowdsaleContract = artifacts.require("./ENRTNCrowdsale.sol");
const OraclizeApi = artifacts.require("./usingOraclize.sol");

module.exports = async function(deployer, network, accounts) {
    let wallet = accounts[9];
    let rate = 1;

    deployer.then(async () => {
        await deployer.deploy(ENRTNTokenContract);
	await deployer.deploy(OraclizeApi);
        await deployer.link(ENRTNTokenContract, ENRTNCrowdsaleContract);
        return await deployer.deploy(ENRTNCrowdsaleContract, ENRTNTokenContract.address, wallet);
    });

    console.log('Ok!');
};
