// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Greeter {
    string public greeting;

    constructor(string memory initialGreeting) {
        greeting = initialGreeting;
    }

    function setGreeting(string memory newGreeting) external {
        greeting = newGreeting;
    }
}

