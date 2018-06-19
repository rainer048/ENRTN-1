const TokenContract = artifacts.require("./ENRTNToken.sol");
const CrowdsaleContract = artifacts.require("./ENRTNCrowdsale.sol");

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Main tests', async (accounts) => {
    const nullAddress = '0x0000000000000000000000000000000000000000';
    const owner = accounts[0];
    const notOwner = accounts[8];
    const sender = accounts[1];
    const recipient = accounts[2];
    const pendingOwner = accounts[3];
    const allTokens = new BigNumber(72800000 * 10 ** 18);

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
        let ownerValue = await token.owner.call();
        assert.equal(ownerValue.valueOf(), owner);
    });

    it('should return the owner', async function() {
        let pendingOwnerValue = await token.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), nullAddress);
    });

    it('should revert incorrect msg sender', async function() {
        let err;
        try {
            await token.transferOwnership(pendingOwner, {from: pendingOwner});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('should call transferOwnership', async function() {
        await token.transferOwnership(pendingOwner);
        let pendingOwnerValue = await token.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), pendingOwner);
    });

    it('should revert incorrect msg sender', async function() {
        let err;
        try {
            await token.claimOwnership();
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('should call transferOwnership', async function() {
        await token.claimOwnership({from: pendingOwner});
        let pendingOwnerValue = await token.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), nullAddress);
        let ownerValue = await token.owner.call();
        assert.equal(ownerValue.valueOf(), pendingOwner);
    });

    it('transferOwnership to owner', async function() {
        await token.transferOwnership(owner, {from: pendingOwner});
        let pendingOwnerValue = await token.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), owner);

        await token.claimOwnership();
        pendingOwnerValue = await token.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), nullAddress);
        let ownerValue = await token.owner.call();
        assert.equal(ownerValue.valueOf(), owner);
    });

    // end token transferOwnership

    // crowdsale ownership

    it('should return the owner', async function() {
        let ownerValue = await crowdsale.owner.call();
        assert.equal(ownerValue.valueOf(), owner);
    });

    it('should return the owner', async function() {
        let pendingOwnerValue = await crowdsale.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), nullAddress);
    });

    it('should revert incorrect msg sender', async function() {
        let err;
        try {
            await crowdsale.transferOwnership(pendingOwner, {from: pendingOwner});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('should call transferOwnership', async function() {
        await crowdsale.transferOwnership(pendingOwner);
        let pendingOwnerValue = await crowdsale.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), pendingOwner);
    });

    it('should revert incorrect msg sender', async function() {
        let err;
        try {
            await crowdsale.claimOwnership();
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('should call transferOwnership', async function() {
        await crowdsale.claimOwnership({from: pendingOwner});
        let pendingOwnerValue = await crowdsale.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), nullAddress);
        let ownerValue = await crowdsale.owner.call();
        assert.equal(ownerValue.valueOf(), pendingOwner);
    });

    it('transferOwnership to owner', async function() {
        await crowdsale.transferOwnership(owner, {from: pendingOwner});
        let pendingOwnerValue = await crowdsale.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), owner);

        await crowdsale.claimOwnership();
        pendingOwnerValue = await crowdsale.pendingOwner.call();
        assert.equal(pendingOwnerValue.valueOf(), nullAddress);
        let ownerValue = await crowdsale.owner.call();
        assert.equal(ownerValue.valueOf(), owner);
    });

    // end crowdsale transferOwnership

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
        const amount = new BigNumber(100);

        await token.transfer(recipient, amount.valueOf());

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.valueOf(), amount.valueOf());

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

    it('when the owner call unpause twice', async function () {
        let err;
        try {
            await token.unpause();
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when the sender has enough balance', async function () {
        const startBalanceOfOwner = allTokens;
        const amount = new BigNumber(100);

        await token.transfer(owner, amount.valueOf(), {from: recipient});

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.valueOf(), 0);

        let balanceOfOwner = await token.balanceOf(owner);
        assert.equal(balanceOfOwner.valueOf(), startBalanceOfOwner);
    });

    it('reclaim token functon in token contract', async function () {
        const amount = new BigNumber(100);
        const startBalanceOfOwner = allTokens;

        await token.transfer(recipient, amount.valueOf());

        const recipientBalance = await token.balanceOf(recipient);
        assert.equal(recipientBalance.valueOf(), amount.valueOf());

        await token.transfer(token.address, amount.valueOf(), {from: recipient});
        const contractBalance = await token.balanceOf(token.address);
        assert.equal(contractBalance.valueOf(), amount.valueOf());

        await token.reclaimToken(token.address);
        let balanceOfOwner = await token.balanceOf(owner);
        assert.equal(balanceOfOwner.valueOf(), startBalanceOfOwner.valueOf());
    });

    it('when the not owner call pause', async function () {
        let err;
        try {
            await token.pause({from: notOwner});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when the owner call pause if not paused', async function () {
        await token.pause();
        let paused = await token.paused.call();
        assert.equal(paused.valueOf(), true);
    });

    it('when the owner burn tokens', async function () {
        await token.burn(allTokens);

        let balanceOfOwner = await token.balanceOf(owner);
        assert.equal(balanceOfOwner.valueOf(), 0);
    });

    it('when the not owner call pause', async function () {
        let err;
        try {
            await token.burn(allTokens);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

});
