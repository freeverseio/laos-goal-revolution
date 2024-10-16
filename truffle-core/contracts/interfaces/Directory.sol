pragma solidity >= 0.6.3;

/**
 @title Directory for contract addresses related to the project
 @author Freeverse.io, www.freeverse.io
 @dev keeps the deployed contracts in the arrays names and addresses
 @dev it keeps two copies of such arrays, and a pointer that points to the "active" copy
 @dev this is to allow the pattern: "first add the new data, which can cost a lot of gas
 @dev ...and, in one atomic transaction, just change the pointer".
 @dev We use this to let the Proxy upgrade this Directory as part of the proxy upgrade, atomically.
 @dev We keep track of deployBlockNum as a safety measure, to ensure that the contracts-to-become-active
 @dev were deployed later thant he currently active contracts. Otherwise, we need to call "revertActivation"
*/

contract Directory {

    bytes32[] public names;
    address[] public addresses;
    
    constructor (bytes32[] memory newNames, address[] memory newAdresseses) public {
        uint256 nContr = newNames.length;
        require(nContr == newAdresseses.length, "non-matching number of names and addresses");
        for (uint256 contr = 0; contr < nContr; contr++) {
           names.push(newNames[contr]); 
           addresses.push(newAdresseses[contr]); 
        }
    }
    
    function getDirectory() public view returns (bytes32[] memory, address[] memory) {
        uint256 nContr = names.length;
        bytes32[] memory nom = new bytes32[](nContr);
        address[] memory addr = new address[](nContr);
        for (uint256 contr = 0; contr < nContr; contr++) {
            nom[contr] = names[contr];
            addr[contr] = addresses[contr];
        }
        return (nom, addr);
    }
}