// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title FacilitatorRegistry
/// @notice Canonical on-chain registry of known x402 facilitator addresses.
///         Indexed by subgraphs to filter USDC transferWithAuthorization events.
///         Deploy to same address on all chains via CREATE2.
contract FacilitatorRegistry is Ownable {

    event FacilitatorAdded(
        address indexed facilitator,
        string name,
        string url,
        uint256 timestamp
    );

    event FacilitatorRemoved(
        address indexed facilitator,
        uint256 timestamp
    );

    /// @notice True if address is a currently active registered facilitator
    mapping(address => bool) public isFacilitator;

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Register a new facilitator. Emits FacilitatorAdded.
    /// @param facilitator  The facilitator's settlement hot wallet address
    /// @param name         Human-readable name (e.g. "Coinbase CDP")
    /// @param url          Facilitator endpoint URL (e.g. "https://x402.org/facilitator")
    function addFacilitator(
        address facilitator,
        string calldata name,
        string calldata url
    ) external onlyOwner {
        require(facilitator != address(0), "Zero address");
        require(!isFacilitator[facilitator], "Already registered");
        isFacilitator[facilitator] = true;
        emit FacilitatorAdded(facilitator, name, url, block.timestamp);
    }

    /// @notice Deactivate a facilitator. Emits FacilitatorRemoved.
    /// @dev    Historical payments from this address remain in subgraph history.
    function removeFacilitator(address facilitator) external onlyOwner {
        require(isFacilitator[facilitator], "Not registered");
        isFacilitator[facilitator] = false;
        emit FacilitatorRemoved(facilitator, block.timestamp);
    }
}
