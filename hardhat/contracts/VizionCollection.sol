// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title An ERC721 and Ownable contract named VizionCollection
/// @author Yann
/// @notice Serves as a NFT Collection for the VizionDAO
/// @dev Inherits the OpenZepplin ERC721 and Ownable implentation
contract VizionCollection is ERC721, Ownable {
    address public s_minter;
    uint256 private s_tokenIds;
    mapping(uint256 => string) s_tokensUri;

    modifier onlyMinter() {
        require(msg.sender == s_minter, "Only the minter address can do this");
        _;
    }

    constructor() ERC721("VizionCollection", "VIZNFT") {
        s_minter = msg.sender;
        s_tokenIds = 0;
    }


    /// @notice Get the token URI for the specific tokenId
    /// @dev Public function
    /// @param _tokenId the token identifier in the collection
    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist!");
        return string(abi.encodePacked(s_tokensUri[_tokenId]));
    }

    /// @notice Get the token URI for the specific tokenId
    /// @dev public function but can be call only by the minter address
    /// @param _tokenUri the token uri to find the token metadata on ipfs
    function mint(string memory _tokenUri) public onlyMinter {
        s_tokenIds += 1;
        s_tokensUri[s_tokenIds] = _tokenUri;
        _safeMint(owner(), s_tokenIds);
    }

    /// @notice Update the minter address
    /// @dev Public function only callable by the owner
    /// @param _minter the new minter address
    function setMinter(address _minter) external onlyOwner {
        s_minter = _minter;
    }
}
