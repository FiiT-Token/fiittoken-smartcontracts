//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

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
    mapping(bytes => bool) private _signatureUseds;
    
    constructor() {}

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
        string memory operator,
        uint256 nonce,
        uint256 expiredAt
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(to, tokenId, operator, nonce, expiredAt));
    }

    function exportNft(uint tokenId, uint256 nonce, uint256 expiredAt, bytes memory signature) external {
        require(_signatureUseds[signature] == false, "Export: Signature is already used");
        _signatureUseds[signature] = true;

        bytes32 messageHash = getMessageHash(
            msg.sender,
            tokenId, // token id
            "export",
            nonce,
            expiredAt
        );

        require(recoverSigner(messageHash, signature) == nftOwnerAddress, "Export: Invalid signature");

        require(expiredAt >= block.timestamp, "Export: Transaction Expired");

        IERC721A(nftAddress).safeTransferFrom(nftOwnerAddress, msg.sender, tokenId, "");
    }

    function importNft(uint tokenId, uint256 nonce, uint256 expiredAt, bytes memory signature) external {
        require(_signatureUseds[signature] == false, "Import: Signature is already used");
        _signatureUseds[signature] = true;

        bytes32 messageHash = getMessageHash(
            msg.sender,
            tokenId, // token id
            "import",
            nonce,
            expiredAt
        );

        require(recoverSigner(messageHash, signature) == msg.sender, "Import: Invalid signature");

        require(expiredAt >= block.timestamp, "Import: Transaction Expired");

        IERC721A(nftAddress).safeTransferFrom(msg.sender, nftOwnerAddress, tokenId, "");
    }

    function setNftAddress(address _nftAddress) external onlyOwner{
        nftAddress = _nftAddress;
    }

    function getNftAddress() external view returns(address) {
        return nftAddress;
    }
    

    function setNftOwnerAddress(address _nftOwnerAddress) external onlyOwner {
        nftOwnerAddress = _nftOwnerAddress;
    }

    function getNftOwnerAddress() external view returns(address) {
        return nftOwnerAddress;
    }
}