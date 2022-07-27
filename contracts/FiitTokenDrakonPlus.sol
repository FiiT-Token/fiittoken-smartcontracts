//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "erc721a/contracts/ERC721A.sol";


contract FiitTokenDrakonPlus is ERC721A, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    uint public constant MAX_SUPPLY = 10000;
    uint public constant PRICE = 0.01 ether;
    uint public constant MAX_PER_MINT = 5;
    
    string public baseTokenURI;
    
    constructor(string memory baseURI) ERC721A("FiitTokenDrakonPlus", "FTDP") {
        setBaseURI(baseURI);
    }

    function recoverSigner(bytes32 hash, bytes memory signature) public pure returns (address) {
        bytes32 messageDigest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32", 
                hash
            )
        );
        return ECDSA.recover(messageDigest, signature);
    }

    function reserveNFTs(uint256 amount) public onlyOwner {
        uint totalMinted = _tokenIds.current();

        require(totalMinted.add(amount) < MAX_SUPPLY, "Not enough NFTs left to reserve");

        _safeMint(msg.sender, amount);
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    // create message hash eth
    function getMessageHash(
        address to,
        uint256 tokenId,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(to, tokenId, nonce));
    }

    function exportNft(uint tokenId, uint256 nonce, bytes memory signature) public {
        bytes32 messageHash = getMessageHash(
            msg.sender,
            tokenId, // token id
            nonce
        );

        require(recoverSigner(messageHash, signature) == owner(), "Export: Invalid signature");

        safeTransferFrom(owner(), msg.sender, tokenId, "");
    }
    
   function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
    
    function mintNFTs(uint _count) public payable {
        uint totalMinted = _tokenIds.current();

        require(totalMinted.add(_count) <= MAX_SUPPLY, "Not enough NFTs left!");
        require(_count >0 && _count <= MAX_PER_MINT, "Cannot mint specified number of NFTs.");
        require(msg.value >= PRICE.mul(_count), "Not enough ether to purchase NFTs.");

        _safeMint(msg.sender, _count);
    }
    
    // function _mintSingleNFT() private {
    //     uint newTokenID = _tokenIds.current();
    //     _safeMint(msg.sender, newTokenID);
    //     _tokenIds.increment();
    // }
    
    
    function withdraw() public payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }
    
}