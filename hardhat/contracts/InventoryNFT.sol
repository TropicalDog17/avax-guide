// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InventoryNFT is ERC1155, Ownable {
    // Item IDs
    uint256 public constant SWORD = 0;
    uint256 public constant SHIELD = 1;
    uint256 public constant POTION = 2;
    uint256 public constant LEGENDARY_ARMOR = 3;

    // Mapping from character NFT to item balances
    mapping(uint256 => mapping(uint256 => uint256)) public characterItems;
    // Character NFT contract
    address public characterContract;

    constructor(address _characterContract) ERC1155("https://game.example/api/item/{id}.json") Ownable(msg.sender) {
        characterContract = _characterContract;
    }

    // Public mint function for demo purposes
    function mint(address to, uint256 id, uint256 amount) public {
        require(id <= LEGENDARY_ARMOR, "Invalid item ID");
        require(amount <= 10, "Cannot mint more than 10 at once");
        _mint(to, id, amount, "");
    }

    function equipToCharacter(uint256 characterId, uint256 itemId, uint256 amount) public {
        require(IERC721(characterContract).ownerOf(characterId) == msg.sender, "Not character owner");
        require(balanceOf(msg.sender, itemId) >= amount, "Not enough items");
        
        _burn(msg.sender, itemId, amount);
        characterItems[characterId][itemId] += amount;
    }

    function unequipFromCharacter(uint256 characterId, uint256 itemId, uint256 amount) public {
        require(IERC721(characterContract).ownerOf(characterId) == msg.sender, "Not character owner");
        require(characterItems[characterId][itemId] >= amount, "Not enough equipped items");

        characterItems[characterId][itemId] -= amount;
        _mint(msg.sender, itemId, amount, "");
    }

    function getCharacterItems(uint256 characterId, uint256 itemId) public view returns (uint256) {
        return characterItems[characterId][itemId];
    }
}
