// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FacilitatorRegistry} from "../contracts/FacilitatorRegistry.sol";

contract DeployRegistry is Script {
    // CREATE2 salt — same salt on every chain for deterministic address
    bytes32 constant SALT = bytes32(uint256(0x78343032)); // "x402"

    function run() external {
        address deployer = msg.sender;
        vm.startBroadcast();

        FacilitatorRegistry registry = new FacilitatorRegistry{salt: SALT}(deployer);
        console.log("FacilitatorRegistry deployed at:", address(registry));

        vm.stopBroadcast();
    }
}
