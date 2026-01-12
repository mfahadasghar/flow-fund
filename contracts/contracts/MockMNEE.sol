// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMNEE
 * @dev Mock MNEE stablecoin for testing FlowFund platform
 * In production, this will be replaced with the actual MNEE contract
 */
contract MockMNEE is ERC20, Ownable {
    uint8 private constant DECIMALS = 18;

    constructor() ERC20("Mock MNEE", "MNEE") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10 ** DECIMALS);
    }

    /**
     * @dev Mint new tokens - for testing purposes only
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Returns the number of decimals
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}
