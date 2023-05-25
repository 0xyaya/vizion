// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VizionStaking is ERC20("StakedVizion", "stVIZ") {
    IERC20 public immutable vizionToken;

    constructor(address _vizionToken) {
        vizionToken = IERC20(_vizionToken);
    }

    function stake(uint256 _amount) public {
        uint256 totalVizion = vizionToken.balanceOf(address(this));
        uint256 totalShares = totalSupply();

        if (totalShares == 0 || totalVizion == 0) {
            _mint(msg.sender, _amount);
        } else {
            uint256 share = (_amount * totalShares) / totalVizion;
            _mint(msg.sender, share);
        }

        vizionToken.transferFrom(msg.sender, address(this), _amount); // Not the best transfer method ?
    }

    function unstake(uint256 _share) public {
        uint256 totalShares = totalSupply();
        uint256 share = (_share * vizionToken.balanceOf(address(this))) /
            totalShares;
        _burn(msg.sender, _share);
        vizionToken.transfer(msg.sender, share);
    }
}
