// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "./VizionCollection.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VizionGouvernance {
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

    function setChallengePeriod(uint256 _period) external {
        s_creationPeriod = _period;
    }

    function setVotingPeriod(uint256 _period) external {
        s_votingPeriod = _period;
    }

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
