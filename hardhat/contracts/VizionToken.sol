// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VizionToken is ERC20 {
    uint256 constant initialSupply = 1000000 * (10 ** 18);

    constructor() ERC20("VizionToken", "VIZ") {
        _mint(msg.sender, initialSupply);
    }
}
