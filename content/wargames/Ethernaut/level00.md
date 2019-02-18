## Ethernaut Level 00 - Hello Ethernaut - Write-Up
<!--Authors: OofedUp-->

Difficulty: 0/10

![image](https://i.imgur.com/yXJKkmj.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract Instance {

  string public password;
  uint8 public infoNum = 42;
  string public theMethodName = 'The method name is method7123949.';
  bool private cleared = false;

  // constructor
  function Instance(string _password) public {
    password = _password;
  }

  function info() public pure returns (string) {
    return 'You will find what you need in info1().';
  }

  function info1() public pure returns (string) {
    return 'Try info2(), but with "hello" as a parameter.';
  }

  function info2(string param) public pure returns (string) {
    if(keccak256(param) == keccak256('hello')) {
      return 'The property infoNum holds the number of the next info method to call.';
    }
    return 'Wrong parameter.';
  }

  function info42() public pure returns (string) {
    return 'theMethodName is the name of the next method.';
  }

  function method7123949() public pure returns (string) {
    return 'If you know the password, submit it to authenticate().';
  }

  function authenticate(string passkey) public {
    if(keccak256(passkey) == keccak256(password)) {
      cleared = true;
    }
  }

  function getCleared() public view returns (bool) {
    return cleared;
  }
}
```

## Solve
This level was designed to get people comfortable with the js console you use to interact with contracts in Ethernaut. The following commands will solve this level (while following instructions):

```
contract.info()
contract.info1()
contract.info2("hello")
contract.infoNum()
contract.info42()
contract.theMethodName()
contract.method7123949()
contract.password()
contract.authenticate("ethernaut0")
contract.getCleared()
```

We then submit the contract and we solved the "challenge"!

![image](https://i.imgur.com/1xxvmL5.png)
