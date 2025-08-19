// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ERC20Token.sol";

contract InteractWithERC20 is Script {
    function run() external {
        address tokenAddress = address(0x1234567890123456789012345678901234567890); // Replace with actual deployed address
        MyToken token = MyToken(tokenAddress);

        vm.startBroadcast();

        // Example interaction: Transfer tokens
        token.transfer(address(0x2234567890123456789012345678901234567890), 100 * 10 ** 18); // Replace with actual recipient address

        vm.stopBroadcast();
    }
}