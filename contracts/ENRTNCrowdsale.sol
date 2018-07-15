pragma solidity 0.4.24;


contract ERC20Token {
    function totalSupply() public view returns(uint256);
    function balanceOf(address who) public view returns(uint256);
    function transfer(address to, uint256 value) public returns(bool);
    function transferFrom(address from, address to, uint256 value) public returns(bool);
    function approve(address spender, uint256 value) public returns(bool);
    function allowance(address who, address spender) public view returns(uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed who, address indexed spender, uint256 value);
}


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;
    address public pendingOwner;

    event OwnershipRenounced(address indexed previousOwner);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor() public {
        owner = msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Modifier throws if called by any account other than the pendingOwner.
     */
    modifier onlyPendingOwner() {
        require(msg.sender == pendingOwner);
        _;
    }

    /**
     * @dev Allows the current owner to set the pendingOwner address.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) onlyOwner public {
        pendingOwner = newOwner;
    }

    /**
     * @dev Allows the pendingOwner address to finalize the transfer.
     */
    function claimOwnership() onlyPendingOwner public {
        emit OwnershipTransferred(owner, pendingOwner);
        owner = pendingOwner;
        pendingOwner = address(0);
    }
}

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(paused);
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() onlyOwner whenNotPaused public {
        paused = true;
        emit Pause();
    }
    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() onlyOwner whenPaused public {
        paused = false;
        emit Unpause();
    }
}

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ENRTNCrowdsale is usingOraclize, Pausable {
    using SafeMath for uint256;

    // The token being sold
    ERC20Token public token;

    // Address where funds are collected
    address public wallet;

    // How many token units a buyer gets per wei.
    // The rate is the conversion between wei and the smallest and indivisible token unit.
    // So, if you are using a rate of 1 with a token with 3 decimals called TOK
    // 1 wei will give you 1 unit, or 0.001 TOK.
    uint256 public rate;
    uint256 public weiRaised;

    uint256 decimalsOfToken = 0; //default value

    // Dates
    uint256 public privateSaleStart;
    uint256 public privateSaleStop;
    uint256 public preSaleStart;
    uint256 public preSaleStop;
    uint256 public saleStart;
    uint256 public saleStop;
    uint256 public updatePeriod;

    // for oraclize
    uint CUSTOM_GASLIMIT = 150000;
    event newOraclizeQuery(string description);
    
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    constructor(ERC20Token _token, address _wallet) public {
        require(_token != address(0));
        require(_wallet != address(0));

        wallet = _wallet;
        token = _token;
    }
    
    function setGasLimit(uint _limit) public {
        CUSTOM_GASLIMIT = _limit;
    }

    function __callback(bytes32 myid, string result, bytes proof) public {
        if (msg.sender != oraclize_cbAddress()) revert();
        rate = parseInt(result, 2);
    }

    function update() public payable {
        if (oraclize_getPrice("URL", CUSTOM_GASLIMIT) > this.balance) {
            emit newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0", CUSTOM_GASLIMIT);
        }
    }

    function() external payable whenNotPaused() {
        buyTokens(msg.sender);
    }

    function buyTokens(address _beneficiary) public payable whenNotPaused {
        require(checkStage());

        uint256 weiAmount = msg.value;
        weiRaised = weiRaised.add(weiAmount);

        uint256 tokensAmount = weiAmount.mul(rate).div(100).div(10**18);
        require(tokensAmount >= 10 ** decimalsOfToken); // 1 token for tokens with decimals

        uint256 bonus = getBonusInPercent(tokensAmount);
        tokensAmount = tokensAmount.add(tokensAmount.mul(bonus).div(100));

        token.transfer(_beneficiary, tokensAmount);
        wallet.transfer(msg.value);

        emit TokenPurchase(msg.sender, _beneficiary, weiAmount, tokensAmount);
    }

    function setPrivateSaleDate(uint256 _start, uint256 _stop) public onlyOwner {
        require(_start >= now);
        require(_stop > _start);
        privateSaleStart = _start;
        privateSaleStop = _stop;
    }

    function setPreSaleDate(uint256 _start, uint256 _stop) public onlyOwner {
        require(_start >= now);
        require(_stop > _start);
        preSaleStart = _start;
        preSaleStop = _stop;
    }

    function setSaleDate(uint256 _start, uint256 _stop) public onlyOwner {
        require(_start >= now);
        require(_stop > _start);
        saleStart = _start;
        saleStop = _stop;
    }

    function getBonusInPercent(uint256 tokensAmount) public view returns(uint256) {
        if (now >= privateSaleStart && now <= privateSaleStop) {
            if (weiAmount > 30 ether) {
                return 30;
            } else if (weiAmount > 10 ether) {
                return 25;
            } else {
                return 20;
            }
        } else if (now >= preSaleStart && now <= preSaleStop) {
            if (weiAmount > 50 ether) {
                return 25;
            } else if (weiAmount > 30 ether) {
                return 20;
            } else if (weiAmount > 10 ether) {
                return 15;
            } else {
                return 0;
            }
        } else if (now >= saleStart && now <= saleStop) {
            if (weiAmount > 30 ether) {
                if (now > saleStart + 28 days) {
                    return 0;
                } else if (now > saleStart + 21 days) {
                    return 5;
                } else if (now > saleStart + 14 days) {
                    return 8;
                } else if (now > saleStart + 7 days) {
                    return 10;
                } else {
                    return 15;
                }
            } else if (weiAmount > 11 ether) {
                if (now > saleStart + 28 days) {
                    return 0;
                } else if (now > saleStart + 21 days) {
                    return 2;
                } else if (now > saleStart + 14 days) {
                    return 4;
                } else if (now > saleStart + 7 days) {
                    return 7;
                } else {
                    return 10;
                }
            } else {
                if (now > saleStart + 21 days) {
                    return 0;
                } else if (now > saleStart + 14 days) {
                    return 2;
                } else if (now > saleStart + 7 days) {
                    return 5;
                } else {
                    return 7;
                }
            }
        } else {
            return 0;
        }
    }

    function checkStage() public view returns(bool) {
        if (now >= privateSaleStart && now < privateSaleStop) {
            return true;
        } else if (now >= preSaleStart && now < preSaleStop) {
            return true;
        } else if (now >= saleStart && now < saleStop) {
            return true;
        } else {
            return false;
        }
    }

    function reclaimToken(ERC20Token anyToken) external onlyOwner {
        uint256 balance = anyToken.balanceOf(this);
        anyToken.transfer(owner, balance);
    }

    // for test only
    function setSaleDateUnsafe(uint256 _start, uint256 _stop) public onlyOwner {
        saleStart = _start;
        saleStop = _stop;
    }
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}
