const { expect } = require('chai');
const hre = require('hardhat');
const {
  loadFixture,
  constants,
  mine
} = require('@nomicfoundation/hardhat-network-helpers');

describe('VizionCollection', () => {
  const deployCollectionFixture = async () => {
    const [owner, account2] = await ethers.getSigners();
    const Collection = await hre.ethers.getContractFactory('VizionCollection');
    const collection = await Collection.deploy();

    return { collection, owner, account2 };
  };

  it('Should mint a token and emit a Transfer event', async () => {
    const { collection, owner } = await loadFixture(deployCollectionFixture);

    await collection.setMinter(owner.address);

    await expect(collection.mint('tokenUri'))
      .to.emit(collection, 'Transfer')
      .withArgs('0x0000000000000000000000000000000000000000', owner.address, 1);
  });

  it('Should revert if not the minter address', async () => {
    const { collection, owner, account2 } = await loadFixture(
      deployCollectionFixture
    );

    await expect(collection.connect(account2).mint('tokenUri')).to.be.reverted;
  });

  it('Should update the minter address', async () => {
    const { collection, owner, account2 } = await loadFixture(
      deployCollectionFixture
    );

    const oldMinter = await collection.s_minter();

    await collection.setMinter(account2.address);

    const newMinter = await collection.s_minter();

    expect(oldMinter !== newMinter).to.be.true;
    expect(newMinter === account2.address).to.be.true;
  });

  it('Should revert if the caller is not the owner when setMinter', async () => {
    const { collection, owner, account2 } = await loadFixture(
      deployCollectionFixture
    );

    await expect(collection.connect(account2).setMinter(account2.address)).to.be
      .reverted;
  });

  it('Should return token URI', async () => {
    const { collection, owner, account2 } = await loadFixture(
      deployCollectionFixture
    );

    await collection.setMinter(owner.address);

    await collection.mint('tokenUri');
    const tokenUri = await collection.tokenURI(1);
    await expect(tokenUri).to.equal('tokenUri');
  });

  it('Should revert if the tokenId does not exist', async () => {
    const { collection, owner, account2 } = await loadFixture(
      deployCollectionFixture
    );

    await collection.setMinter(owner.address);

    await collection.mint('tokenUri');
    await expect(collection.tokenURI(2)).to.be.reverted;
  });
});
