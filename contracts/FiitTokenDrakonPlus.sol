//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "erc721a/contracts/ERC721A.sol";


contract FiitTokenDrakonPlus is ERC721A, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    event Withdraw(address owner, uint256 amount);
    
    uint public constant MAX_SUPPLY = 2000;
    uint public constant PRICE = 0.01 ether;
    uint public constant MAX_PER_MINT = 5;
    
    string public baseTokenURI;
    
    constructor() ERC721A("FiitTokenDrakon+", "DKP") {}

    function reserveNFTs(uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Not enough NFTs left to reserve");

        _safeMint(msg.sender, amount);
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

   function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
    
    function mintNFTs(uint _count) external onlyOwner payable  {
        require(totalSupply() + _count <= MAX_SUPPLY, "Not enough NFTs left!");
        require(_count >0 && _count <= MAX_PER_MINT, "Cannot mint specified number of NFTs.");
        require(msg.value >= PRICE.mul(_count), "Not enough ether to purchase NFTs.");

        _safeMint(msg.sender, _count);
    }
    
    function withdraw() external payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");

        emit Withdraw(msg.sender, balance);
    }
    
}