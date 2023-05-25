const hre = require('hardhat');

async function main() {
  const Token = await hre.ethers.getContractFactory('VizionToken');
  const token = await Token.deploy();
  await token.deployed();

  console.log(`Token Vizion deployed to ${token.address}`);

  const Staking = await hre.ethers.getContractFactory('VizionStaking');
  const staking = await Staking.deploy(token.address);
  await staking.deployed();

  console.log(`Vizion Staking deployed to ${staking.address}`);

  const name = await token.name();
  const supply = await token.totalSupply();
  const signers = await hre.ethers.getSigners();
  const ownerBalance = await token.balanceOf(signers[0].address);
  const decimals = await token.decimals();
  console.log(`Token name: ${name}`);
  console.log(`Total supply: ${ethers.utils.commify(supply)}`);
  console.log(`Owner address: ${signers[0].address}`);
  console.log(
    `Owner balance: ${hre.ethers.utils.formatUnits(ownerBalance, decimals)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
