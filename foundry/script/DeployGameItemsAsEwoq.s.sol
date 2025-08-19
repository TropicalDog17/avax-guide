// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GameItems.sol";

contract DeployGameItemsAsEwoq is Script {
    // EWOQ contract address on Avalanche Fuji testnet
    address constant EWOQ_ADDRESS = 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC;

    function run() external {
        // Retrieve private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy GameItems contract with EWOQ as initial owner
        GameItems gameItems = new GameItems("https://game.example/api/item/");

        // Mint initial items to EWOQ address
        gameItems.mint(EWOQ_ADDRESS, gameItems.SWORD(), 100, "");
        gameItems.mint(EWOQ_ADDRESS, gameItems.SHIELD(), 50, "");
        gameItems.mint(EWOQ_ADDRESS, gameItems.POTION(), 200, "");
        gameItems.mint(EWOQ_ADDRESS, gameItems.LEGENDARY_ARMOR(), 1, "");

        vm.stopBroadcast();

        // Log the contract address
        console.log("GameItems deployed to:", address(gameItems));
        console.log("Owner (EWOQ):", EWOQ_ADDRESS);
    }
}
