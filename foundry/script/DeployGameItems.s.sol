// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GameItems.sol";

contract DeployGameItems is Script {
    function run() external {
        // Retrieve private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy GameItems contract with a base URI for metadata
        GameItems gameItems = new GameItems("https://game.example/api/item/");

        // Mint some initial items (optional)
        gameItems.mint(msg.sender, gameItems.SWORD(), 100, "");
        gameItems.mint(msg.sender, gameItems.SHIELD(), 50, "");
        gameItems.mint(msg.sender, gameItems.POTION(), 200, "");
        gameItems.mint(msg.sender, gameItems.LEGENDARY_ARMOR(), 1, "");

        vm.stopBroadcast();

        // Log the contract address
        console.log("GameItems deployed to:", address(gameItems));
    }
}
