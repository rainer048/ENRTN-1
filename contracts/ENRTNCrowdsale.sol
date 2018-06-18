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
     * @dev Allows the current owner to relinquish control of the contract.
     * @notice Renouncing to ownership will leave the contract without an owner.
     * It will not be possible to call the functions with the `onlyOwner`
     * modifier anymore.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipRenounced(owner);
        owner = address(0);
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



contract ENRTNCrowdsale is Pausable {
    using SafeMath for uint256;

    // The token being sold
    ERC20Token public token;

    // Address where funds are collected
    address public wallet;

    uint256 public rate;
    uint256 public weiRaised;

    // Dates
    uint256 public privateSaleStart;
    uint256 public privateSaleStop;
    uint256 public preSaleStart;
    uint256 public preSaleStop;
    uint256 public saleStart;
    uint256 public saleStop;
    uint256 public updatePeriod;

    event TokenPurchase(
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    constructor(ERC20Token _token, address _wallet, uint _rate) public {
        require(_token != address(0));
        require(_wallet != address(0));

        wallet = _wallet;
        token = _token;

        rate = _rate;
    }

    function setPrice(uint _rate) public onlyOwner {
        rate = _rate;
    }

    function() external payable whenNotPaused() {
        buyTokens(msg.sender);
    }

    function buyTokens(address _beneficiary) public payable whenNotPaused {
        require(checkStage());

        uint256 weiAmount = msg.value;
        weiRaised = weiRaised.add(weiAmount);

        uint256 tokensAmount = weiAmount.mul(rate);
        uint256 bonus = getBonusInPercent(weiAmount);
        tokensAmount = tokensAmount + tokensAmount.mul(bonus).div(100);

        token.transferFrom(owner, _beneficiary, tokensAmount);

        emit TokenPurchase(_beneficiary, weiAmount, tokensAmount);
    }

    function setPrivateSaleDate(uint256 _start, uint256 _stop) public onlyOwner {
        require(_start > now);
        require(_stop > _start);
        privateSaleStart = _start;
        privateSaleStop = _stop;
    }

    function setPreSaleDate(uint256 _start, uint256 _stop) public onlyOwner {
        require(_start > now);
        require(_stop > _start);
        preSaleStart = _start;
        preSaleStop = _stop;
    }

    function setSaleDate(uint256 _start, uint256 _stop) public onlyOwner {
        require(_start > now);
        require(_stop > _start);
        saleStart = _start;
        saleStop = _stop;
    }

    function getBonusInPercent(uint256 weiAmount) public view returns(uint256) {
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
        if (now >= privateSaleStart && now <= privateSaleStop) {
            return true;
        } else if (now >= preSaleStart && now <= preSaleStop) {
            return true;
        } else if (now >= saleStart && now <= saleStop) {
            return true;
        } else {
            return false;
        }
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
