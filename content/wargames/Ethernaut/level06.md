## Ethernaut Level 06 - Delegation - Write-Up
<!--Authors: OofedUp-->

Difficulty: 4/10

![image](https://i.imgur.com/u0RtmsY.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract Delegate {

  address public owner;

  function Delegate(address _owner) public {
    owner = _owner;
  }

  function pwn() public {
    owner = msg.sender;
  }
}

contract Delegation {

  address public owner;
  Delegate delegate;

  function Delegation(address _delegateAddress) public {
    delegate = Delegate(_delegateAddress);
    owner = msg.sender;
  }

  function() public {
    if(delegate.delegatecall(msg.data)) {
      this;
    }
  }
}
```

We get an instance which contains 2 contracts: `Delegation` and `Delegate`, but we can only execute from `Delegation`, and that is where we need to become owner.

This level is extremely straightforward if you know about delegate calls and normal calls (you can read more about their differences [here](https://ethereum.stackexchange.com/questions/3667/difference-between-call-callcode-and-delegatecall)). Basically, a delegate call will execute code while keeping the context of the current contract, so if variables get changed, they get changed in the contract from which the call was made.

In the `Delegation` contract we observe the following fallback function:

```javascript
function() public {
   if(delegate.delegatecall(msg.data)) {
     this;
   }
 }
```

If the function called does not exist, it will just call the function passed as `msg.data` in the `Delegate` contract, while keeping the same context. We can just execute the `Delegate.pwn()` function in order to become the owner.

First, we need to figure out the function signature of `pwn()`, and that's easy: `bytes4(keccak256("pwn()"))`. Now, if we call the contract with the function signature of `pwn()`, it will not find the function `pwn()` in the `Delegation` contract, so it execute the fallback function which will perform a `delegatecall` on the `Delegate` contract. The `Delegate` contract has a function named `pwn()` and it will make us the owner. Let's call it:

```javascript
contract.sendTransaction({data: "0xdd365b8b"})
```

![image](https://i.imgur.com/9rzy2lE.png)

![image](https://i.imgur.com/wk7qlqz.png)
