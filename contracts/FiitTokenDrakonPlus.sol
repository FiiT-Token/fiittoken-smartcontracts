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
    
    constructor(
        string memory _baseTokenURI
    ) ERC721A("FiitTokenDrakon+", "DKP") {
        baseTokenURI = _baseTokenURI;

        _safeMint(msg.sender, MAX_SUPPLY);
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    function withdraw() external payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");

        emit Withdraw(msg.sender, balance);
    }
    
}