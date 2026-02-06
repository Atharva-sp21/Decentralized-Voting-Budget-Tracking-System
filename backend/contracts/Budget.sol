// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Budget {
    
    // --- DAY 3 REQUIREMENTS ---
    
    address public owner;

    // Events to alert the frontend when money moves
    event FundsReceived(address from, uint amount);
    event FundsReleased(address to, uint amount);

    // Set the creator (you) as the owner when the contract starts
    constructor() {
        owner = msg.sender;
    }

    // Security Guard: Only allows the owner to run specific functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized. Only owner can do this.");
        _;
    }

    // 1. Receive ETH: This function allows the contract to accept money
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    // 2. Release Funds: Send money to a specific address (e.g., a vendor or team member)
    function releaseFunds(address payable _to, uint _amount) public onlyOwner {
        // Check if the contract has enough money
        require(address(this).balance >= _amount, "Insufficient funds in budget.");
        
        // Transfer the money
        _to.transfer(_amount);
        
        // Shout that money was sent
        emit FundsReleased(_to, _amount);
    }

    // Helper: Check how much money is in the budget
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}