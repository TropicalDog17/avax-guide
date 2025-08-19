// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CharacterNFT.sol";
import "../src/GameItems.sol";

contract DeployNestableContracts is Script {
    // EWOQ contract address
    address constant EWOQ_ADDRESS = 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Character NFT contract
        CharacterNFT characters = new CharacterNFT(
            "GameCharacter",
            "CHAR",
            "ipfs://characters/collection.json",
            "ipfs://characters/"
        );

        // Deploy GameItems contract
        GameItems items = new GameItems(
            "GameItems",
            "ITEM",
            "ipfs://items/collection.json",
            "ipfs://items/"
        );

        // Mint a character to EWOQ
        characters.mint(EWOQ_ADDRESS);
        
        // Mint some items directly to the character
        items.mint(EWOQ_ADDRESS, items.SWORD(), 1, address(characters));
        items.mint(EWOQ_ADDRESS, items.SHIELD(), 1, address(characters));
        items.mint(EWOQ_ADDRESS, items.POTION(), 1, address(characters));
        items.mint(EWOQ_ADDRESS, items.LEGENDARY_ARMOR(), 1, address(characters));

        vm.stopBroadcast();

        console.log("CharacterNFT deployed to:", address(characters));
        console.log("GameItems deployed to:", address(items));
    }
}
