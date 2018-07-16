pragma solidity 0.4.24;

contract usingOraclize {
    address public myOraclize;

    function oraclize_cbAddress() public view returns (address) {
      return myOraclize;
    }

    function __callback(bytes32 myid, string result) public pure {

    }

    function oraclize_query(string datasource, string arg, uint data) public pure {
          
    }

    function setMyOraclize(address _myOraclize) public
    {
        myOraclize = _myOraclize;
    }

    // parseInt(parseFloat*10^_b)
    function parseInt(string _a, uint _b) internal pure returns (uint) {
        bytes memory bresult = bytes(_a);
        uint mint = 0;
        bool decimals = false;
        for (uint i=0; i<bresult.length; i++){
            if ((bresult[i] >= 48)&&(bresult[i] <= 57)){
                if (decimals){
                   if (_b == 0) break;
                    else _b--;
                }
                mint *= 10;
                mint += uint(bresult[i]) - 48;
            } else if (bresult[i] == 46) decimals = true;
        }
        if (_b > 0) mint *= 10**_b;
        return mint;
    }

}
