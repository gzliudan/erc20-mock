// SPDX-License-Identifier: MIT

// ==================== External Imports ====================

const fs = require('fs');
const dayjs = require('dayjs');

const DIR = './deploy/deployed';

function getDataTime() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDeployedContracts(chainName, chainId) {
  const filename = `${DIR}/${chainName}.json`;

  let contracts;

  try {
    contracts = JSON.parse(fs.readFileSync(filename));
  } catch (e) {
    // console.error(e);
    contracts = {
      chain_name: chainName,
      chain_id: chainId,
    };
  }

  return { directory: DIR, filename, contracts };
}

function writeDeployedContracts(directory, filename, contracts) {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(contracts, null, 2));
}

async function deployContract(deployer, network, addresses, contractAbstraction, key, args = []) {
  const deployAccount = addresses[0];
  const contractName = contractAbstraction.contractName;
  const chainID = deployer.options.network_id;

  // print deploy information
  console.log(`\nnetwork = ${network}, account = ${deployAccount}, contract = ${contractName}\n`);

  // deploy contract to network
  console.log(`[${getDataTime()}] DO: deploy ${key} to ${network}\n`);
  await deployer.deploy(contractAbstraction, ...args);
  const instance = await contractAbstraction.deployed();
  const address = instance.address;
  const hash = contractAbstraction.transactionHash;
  const block = (await contractAbstraction.web3.eth.getTransaction(hash)).blockNumber;
  console.log(`\n[${getDataTime()}] OK: ${key} is deployed at: ${address}, block = ${block}, hash = ${hash}\n`);

  // save contract to file
  const { directory, filename, contracts } = getDeployedContracts(network, chainID);
  contracts[key] = { name: contractName, args, address, block, hash };
  writeDeployedContracts(directory, filename, contracts);
  console.log(`[${getDataTime()}] OK: save ${key} to file ${filename}\n`);

  return instance;
}

module.exports = {
  sleep,
  deployContract,
};
