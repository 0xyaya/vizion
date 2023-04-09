const { expect } = require('chai');
const hre = require('hardhat');
const {
  loadFixture,
  mine
} = require('@nomicfoundation/hardhat-network-helpers');

describe('VizionGouvernance', () => {
  const deployGouvFixture = async () => {
    const [owner, account2, account3] = await ethers.getSigners();

    const Collection = await hre.ethers.getContractFactory('VizionCollection');
    const collection = await Collection.deploy();

    const Gouvernance = await hre.ethers.getContractFactory(
      'VizionGouvernance'
    );
    const gouvernance = await Gouvernance.deploy(collection.address, '', '');

    await collection.setMinter(gouvernance.address);

    return { gouvernance, owner, account2, account3, collection };
  };

  describe('AddProposal', () => {
    it('Should add a new proposal', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      await gouvernance.addProposal('tokenUri', 'proposalUri');

      expect(await gouvernance.s_proposalIds()).to.equal(2);
    });

    it('Should emit ProposalAdded event', async () => {
      const { gouvernance, owner } = await loadFixture(deployGouvFixture);

      await expect(gouvernance.addProposal('tokenUri', 'proposalUri'))
        .to.emit(gouvernance, 'ProposalAdded')
        .withArgs(
          owner.address,
          hre.ethers.BigNumber.from(1),
          hre.ethers.BigNumber.from(2),
          'proposalUri'
        );
    });

    it('Should revert if block number is in the voting period', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      mine(7200); // After 7200 block we are in the voting period. We can't add a proposal.

      await expect(gouvernance.addProposal('tokenUri', 'proposalUri')).to.be
        .reverted;
    });
  });

  describe('Voting', () => {
    const deployedGouvInVotingPeriod = async () => {
      const { gouvernance, owner } = await loadFixture(deployGouvFixture);

      mine(7200);

      return { gouvernance, owner };
    };

    const deployedGouvWithTwoProposalsInVotingPeriod = async () => {
      const { gouvernance, owner, account2, account3 } = await loadFixture(
        deployGouvFixture
      );

      await gouvernance.addProposal('tokenUri', 'proposalUri');

      mine(7200);

      return { gouvernance, owner, account2, account3 };
    };

    it('Should revert if the proposalId is not correct', async () => {
      const { gouvernance } = await loadFixture(deployedGouvInVotingPeriod);

      await expect(gouvernance.vote(99)).to.be.reverted;
    });

    it('Should revert if the block number is not in a voting period', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      await expect(gouvernance.vote(1)).to.be.reverted;
    });

    it('Should revert if the address already vote on this proposal', async () => {
      const { gouvernance } = await loadFixture(deployedGouvInVotingPeriod);

      await gouvernance.vote(1);

      await expect(gouvernance.vote(1)).to.be.reverted;
    });

    it('Should emit a Voted event', async () => {
      const { gouvernance, owner } = await loadFixture(
        deployedGouvInVotingPeriod
      );

      await expect(gouvernance.vote(1))
        .to.emit(gouvernance, 'Voted')
        .withArgs(owner.address, 1, 1);
    });

    it('Should update the current winner if the proposal has more vote', async () => {
      const { gouvernance, owner, account2, account3 } = await loadFixture(
        deployedGouvWithTwoProposalsInVotingPeriod
      );

      await gouvernance.connect(account2).vote(1);
      expect(await gouvernance.s_currentWinningProposalId()).to.equal(1);

      await gouvernance.connect(account3).vote(2);
      await gouvernance.vote(2);
      expect(await gouvernance.s_currentWinningProposalId()).to.equal(2);
    });

    it('Should not update the current winner if the proposal has no more vote', async () => {
      const { gouvernance, owner, account2, account3 } = await loadFixture(
        deployedGouvWithTwoProposalsInVotingPeriod
      );

      await gouvernance.connect(account2).vote(1);
      await gouvernance.connect(account3).vote(1);
      expect(await gouvernance.s_currentWinningProposalId()).to.equal(1);

      await gouvernance.vote(2);
      expect(await gouvernance.s_currentWinningProposalId()).to.equal(1);
    });
  });

  describe('GetWorkflowStatus', () => {
    it('Workflow status should be InitProposal', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      await gouvernance.addProposal('tokenUri', 'proposalUri');
      mine(7200);
      await gouvernance.vote(2);
      mine(7200);

      expect(await gouvernance.getWorkflowStatus()).to.equal(0);
    });

    it('Workflow status should be AddProposal', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      expect(await gouvernance.getWorkflowStatus()).to.equal(1);
    });

    it('Workflow status should be voting', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      await gouvernance.addProposal('tokenUri', 'proposalUri');
      mine(7200);

      expect(await gouvernance.getWorkflowStatus()).to.equal(2);
    });
  });

  describe('Parameters modification', () => {
    it('Should update the creation period', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      const oldChallengePeriod = await gouvernance.s_creationPeriod();
      await gouvernance.setCreationPeriod(5000);
      const newChallengePeriod = await gouvernance.s_creationPeriod();

      expect(newChallengePeriod !== oldChallengePeriod).to.be.true;
      expect(newChallengePeriod === 5000);
    });

    it('Should revert when update creation period if the caller is not the owner', async () => {
      const { gouvernance, account2 } = await loadFixture(deployGouvFixture);

      await expect(gouvernance.connect(account2).setCreationPeriod(5000)).to.be
        .reverted;
    });

    it('Should update the voting period', async () => {
      const { gouvernance } = await loadFixture(deployGouvFixture);

      const oldChallengePeriod = await gouvernance.s_votingPeriod();
      await gouvernance.setVotingPeriod(5000);
      const newChallengePeriod = await gouvernance.s_votingPeriod();

      expect(newChallengePeriod !== oldChallengePeriod).to.be.true;
      expect(newChallengePeriod === 5000);
    });

    it('Should revert when update the voting period if the caller is not the owner', async () => {
      const { gouvernance, account2 } = await loadFixture(deployGouvFixture);

      await expect(gouvernance.connect(account2).setVotingPeriod(5000)).to.be
        .reverted;
    });
  });

  describe('GetBlockLeft', () => {
    it('Should return 0', async () => {
      const { gouvernance, account2 } = await loadFixture(deployGouvFixture);

      mine(7200);

      await gouvernance.vote(1);

      mine(7200);

      expect(await gouvernance.getBlockLeft()).to.be.equal(0);
    });

    it('Should always be lower than 7200 during the creation period', async () => {
      const { gouvernance, account2 } = await loadFixture(deployGouvFixture);

      const lastRef = await gouvernance.s_lastRefBlock();
      const creationPeriod = await gouvernance.s_creationPeriod();
      const blockNumber = await hre.ethers.provider.getBlock('latest');
      const blockLeft =
        Number(lastRef) + Number(creationPeriod) - Number(blockNumber.number);

      expect(blockLeft < 7200).to.be.true;
    });

    it('Should always be lower than 7200 during the voting period', async () => {
      const { gouvernance, account2 } = await loadFixture(deployGouvFixture);
      mine(7200);

      const lastRef = await gouvernance.s_lastRefBlock();
      const creationPeriod = await gouvernance.s_creationPeriod();
      const votingPeriod = await gouvernance.s_votingPeriod();
      const blockNumber = await hre.ethers.provider.getBlock('latest');
      const blockLeft =
        Number(lastRef) +
        Number(creationPeriod) +
        Number(votingPeriod) -
        Number(blockNumber.number);

      expect(blockLeft < 7200).to.be.true;
    });

    it('Should return the block left during the addProposal period', async () => {
      const { gouvernance, account2 } = await loadFixture(deployGouvFixture);

      mine(7200);

      await gouvernance.vote(1);

      mine(7200);

      await gouvernance.addProposal('tokenUri', 'proposalUri');

      const blockLeft = await gouvernance.getBlockLeft();

      expect(blockLeft < 7200).to.be.true;
    });

    it('Should return the block left during the voting period', async () => {
      const { gouvernance, account2 } = await loadFixture(deployGouvFixture);

      mine(7200);

      await gouvernance.vote(1);

      const blockLeft = await gouvernance.getBlockLeft();

      expect(blockLeft < 7200).to.be.true;
    });
  });
});
