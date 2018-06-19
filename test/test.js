const TokenContract = artifacts.require("./ENRTNToken.sol");
const CrowdsaleContract = artifacts.require("./ENRTNCrowdsale.sol");

contract('Main tests', async (accounts) => {
    const nullAddress = '0x0000000000000000000000000000000000000000';
    const owner = accounts[0];
    const notOwner = accounts[8];
    const sender = accounts[1];
    const recipient = accounts[2];
    const allTokens = 72800000 * 10 ** 18;

    beforeEach(async function() {
        token = await TokenContract.deployed();
        crowdsale = await CrowdsaleContract.deployed();
    });

    it('should return the correct totalSupply erc20 after construction', async function() {
        let totalSupply_ = await token.totalSupply();
        const pendingSupply = allTokens;
        assert.equal(totalSupply_.valueOf(),  pendingSupply, "total supply is not correct");
    });

    it('should return the owner', async function() {
        let owner = await token.owner.call();
        assert.equal(owner.valueOf(), accounts[0]);
    });

    it('should return the pause', async function() {
        let paused = await token.paused.call();
        assert.equal(paused.valueOf(), true);
    });

    it('should return the correct balance after construction', async function() {
        let balanceOf = await token.balanceOf(owner);
        const pendingBalanceOf = allTokens;
        assert.equal(balanceOf.valueOf(),  pendingBalanceOf, "balance is not correct");
    });

    it('should revert incorrect address', async function() {
        let err;
        try {
            await token.setCrowdSaleContract(nullAddress);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
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

    it('when the sender does not have enough balance', async function () {
        const amount = allTokens * 2;

        let err;
        try {
            await token.transfer(recipient, amount);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when the sender does not have enough balance', async function () {
        const amount = 100;

        let err;
        try {
            await token.transfer(nullAddress, amount);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when the sender has enough balance', async function () {
        const amount = 100;

        await token.transfer(recipient, amount);

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.valueOf(), amount);

    });

    it('when the not owner call transfer if paused', async function () {
        let err;
        try {
            await token.transfer(owner, amount, {from: recipient});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when the not owner call unpause', async function () {
        let err;
        try {
            await token.unpause({from: notOwner});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when the owner call unpause if paused', async function () {
        await token.unpause();
        let paused = await token.paused.call();
        assert.equal(paused.valueOf(), false);
    });

    it('when the sender has enough balance', async function () {
        const startBalanceOfOwner = allTokens;
        const amount = 100;

        await token.transfer(owner, amount, {from: recipient});

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.valueOf(), 0);

        let balanceOfOwner = await token.balanceOf(owner);
        assert.equal(balanceOfOwner.valueOf(), startBalanceOfOwner);
    });

});
