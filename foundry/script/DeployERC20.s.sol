// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ERC20Token.sol";

contract DeployERC20 is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy the ERC20 token
        new MyToken("MyToken", "MTK", 1000000 * 10 ** 18);

        vm.stopBroadcast();
    }
}