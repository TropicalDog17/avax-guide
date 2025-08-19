// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@rmrk-team/evm-contracts/contracts/implementations/nesting/RMRKNestableMultiAsset.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";  

contract GameItems is RMRKNestableMultiAsset {
    // Item IDs
    uint256 public constant SWORD = 0;
    uint256 public constant SHIELD = 1;
    uint256 public constant POTION = 2;
    uint256 public constant LEGENDARY_ARMOR = 3;

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI
    ) 
        RMRKNestableMultiAsset(
            name,
            symbol,
            collectionMetadata,
            baseTokenURI,
            msg.sender
        )
    {}

    function mint(
        address to,
        uint256 tokenId,
        uint256 parentId,
        address parentContract
    ) external {
        _mint(to, tokenId, parentId, parentContract, "");
    }

    function nestMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external {
        _nestMint(to, tokenId, destinationId, "");
    }

    // Mint directly to an address without nesting
    function simpleMint(address to, uint256 tokenId) external {
        _mint(to, tokenId, "");
    }
}
