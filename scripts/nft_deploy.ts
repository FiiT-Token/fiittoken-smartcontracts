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
  const fiitTokenDrakonPlus = await FiitTokenDrakonPlusContract.deploy(
    "https://api-game.fiittoken.io/backend/api/nft-converter/metadata/"
  );

  const NftConverterContract = await ethers.getContractFactory("NftConverter");
  const nftConverterContract = await NftConverterContract.deploy(
    fiitTokenDrakonPlus.address,
    "0xe90e019DB5868bD6E923d634715B3Ca430CdF90D"
  );

  console.log("nft deployed to:", fiitTokenDrakonPlus.address);
  console.log("nft convertor deployed to:", nftConverterContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
