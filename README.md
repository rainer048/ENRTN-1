# ENRTN crowdsale

## Solidity compiler
- build Version :
> 0.4.24+commit.e67f0147.Emscripten.clang

## Truffle
- Version : Truffle v4.1.11

## Dependencies
We use Truffle in order to compile and test the contracts.

It can be installed:
`npm install -g truffle@4.1.11`

For more information visit https://truffle.readthedocs.io/en/latest/

We use solidity-coverage in order to define the tests coverage.

It can be installed:
`npm install --save-dev solidity-coverage`

For more information visit https://www.npmjs.com/package/solidity-coverage

### Usage
#### Test

1. Install ganache: `npm install ganache-cli`
2. Run ganache app: `node_modules/.bin/ganache-cli --gasLimit 0xfffffffffff`
3. `truffle compile` - compile all contracts
4. `truffle console --network ganache` - open console
5. `test` - run tests

#### Test coverage
1. Open a terminal at the project folder.
2. `./node_modules/.bin/solidity-coverage` - run tests and define coverage
