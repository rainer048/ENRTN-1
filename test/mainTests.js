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

    // increase and decrease functons
    it('when the owner call increase', async function () {
        const amount = new BigNumber(100);
        await token.increaseApproval(recipient, amount);
        let allowanceOfRecepient = await token.allowance(owner, recipient);
        assert.equal(allowanceOfRecepient.valueOf(), amount.valueOf());
    });

    it('when the owner call decrease', async function () {
        const initialAmount = new BigNumber(100);
        const amount = new BigNumber(30);
        await token.decreaseApproval(recipient, amount);
        let allowanceOfRecepient = await token.allowance(owner, recipient);
        assert.equal(allowanceOfRecepient.valueOf(), (initialAmount - amount).valueOf());

        await token.decreaseApproval(recipient, initialAmount);
        allowanceOfRecepient = await token.allowance(owner, recipient);
        assert.equal(allowanceOfRecepient.valueOf(), 0);
    });

    // end of increase and decrease

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

    // transferFrom + approve tests
    it('approve token functon in token contract', async function () {
        const amount = new BigNumber(100);

        await token.transfer(sender, amount.valueOf());

        const senderBalance = await token.balanceOf(sender);
        assert.equal(senderBalance.valueOf(), amount.valueOf());

        await token.approve(recipient, amount / 2, {from: sender});
        let allowanceOfRecepient = await token.allowance(sender, recipient);
        assert.equal(allowanceOfRecepient.valueOf(), amount / 2);
    });

    it('when to is null address', async function () {
        const amount = new BigNumber(50);

        let err;
        try {
            await token.transferFrom(sender, nullAddress, amount.valueOf(), {from: recipient});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when tokenAmount is big', async function () {
        const amount = new BigNumber(200);

        let err;
        try {
            await token.transferFrom(sender, owner, amount.valueOf(), {from: recipient});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when tokenAmount is big', async function () {
        const amount = new BigNumber(51);

        let err;
        try {
            await token.transferFrom(sender, owner, amount.valueOf(), {from: recipient});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('transferFrom token functon in token contract', async function () {
        const amount = new BigNumber(50);
        const startBalanceOfOwner = allTokens;

        await token.transferFrom(sender, owner, amount.valueOf(), {from: recipient});

        const senderBalance = await token.balanceOf(sender);
        assert.equal(senderBalance.valueOf(), amount);

        let allowanceOfRecepient = await token.allowance(sender, recipient);
        assert.equal(allowanceOfRecepient.valueOf(), 0);

        await token.transfer(owner, amount.valueOf(), {from: sender});

        let balanceOfOwner = await token.balanceOf(owner);
        assert.equal(balanceOfOwner.valueOf(), startBalanceOfOwner);
    });
    // end of transferFrom + approve tests


    // CrowdSale tests

    it('set private sale date', async function () {
        const time = parseInt(Date.now() / 1000);

        await crowdsale.setPrivateSaleDate(time + 100, time + 1000);

        let privateSaleStartValue = await crowdsale.privateSaleStart.call();
        let privateSaleStopValue = await crowdsale.privateSaleStop.call();

        assert.equal(privateSaleStartValue, time + 100);
        assert.equal(privateSaleStopValue, time + 1000);
    });

    it('when private sale date start < now', async function () {
        const time = parseInt(Date.now() / 1000);

        let err;
        try {
            await crowdsale.setPrivateSaleDate(time - 100, time + 1000);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when private sale date start > stop', async function () {
        const time = parseInt(Date.now() / 1000);

        let err;
        try {
            await crowdsale.setPrivateSaleDate(time + 10000, time + 1000);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('set pre sale date', async function () {
        const time = parseInt(Date.now() / 1000);

        await crowdsale.setPreSaleDate(time + 10000, time + 100000);

        let preSaleStartValue = await crowdsale.preSaleStart.call();
        let preSaleStopValue = await crowdsale.preSaleStop.call();

        assert.equal(preSaleStartValue, time + 10000);
        assert.equal(preSaleStopValue, time + 100000);
    });

    it('when pre sale date start < now', async function () {
        const time = parseInt(Date.now() / 1000);

        let err;
        try {
            await crowdsale.setPreSaleDate(time - 100, time + 1000);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when pre sale date start > stop', async function () {
        const time = parseInt(Date.now() / 1000);

        let err;
        try {
            await crowdsale.setPreSaleDate(time + 10000, time + 1000);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('set sale date', async function () {
        const time = parseInt(Date.now() / 1000);

        await crowdsale.setSaleDate(time + 1000000, time + 10000000);

        let saleStartValue = await crowdsale.saleStart.call();
        let saleStopValue = await crowdsale.saleStop.call();

        assert.equal(saleStartValue, time + 1000000);
        assert.equal(saleStopValue, time + 10000000);
    });

    it('when sale date start < now', async function () {
        const time = parseInt(Date.now() / 1000);

        let err;
        try {
            await crowdsale.setSaleDate(time - 100, time + 1000);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when sale date start > stop', async function () {
        const time = parseInt(Date.now() / 1000);

        let err;
        try {
            await crowdsale.setSaleDate(time + 10000, time + 1000);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('get private sale percent ', async function () {
        const time = parseInt(Date.now() / 1000);
        await crowdsale.setPrivateSaleDate(time, time + 1000);

        let percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        let percent11ETH = await crowdsale.getBonusInPercent(11000000000000000000);
        let percent5ETH = await crowdsale.getBonusInPercent(5000000000000000000);

        assert.equal(percent31ETH.valueOf(), 30);
        assert.equal(percent11ETH.valueOf(), 25);
        assert.equal(percent5ETH.valueOf(), 20);

        await crowdsale.setPrivateSaleDate(time + 100, time + 1000);
    });

    it('get pre sale percent ', async function () {
        const time = parseInt(Date.now() / 1000);
        await crowdsale.setPreSaleDate(time, time + 1000);

        let percent51ETH = await crowdsale.getBonusInPercent(51000000000000000000);
        let percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        let percent11ETH = await crowdsale.getBonusInPercent(11000000000000000000);
        let percent1ETH = await crowdsale.getBonusInPercent(1000000000000000000);

        assert.equal(percent51ETH.valueOf(), 25);
        assert.equal(percent31ETH.valueOf(), 20);
        assert.equal(percent11ETH.valueOf(), 15);
        assert.equal(percent1ETH.valueOf(), 0);

        await crowdsale.setPreSaleDate(time + 10000, time + 100000);

    });

   it('get sale percent ', async function () {
        let time = parseInt(Date.now() / 1000);
        await crowdsale.setSaleDateUnsafe(time+1000, time + 10000);

        let percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        let percent12ETH = await crowdsale.getBonusInPercent(12000000000000000000);
        let percent1ETH = await crowdsale.getBonusInPercent(1000000000000000000);
        
        assert.equal(percent31ETH.valueOf(), 0);
        assert.equal(percent12ETH.valueOf(), 0);
        assert.equal(percent1ETH.valueOf(), 0);

        time = parseInt(Date.now() / 1000);
        await crowdsale.setSaleDateUnsafe(time, time + 10000000);

        percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        percent12ETH = await crowdsale.getBonusInPercent(12000000000000000000);
        percent1ETH = await crowdsale.getBonusInPercent(1000000000000000000);

        assert.equal(percent31ETH.valueOf(), 15);
        assert.equal(percent12ETH.valueOf(), 10);
        assert.equal(percent1ETH.valueOf(), 7);

        time = parseInt(Date.now() / 1000);
        await crowdsale.setSaleDateUnsafe(time - 8*24*60*60, time + 100000000);

        percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        percent12ETH = await crowdsale.getBonusInPercent(12000000000000000000);
        percent1ETH = await crowdsale.getBonusInPercent(1000000000000000000);

        assert.equal(percent31ETH.valueOf(), 10);
        assert.equal(percent12ETH.valueOf(), 7);
        assert.equal(percent1ETH.valueOf(), 5);

        time = parseInt(Date.now() / 1000);
        await crowdsale.setSaleDateUnsafe(time - 15*24*60*60, time + 100000000);

        percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        percent12ETH = await crowdsale.getBonusInPercent(12000000000000000000);
        percent1ETH = await crowdsale.getBonusInPercent(1000000000000000000);

        assert.equal(percent31ETH.valueOf(), 8);
        assert.equal(percent12ETH.valueOf(), 4);
        assert.equal(percent1ETH.valueOf(), 2);

        time = parseInt(Date.now() / 1000);
        await crowdsale.setSaleDateUnsafe(time - 22*24*60*60, time + 1000000000);

        percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        percent12ETH = await crowdsale.getBonusInPercent(12000000000000000000);
        percent1ETH = await crowdsale.getBonusInPercent(1000000000000000000);

        assert.equal(percent31ETH.valueOf(), 5);
        assert.equal(percent12ETH.valueOf(), 2);
        assert.equal(percent1ETH.valueOf(), 0);

        time = parseInt(Date.now() / 1000);
        await crowdsale.setSaleDateUnsafe(time - 29*24*60*60, time + 1000000000);

        percent31ETH = await crowdsale.getBonusInPercent(31000000000000000000);
        percent12ETH = await crowdsale.getBonusInPercent(12000000000000000000);
        percent1ETH = await crowdsale.getBonusInPercent(1000000000000000000);

        assert.equal(percent31ETH.valueOf(), 0);
        assert.equal(percent12ETH.valueOf(), 0);
        assert.equal(percent1ETH.valueOf(), 0);

    });

    it('set token rate', async function () {

        await crowdsale.setRate(1);
        assert.equal(await crowdsale.rate.call().valueOf(), 1);

    });


    // end crowdsale tests

    it('simple crowdsale', async function () {
        const tokensAmountForCrowdsale = new BigNumber(10 * 10 ** 18);
        const time = parseInt(Date.now() / 1000);
        const rate = 1;
        const valueInWei = new BigNumber(rate * 10 ** 18);
        const calcAmount = new BigNumber(1070000000000000000);

        const crowdSaleContractValue = await token.crowdSaleContract.call();
        assert.equal(crowdSaleContractValue.valueOf(), crowdsale.address, "crowdsale address is not correct");

        let weiRaisedValue = await crowdsale.weiRaised.call();
        assert.equal(weiRaisedValue.valueOf(), 0, "weiRaisedValue is not correct");

        let rateValue = await crowdsale.rate.call();
        assert.equal(rateValue.valueOf(), rate, "rateValue is not correct");

        await token.transfer(crowdsale.address, tokensAmountForCrowdsale.valueOf());

        let crowdsaleBalance = await token.balanceOf(crowdsale.address);
        assert.equal(crowdsaleBalance.valueOf(), tokensAmountForCrowdsale.valueOf());

        let senderBalance = await token.balanceOf(sender);
        assert.equal(senderBalance.valueOf(), 0);

        await crowdsale.setSaleDate(time, time + 10000000);

        web3.eth.sendTransaction({ from: sender, to: crowdsale.address, value: valueInWei });

        weiRaisedValue = await crowdsale.weiRaised.call();
        assert.equal(weiRaisedValue.valueOf(), valueInWei, "weiRaisedValue address is not correct");

        senderBalance = await token.balanceOf(sender);
        assert.equal(senderBalance.valueOf(), calcAmount.valueOf());

        crowdsaleBalance = await token.balanceOf(crowdsale.address);
        assert.equal(crowdsaleBalance.valueOf(), tokensAmountForCrowdsale.valueOf() - senderBalance.valueOf());
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

    it('when not owner call burn if paused', async function () {
        let err;
        try {
            await token.burn(allTokens, {from: notOwner});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('when the owner burn tokens', async function () {
        let balanceOfOwner = await token.balanceOf(owner);

        await token.burn(balanceOfOwner);

        balanceOfOwner = await token.balanceOf(owner);
        assert.equal(balanceOfOwner.valueOf(), 0);
    });

    it('when the burn twice', async function () {
        let err;
        try {
            await token.burn(allTokens);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

});
