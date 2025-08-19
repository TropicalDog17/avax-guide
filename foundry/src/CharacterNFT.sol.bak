// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@rmrk-team/evm-contracts/contracts/implementations/nesting/RMRKNestableImpl.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";

contract CharacterNFT is RMRKNestableImpl {
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI
    ) 
        RMRKNestableImpl(
            name,
            symbol,
            collectionMetadata,
            baseTokenURI,
            msg.sender
        )
    {}

    function mint(address to) external {
        _mint(to, totalSupply() + 1, "");
    }
}
