
# ChainClique Lottery - Back End 

The back-end of the [ChainClique Lottery DApp](https://www.chaincliquelottery.online) - a smart contract, deployed on Ethereum Mainnet and [verified on Etherscan](https://goerli.etherscan.io/address/0x5cfC465bcC4f50A71E96b648F27D0A2c404D7c01#code), designed 
to simulate a lottery-type activity where up-to 10 players can send ETH into a common pool
and once anyone finishes the lottery, sending a bit of LINK as payment in order to get a
truly random number through ChainLink VRF, a winner is chosen and gets sent 50% of the ETH in the pool while the rest of the players receive the other 50% split equally between them.
the rest of the players receive the other 50% split equally between them.


## Intended improvements:

As this is an example of a singe lottery contract where anyone can enter and anyone can finish the lottery(a feature implemented to stop a potential
group of players from blocking the contract by never requesting a winner), future improvements would consist 
of creating a contract that would deploy single instances of this contract and would 
allow its deployer to add/remove players and request a winner so that many of these contracts could be active at once. As I've already made a 
contract deployer for another project , [BEPenator-2000](https://www.beperator2000.online/), this improvement is purely an issue of time right now.





## Tech Stack:

The main technologies used in this project are:

- [Solidity](https://docs.soliditylang.org/en/v0.8.17/) - Language for writing smart contracts on EVM compatible chains.
- [Hardhat](https://hardhat.org/) - Ethereum development environment.



