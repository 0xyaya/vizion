const hre = require('hardhat');

async function main() {
  const Collection = await hre.ethers.getContractFactory('VizionCollection');
  const collection = await Collection.deploy();
  await collection.deployed();

  console.log(`Collection  deployed to ${collection.address}`);

  const VizionGouvernance = await hre.ethers.getContractFactory(
    'VizionGouvernance'
  );
  const genesisProposalUri = '';
  const genesisTokenUri = '';

  const vizionGouvernance = await VizionGouvernance.deploy(
    collection.address,
    genesisTokenUri,
    genesisProposalUri
  );

  await vizionGouvernance.deployed();

  console.log(`VizionGouvernance  deployed to ${vizionGouvernance.address}`);

  await collection.setMinter(vizionGouvernance.address);

  console.log(
    `Set the gouvernance contract ${vizionGouvernance.address} as a vizion collection minter`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
