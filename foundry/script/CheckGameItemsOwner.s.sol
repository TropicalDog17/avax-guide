// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GameItems.sol";

contract CheckGameItemsOwner is Script {
    function run() external view {
        // The deployed contract address from your frontend
        address contractAddress = 0x5DB9A7629912EBF95876228C24A848de0bfB43A9;
        
        // Create an instance of the contract
        GameItems gameItems = GameItems(contractAddress);
        
        // Get the owner
        address owner = gameItems.owner();
        
        // Log the owner address
        console.log("GameItems contract owner:", owner);
    }
}
