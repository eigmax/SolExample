// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Factory {
    event Deployed(address addr, bytes32 salt);
    // Returns the address of the newly deployed contract
    function deploy(
        address _owner,
        uint _foo,
        bytes32 _salt
    ) public payable returns (address) {
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            _salt,
            keccak256(abi.encodePacked(
                type(TestContract).creationCode,
                abi.encode(_owner, _foo)
            ))
        )))));

        address dest = address(new TestContract{salt: _salt, value: msg.value, sender: msg.sender}(_owner, _foo));
        require(address(dest) == predictedAddress);
        emit Deployed(dest, _salt);
        return dest;
    }
}

contract TestContract {
    address public owner;
    uint public foo;

    constructor(address _owner, uint _foo) payable {
        owner = _owner;
        foo = _foo;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
