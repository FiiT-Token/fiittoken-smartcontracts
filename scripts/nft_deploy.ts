// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const FiitTokenDrakonPlusContract = await ethers.getContractFactory(
    "FiitTokenDrakonPlus"
  );
  const fiitTokenDrakonPlus = await FiitTokenDrakonPlusContract.deploy();

  const txHash = fiitTokenDrakonPlus.deployTransaction.hash;
  const txReceipt = await ethers.provider.waitForTransaction(txHash);

  console.log("nft deployed to:", fiitTokenDrakonPlus.address);
  console.log("Contract deployed to address:", txReceipt.contractAddress);
  console.log(
    "Checkout nft Token code via: " +
      process.env.MUMBAI_TESTNET_URL +
      "address/" +
      fiitTokenDrakonPlus.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
