//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "erc721a/contracts/IERC721A.sol";


contract NftConverter is Ownable {
    using SafeMath for uint256;    
    
    string public baseTokenURI;
    address public nftAddress;
    address public nftOwnerAddress;
    
    constructor(address _nftAddress, address _nftOwnerAddress) {
        nftAddress = _nftAddress;
        nftOwnerAddress = _nftOwnerAddress;
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

        require(recoverSigner(messageHash, signature) == nftOwnerAddress, "Export: Invalid signature");

        IERC721A(nftAddress).safeTransferFrom(nftOwnerAddress, msg.sender, tokenId, "");
    }
}