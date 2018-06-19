const TokenContract = artifacts.require("./ENRTNToken.sol");
const CrowdsaleContract = artifacts.require("./ENRTNCrowdsale.sol");

contract('Main tests', async (accounts) => {
    const nullAddress = '0x0000000000000000000000000000000000000000';

    beforeEach(async function() {
        token = await TokenContract.deployed();
        crowdsale = await CrowdsaleContract.deployed();
    });

    it('should return the correct totalSupply erc20 after construction', async function() {
        let totalSupply_ = await token.totalSupply();
        const pendingSupply = 72800000 * 10 ** 18;
        assert.equal(totalSupply_.valueOf(),  pendingSupply, "total supply is not correct");
    });

    it('should return the owner', async function() {
        let owner = await token.owner.call();
        assert.equal(owner.valueOf(), accounts[0]);
    });

    it('the crowdsale address in token contract is null', async function() {
        const crowdSaleContractValue = await token.crowdSaleContract.call();
        assert.equal(crowdSaleContractValue.valueOf(), nullAddress, "crowdsale address is not correct");
    });

    it('should set the crowdsale address to token contract', async function() {
        await token.setCrowdSaleContract(crowdsale.address);
        const crowdSaleContractValue = await token.crowdSaleContract.call();
        assert.equal(crowdSaleContractValue.valueOf(), crowdsale.address, "crowdsale address is not correct");
    });

});
