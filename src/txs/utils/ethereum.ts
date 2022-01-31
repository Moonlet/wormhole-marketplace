import {
  NFTImplementation,
  NFTImplementation__factory,
  TokenImplementation,
  TokenImplementation__factory,
} from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { arrayify, formatUnits } from "ethers/lib/utils";


export function createParsedTokenAccount(
    publicKey: string,
    mintKey: string,
    amount: string,
    decimals: number,
    uiAmount: number,
    uiAmountString: string,
    symbol?: string,
    name?: string,
    logo?: string,
    isNativeAsset?: boolean
  ): any {
    return {
      publicKey: publicKey,
      mintKey: mintKey,
      amount,
      decimals,
      uiAmount,
      uiAmountString,
      symbol,
      name,
      logo,
      isNativeAsset,
    };
  }

export function createNFTParsedTokenAccount(
    publicKey: string,
    mintKey: string,
    amount: string,
    decimals: number,
    uiAmount: number,
    uiAmountString: string,
    tokenId: string,
    symbol?: string,
    name?: string,
    uri?: string,
    animation_url?: string,
    external_url?: string,
    image?: string,
    image_256?: string,
    nftName?: string,
    description?: string
  ): any {
    return {
      publicKey,
      mintKey,
      amount,
      decimals,
      uiAmount,
      uiAmountString,
      tokenId,
      uri,
      animation_url,
      external_url,
      image,
      image_256,
      symbol,
      name,
      nftName,
      description,
    };
  }
//This is a valuable intermediate step to the parsed token account, as the token has metadata information on it.
export async function getEthereumToken(
  tokenAddress: string,
  provider: ethers.providers.Web3Provider
) {
  const token = TokenImplementation__factory.connect(tokenAddress, provider);
  return token;
}

export async function ethTokenToParsedTokenAccount(
  token: TokenImplementation,
  signerAddress: string
) {
  const decimals = await token.decimals();
  const balance = await token.balanceOf(signerAddress);
  const symbol = await token.symbol();
  const name = await token.name();
  return createParsedTokenAccount(
    signerAddress,
    token.address,
    balance.toString(),
    decimals,
    Number(formatUnits(balance, decimals)),
    formatUnits(balance, decimals),
    symbol,
    name
  );
}

// other
//This is a valuable intermediate step to the parsed token account, as the token has metadata information on it.
export async function getEthereumNFT(
  tokenAddress: string,
  provider: ethers.providers.Web3Provider
) {
  const token = NFTImplementation__factory.connect(tokenAddress, provider);
  return token;
}

export async function isNFT(token: NFTImplementation) {
  const erc721 = "0x80ac58cd";
  const erc721metadata = "0x5b5e139f";
  const supportsErc721 = await token.supportsInterface(arrayify(erc721));
  const supportsErc721Metadata = await token.supportsInterface(
    arrayify(erc721metadata)
  );
  return supportsErc721 && supportsErc721Metadata;
}

// this
export async function ethNFTToNFTParsedTokenAccount(
  token: NFTImplementation,
  tokenId: string,
  signerAddress: string
) {
  const decimals = 0;
  const balance = (await token.ownerOf(tokenId)) === signerAddress ? 1 : 0;
  const symbol = await token.symbol();
  const name = await token.name();
  const uri = await token.tokenURI(tokenId);
  return createNFTParsedTokenAccount(
    signerAddress,
    token.address,
    balance.toString(),
    decimals,
    Number(formatUnits(balance, decimals)),
    formatUnits(balance, decimals),
    tokenId,
    symbol,
    name,
    uri
  );
}

export function isValidEthereumAddress(address: string) {
  return ethers.utils.isAddress(address);
}
