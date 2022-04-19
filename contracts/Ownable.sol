
//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.3;

import { Ownable as OwnableOpenzeppelin } from "@openzeppelin/contracts/access/Ownable.sol";

contract Ownable is OwnableOpenzeppelin {
  mapping(address => bool) public _whiteList;

  /**
    * @dev Throws if called by any account other that not in white list.
    */
  modifier onlyWhitelist() {
    require(_whiteList[_msgSender()], "Ownable: caller is not in white list");
    _;
  }

  /**
  * @dev Address address in white list
  * Can only be called by the current owner.
  */
  function addToWhiteList(address _newAddress) external onlyOwner {
    require(_newAddress != address(0), "Ownable: new user is the zero address");
    _whiteList[_newAddress] = true;
  }


  /**
  * @dev Remove address from white list
  * Can only be called by the current owner.
  */
  function removeFromWhiteList(address _newAddress) external onlyOwner {
    require(_newAddress != address(0), "Ownable: new user is the zero address");
    _whiteList[_newAddress] = false;
  }
}