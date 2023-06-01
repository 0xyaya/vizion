// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Auction {
    IERC20 public immutable vizionToken;
    IERC721 public immutable vizionCollection;

    struct AuctionItem {
        uint256 tokenId;
        uint256 price;
        uint256 duration;
        address winner;
        bool sold;
    }

    struct BidItem {
        address bidder;
        uint256 price;
        uint256 timestamp;
        bool refunded;
        bool won;
    }

    event AuctionCreated(uint256 tokenId, uint256 price);
    event BidPlaced(address bidder, uint256 tokenId, uint256 price);

    uint256 public totalAuction;
    uint256 public royalityFee;

    mapping(uint256 => AuctionItem) public auctions;
    mapping(uint256 => BidItem[]) public bids;

    constructor(address _vizionToken, address _vizionCollection) {
        vizionToken = IERC20(_vizionToken);
        vizionCollection = IERC721(_vizionCollection);
        totalAuction = 0;
    }

    function createAuction(uint256 _tokenId, uint256 _price) public {
        vizionCollection.setApprovalForAll(address(this), true);
        vizionCollection.transferFrom(msg.sender, address(this), _tokenId);

        totalAuction += 1;

        AuctionItem memory auction;
        auction.tokenId = _tokenId;
        auction.price = _price;
        auction.duration = getTimestamp(0, 0, 0, 0);

        auctions[_tokenId] = auction;
    }

    function placeBid(uint256 _tokenId) public payable {
        require(msg.value >= auctions[_tokenId].price, "Insufficient Amount");
        require(!auctions[_tokenId].sold, "Already sold");
        require(getTimestamp(0, 0, 0, 0) <= auctions[_tokenId].duration, "Auction duration end");

        BidItem memory bid;
        bid.bidder = msg.sender;
        bid.price = msg.value;
        bid.timestamp = getTimestamp(0,0,0,0);

        bids[_tokenId].push(bid);
    }

    function claimPrize(uint256 _tokenId, uint256 _bid) public {
        require(
            getTimestamp(0, 0, 0, 0) > auctions[_tokenId].duration,
            "Auction still Live"
        );
        require(
            auctions[_tokenId].winner == msg.sender,
            "You are not the winner"
        );

        bids[_tokenId][_bid].won = true;
        auctions[_tokenId].sold = true;

        uint price = auctions[_tokenId].price;
        
        // Buyback vizionToken with USDC/ETH
        //Send money to the staking contract
        payTo(address(vizionToken), price);

        performRefund(_tokenId);
    }

    function performRefund(uint tokenId) internal {
        for (uint i = 0; i < bids[tokenId].length; i++) {
            if (bids[tokenId][i].bidder != msg.sender) {
                bids[tokenId][i].refunded = true;
                payTo(
                    bids[tokenId][i].bidder,
                    bids[tokenId][i].price
                );
            } else {
                bids[tokenId][i].won = true;
            }
            bids[tokenId][i].timestamp = getTimestamp(0, 0, 0, 0);
        }

        delete bids[tokenId];
    }

    function getTimestamp(
        uint sec,
        uint min,
        uint hour,
        uint day
    ) internal view returns (uint) {
        return
            block.timestamp +
            (1 seconds * sec) +
            (1 minutes * min) +
            (1 hours * hour) +
            (1 days * day);
    }

    function payTo(address to, uint amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }
}