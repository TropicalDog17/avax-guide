// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {Greeter} from "../src/Greeter.sol";

contract DeployGreeter is Script {
    function run() public {
        string memory greeting = vm.envOr("GREETING", string("Hello Avalanche"));

        vm.startBroadcast();
        Greeter greeter = new Greeter(greeting);
        vm.stopBroadcast();

        console2.log("Greeter deployed at:", address(greeter));
    }
}

