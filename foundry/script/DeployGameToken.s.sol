// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GameToken.sol";

contract DeployGameToken is Script {
    function run() external returns (GameToken t) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(pk);
        t = new GameToken();
        vm.stopBroadcast();
        
        console2.log("Game Token deployed at:", address(t));
    }
}