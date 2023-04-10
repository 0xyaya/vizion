// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "./VizionCollection.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title An Ownable contract named VizionGouvernance
/// @author Yann
/// @notice Core contract for the DAO
/// @dev Inherits the OpenZepplin Ownable implentation
contract VizionGouvernance is Ownable {
    enum WorkflowStatus {
        InitProposal,
        AddProposal,
        Voting,
        Error
    }

    struct Proposal {
        string proposalUri;
        string tokenUri;
        uint256 voteCount;
        mapping(address => Voter) voters;
    }

    struct Voter {
        uint weight;
        bool hasVote;
    }

    VizionCollection s_collection;
    mapping(uint256 => mapping(uint256 => Proposal)) public s_proposals;
    uint256 public s_tokenIds;
    uint256 public s_proposalIds;
    uint256 public s_currentWinningProposalId;
    uint256 public s_lastRefBlock;
    uint256 public s_creationPeriod;
    uint256 public s_votingPeriod;

    event ProposalAdded(
        address author,
        uint256 tokenId,
        uint256 proposalId,
        string uri
    );
    event Voted(address voter, uint256 tokenId, uint256 proposalId);

    constructor(
        VizionCollection _collection,
        string memory _tokenUri,
        string memory _proposalUri
    ) {
        s_collection = _collection;
        s_tokenIds = 1;
        s_proposalIds = 1;
        s_currentWinningProposalId = 1;
        s_creationPeriod = 7200; // with 1 block every 12s => 7200 = 1 day
        s_votingPeriod = 7200;
        s_lastRefBlock = block.number;
        Proposal storage p = s_proposals[1][1]; // we need a genesis proposal to initialize the contract
        p.proposalUri = _proposalUri;
        p.tokenUri = _tokenUri;
        emit ProposalAdded(
            address(msg.sender),
            s_tokenIds,
            s_proposalIds,
            _proposalUri
        );
    }

    /// @notice add a new proposal for the next nft mint
    /// @dev External function
    /// @param _tokenUri the token's uri metadata on ipfs
    /// @param _proposalUri the proposal's uri metadata on ipfs
    function addProposal(
        string memory _tokenUri,
        string memory _proposalUri
    ) external {
        WorkflowStatus status = getWorkflowStatus();
        if (status == WorkflowStatus.InitProposal) {
            initAndAdd(_tokenUri, _proposalUri);
        } else if (status == WorkflowStatus.AddProposal) {
            add(_tokenUri, _proposalUri);
        } else if (status == WorkflowStatus.Voting) {
            revert("You can't add a proposal, it's time to vote!");
        } else {
            revert("Somthing went wrong in the life cycle");
        }
    }

    function initAndAdd(
        string memory _tokenUri,
        string memory _proposalUri
    ) private {
        mintLastWinner();
        s_lastRefBlock = block.number;
        s_tokenIds += 1;
        s_proposalIds = 1;
        Proposal storage p = s_proposals[s_tokenIds][s_proposalIds];
        p.proposalUri = _proposalUri;
        p.tokenUri = _tokenUri;
        p.voteCount = 0;
        emit ProposalAdded(
            address(msg.sender),
            s_tokenIds,
            s_proposalIds,
            _proposalUri
        );
    }

    function add(string memory _tokenUri, string memory _proposalUri) private {
        s_proposalIds += 1;
        Proposal storage p = s_proposals[s_tokenIds][s_proposalIds];
        p.proposalUri = _proposalUri;
        p.tokenUri = _tokenUri;
        emit ProposalAdded(
            address(msg.sender),
            s_tokenIds,
            s_proposalIds,
            _proposalUri
        );
    }

    function mintLastWinner() private {
        Proposal storage lastProposalWinner = s_proposals[s_tokenIds][
            s_currentWinningProposalId
        ];
        s_collection.mint(lastProposalWinner.tokenUri);
    }

    /// @notice vote for the proposal
    /// @dev External function
    /// @param _proposal the proposal choosen by the voter
    function vote(uint256 _proposal) external {
        require(_proposal <= s_proposalIds, "Bad proposal id");
        require(
            getWorkflowStatus() == WorkflowStatus.Voting,
            "It's not the voting time"
        );
        Proposal storage proposal = s_proposals[s_tokenIds][_proposal];
        require(!proposal.voters[msg.sender].hasVote, "You already voted once");
        Voter storage senderVote = proposal.voters[msg.sender];
        senderVote.weight = getVotingPower(msg.sender);
        senderVote.hasVote = true;
        proposal.voteCount += senderVote.weight;
        emit Voted(address(msg.sender), s_tokenIds, _proposal);

        if (
            proposal.voteCount >
            getProposal(s_tokenIds, s_currentWinningProposalId).voteCount
        ) {
            s_currentWinningProposalId = _proposal;
        }
    }

    /// @notice get the workflow status from the parameters and current block number
    /// @dev Public function
    function getWorkflowStatus() public view returns (WorkflowStatus status) {
        if (block.number > s_lastRefBlock + s_creationPeriod + s_votingPeriod) {
            status = WorkflowStatus.InitProposal;
        } else if (
            (s_lastRefBlock < block.number) &&
            (block.number < s_lastRefBlock + s_creationPeriod)
        ) {
            status = WorkflowStatus.AddProposal;
        } else if (
            (s_lastRefBlock + s_creationPeriod < block.number) &&
            (block.number < s_lastRefBlock + s_creationPeriod + s_votingPeriod)
        ) {
            status = WorkflowStatus.Voting;
        } else {
            status = WorkflowStatus.Error;
        }
    }

    /// @notice how many block left until the next step
    /// @dev  public function
    function getBlockLeft() public view returns (uint256 blockLeft) {
        WorkflowStatus status = getWorkflowStatus();

        if (status == WorkflowStatus.AddProposal) {
            blockLeft = s_lastRefBlock + s_creationPeriod - block.number;
        } else if (status == WorkflowStatus.Voting) {
            blockLeft =
                s_lastRefBlock +
                s_creationPeriod +
                s_votingPeriod -
                block.number;
        } else if (status == WorkflowStatus.InitProposal) {
            blockLeft = 0;
        }
    }

    /// @notice update the creation period (in blocks)
    /// @dev external and onlyOwner
    /// @param _period the new creation period (in blocks)
    function setCreationPeriod(uint256 _period) external onlyOwner {
        s_creationPeriod = _period;
    }

    /// @notice update the voting period (in blocks)
    /// @dev external and onlyOwner
    /// @param _period the new voting period (in blocks)
    function setVotingPeriod(uint256 _period) external onlyOwner {
        s_votingPeriod = _period;
    }

    // Will compute a voting power later based on the VIZ tokens hold andstaked
    function getVotingPower(address _voter) internal pure returns (uint256) {
        return 1;
    }

    function getProposal(
        uint256 _count,
        uint256 _proposal
    ) internal view returns (Proposal storage) {
        return s_proposals[_count][_proposal];
    }
}
