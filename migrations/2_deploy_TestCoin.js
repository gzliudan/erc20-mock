// SPDX-License-Identifier: MIT

/* global artifacts */

const { deployContract } = require('../deploy/helpers');

module.exports = async (deployer, network, addresses) => {
  const key = 'test_coin';
  const args = ['Test Coin', 'TC'];
  const TestCoin = artifacts.require('TestCoin');

  await deployContract(deployer, network, addresses, TestCoin, key, args);
};
