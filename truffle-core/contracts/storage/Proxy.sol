pragma solidity >= 0.6.3;

import "./ProxyStorage.sol";
/**
 @title Holds all storage for all assets, and manages who to delegate the calls
 @author Freeverse.io, www.freeverse.io
 @dev Pattern: first, contracts-to-delegate-to info are added to this contract.
 @dev Part of this info informs which function selector maps to each contract address.
 @dev Second, in one atomic TX, we deactivate previous contracts, and activate newly added ones.
*/

contract Proxy is ProxyStorage {

    using Bytes32AddressLib for bytes32;

    // COMPANY_SLOT = keccak256("freeverse.private.addresses.company")
    bytes32 constant private COMPANY_SLOT = 0x233d36e267af25e9763c5ca9ee4b9df85d8450ad52191618b089fa4a1a46bfc5;
    address constant private PROXY_DUMMY_ADDR = address(1);
    bytes32 constant private EMPTY_CONTRACT_HASH = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;

    event ContractAdded(uint256 contractId, bytes32 name, bytes4[] selectors);
    event ContractsActivated(uint256[] contractIds, uint256 time);
    event ContractsDeactivated(uint256[] contractIds, uint256 time);
    event NewDirectory(address addr);

    modifier onlyCompany() {
        require(msg.sender == company(), "Only company is authorized.");
        _;
    }
    
    /**
    * @dev Sets CompanyOwner and SuperUser
    * @dev Stores proxy selectors in _contractsInfo[0], pointing to PROXY_DUMMY_ADDR
    */
    constructor(address companyOwner, address superUser, bytes4[] memory proxySelectors) public {
        _superUser = msg.sender;
        _contractsInfo.push(ContractInfo(PROXY_DUMMY_ADDR, proxySelectors, "Proxy", false));
        activateContracts(new uint256[](1));
        COMPANY_SLOT.setStorageAddress(companyOwner);
        _superUser = superUser;
    }
    
    /**
    * @dev execute a delegate call via fallback function
    */
    fallback() external payable {
        address contractAddr = _selectorToContractAddr[msg.sig];
        require(contractAddr != address(0x0), "function selector is not assigned to a valid contract");
        _delegate(contractAddr, msg.data);
    } 
    
    /**
    * @dev Delegates call. It returns the entire context execution
    * @dev NOTE: does not check if the implementation (code) address is a contract,
    *      so having an incorrect implementation could lead to unexpected results
    * @param _target Target address to perform the delegatecall
    * @param _calldata Calldata for the delegatecall
    */
    function _delegate(address _target, bytes memory _calldata) private {
        assembly {
            // let result := delegatecall(sub(gas(), fwdGasLimit), _target, add(_calldata, 0x20), mload(_calldata), 0, 0)
            let result := delegatecall(gas(), _target, add(_calldata, 0x20), mload(_calldata), 0, 0)
            let size := returndatasize()
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)

            /// revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
            /// if the call returned error data, forward it
            switch result case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
    
    /**
    * @dev Proposes a new owner, who needs to later accept it
    */
    function proposeCompany(address addr) external onlyCompany {
        _proposedCompany = addr;
    }

    /**
    * @dev The proposed owner uses this function to become the new owner
    */
    function acceptCompany() external  {
        require(msg.sender == _proposedCompany, "only proposed owner can become owner");
        COMPANY_SLOT.setStorageAddress(_proposedCompany);
        _proposedCompany = address(0);
    }

    /// SuperUser manages the proxy contract. No need to propose/accept, since it can be changed by company.
    function setSuperUser(address addr) external onlyCompany {
        _superUser = addr;
    }

    function addContracts(
        uint256[] calldata contractIds, 
        address[] calldata addrs, 
        uint16[] calldata nSelectorsPerContract, 
        bytes4[] calldata selectors,
        bytes32[] calldata names
    ) 
        external 
        onlySuperUser 
    {
        uint16 lastSelector;
        for (uint256 c = 0; c < contractIds.length; c++) {
            bytes4[] memory thisSelectors = new bytes4[](nSelectorsPerContract[c]);
            for (uint256 s = 0; s < nSelectorsPerContract[c]; s++) {
                thisSelectors[s] = selectors[lastSelector + s];
            }
            _addContract(contractIds[c], addrs[c], thisSelectors, names[c]);
            lastSelector += nSelectorsPerContract[c];
        }
    }
    
    /**
    * @dev  Deactivates a set of contracts, and then activates another set,
    *       in one single atomic transaction. 
    *       Note: it only removes the mapped selectors, not the contract info. 
    * @param deactContractIds The ids of the contracts to be de-activated
    * @param actContractIds The ids of the contracts to be activated
    */
    function upgrade(uint256[] calldata deactContractIds, uint256[] calldata actContractIds, address newDirectory) external onlySuperUser {
        deactivateContracts(deactContractIds);
        activateContracts(actContractIds);
        setDirectory(newDirectory);
    }

    /**
    * @dev  Activates a set of contracts, by adding an entry in the 
    *       _selectorToContractAddr mapping for each selector of the contract. 
    * @param contractIds The ids of the contracts to be activated
    */
    function activateContracts(uint256[] memory contractIds) public onlySuperUser {
        for (uint256 c = 0; c < contractIds.length; c++) {
            uint256 contractId = contractIds[c];
            require(!_contractsInfo[contractId].isActive, "cannot activate a contract that is already Active");
            bytes4[] memory selectors = _contractsInfo[contractId].selectors;
            address addr = _contractsInfo[contractId].addr;
            for (uint256 s = 0; s < selectors.length; s++) {
                require(_selectorToContractAddr[selectors[s]] == address(0x0), "Found a collision");
                _selectorToContractAddr[selectors[s]] = addr;
            }
            _contractsInfo[contractId].isActive = true;
        }
        emit ContractsActivated(contractIds, now);        
    }

    /**
    * @dev  De-activates a set of contracts, by adding an entry in the 
    *       _selectorToContractAddr mapping for each selector of the contract. 
    * @param contractIds The ids of the contracts to be activated
    */
    function deactivateContracts(uint256[] memory contractIds) public onlySuperUser {
        for (uint256 c = 0; c < contractIds.length; c++) {
            uint256 contractId = contractIds[c];
            require(contractId != 0, "cannot deactivate the proxy contract, with id = 0");
            require(_contractsInfo[contractId].isActive, "cannot deactivate a contract that is not active");
            bytes4[] memory selectors = _contractsInfo[contractId].selectors;
            for (uint256 s = 0; s < selectors.length; s++) {
                delete _selectorToContractAddr[selectors[s]];
            }
            _contractsInfo[contractId].isActive = false;
        }
        emit ContractsDeactivated(contractIds, now);        
    }

    /// Directory is just an external contract used by synchornizers to
    /// read the addresses of all other contracts. The proxy just informs about
    /// the location of this contract, which is typically changed in an upgrade.
    function setDirectory(address addr) public onlySuperUser {
        _directory = addr;
        emit NewDirectory(addr);
    }

    /**
    * @dev Stores the info about a contract to be later called via delegate call,
    * @dev by pushing to the _contractsInfo array, and emits an event with all the info.
    * @dev NOTE: it does not activate it until "activateContracts" is invoked
    * @param contractId The index in the array _contractsInfo where this contract should be placed
    *   It must be equal to the next available idx in the array. Although not strictly necessary, 
    *   it allows the external caller to ensure that the idx is as expected without parsing the event.
    * @param addr Address of the contract that will be used in the delegate call
    * @param selectors An array of all selectors needed inside the contract
    * @param name The name of the added contract, only for reference
    */
    function _addContract(uint256 contractId, address addr, bytes4[] memory selectors, bytes32 name) private {
        /// we require that the contract gets assigned an Id that is as specified from outside, 
        /// to make deployment more predictable, and avoid having to parse the emitted event to get contractId:
        require(contractId == _contractsInfo.length, "trying to add a new contract to a contractId that is non-consecutive");
        assertPointsToContract(addr);
        ContractInfo memory info;
        info.addr = addr;
        info.name = name;
        info.isActive = false;
        info.selectors = selectors;
        _contractsInfo.push(info);
        emit ContractAdded(contractId, name, selectors);        
    }
   
   /**
    * @dev Reverts unless contractAddress points to a legit contract.
    *      Makes sure that the hash of the external code is neither 0x0 (not-yet created),
    *       nor an account without code: keccak256('') = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
    *      See EIP-1052 for more info
    *      This check is important to avoid delegateCall returning OK when delegating to nowhere
    */
    function assertPointsToContract(address contractAddress) public view {
        bytes32 codeHashAtContractAddress;
        assembly { codeHashAtContractAddress := extcodehash(contractAddress) }
        require(codeHashAtContractAddress != EMPTY_CONTRACT_HASH && codeHashAtContractAddress != 0x0, "pointer to a non Contract found!");
    }


    /**
    * @dev  Standard getters
    */
    function countContracts() external view returns(uint256) { return _contractsInfo.length; }
    function countSelectorsInContract(uint256 contractId) external view returns(uint256) { 
        return _contractsInfo[contractId].selectors.length; 
    }
    function getContractAddressForSelector(bytes4 selector) external view returns(address) { 
        return _selectorToContractAddr[selector]; 
    }
    function getContractInfo(uint256 contractId) external view returns (address, bytes32, bytes4[] memory, bool) {
        return (
            _contractsInfo[contractId].addr,
            _contractsInfo[contractId].name,
            _contractsInfo[contractId].selectors,
            _contractsInfo[contractId].isActive
        );
    }

    function company() public view returns (address) { return COMPANY_SLOT.getStorageAddress(); }
    function proposedCompany() public view returns (address) { return _proposedCompany; }
    function superUser() public view returns (address) { return _superUser; }
    function directory() public view returns (address) { return _directory; }
}