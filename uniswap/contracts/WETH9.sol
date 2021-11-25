//SPDX-License-Identifier: Unlicense
pragma solidity >0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract WETH9 is ERC20 {
    constructor(uint256 initialSupply) ERC20("WETH9", "WETH") {
        _mint(msg.sender, initialSupply);
    }
}
