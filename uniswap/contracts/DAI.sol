//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract DAI is ERC20 {
    constructor(uint256 initialSupply) ERC20("DAI", "DAI") {
        _mint(msg.sender, initialSupply);
    }
}
