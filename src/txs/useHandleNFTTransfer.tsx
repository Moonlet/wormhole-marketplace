import {
    ChainId,
    CHAIN_ID_ETH,
    getEmitterAddressEth,
    hexToUint8Array,
    isEVMChain,
    parseSequenceFromLogEth,
} from '@certusone/wormhole-sdk'
import { nativeToHexString, uint8ArrayToHex } from '@certusone/wormhole-sdk/lib/cjs/utils'
import { getForeignAssetSol as getForeignAssetSolNFT } from '@certusone/wormhole-sdk/lib/esm/nft_bridge/getForeignAsset'
import { transferFromEth } from '@certusone/wormhole-sdk/lib/esm/nft_bridge/transfer'
import { BigNumber } from '@ethersproject/bignumber'
import { arrayify } from '@ethersproject/bytes'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { Signer } from 'ethers'
import { IEthereumProviderContext } from './contexts/EthereumProviderContext'
import { SOURCE_CHAIN, TARGET_CHAIN } from './transfer-nft'
import {
    getBridgeAddressForChain,
    getNFTBridgeAddressForChain,
    SOL_NFT_BRIDGE_ADDRESS,
} from './utils/consts'
import { getSignedVAAWithRetry } from './utils/getSignedVAAWithRetry'
import { sendPostMessage } from './utils/helper'

// eth tx
async function evm(
    signer: Signer,
    tokenAddress: string,
    tokenId: string,
    recipientChain: ChainId,
    recipientAddress: Uint8Array,
    chainId: ChainId
): Promise<string | null> {
    try {
        sendPostMessage('Wait confirmation on Ethereum blockchain...')
        const receipt = await transferFromEth(
            getNFTBridgeAddressForChain(chainId),
            signer,
            tokenAddress,
            tokenId,
            recipientChain,
            recipientAddress
        )

        // eslint-disable-next-line no-console
        console.log({ id: receipt.transactionHash, block: receipt.blockNumber })
        sendPostMessage('Transaction confirmed.')

        const sequence = parseSequenceFromLogEth(receipt, getBridgeAddressForChain(chainId))
        const emitterAddress = getEmitterAddressEth(getNFTBridgeAddressForChain(chainId))
        sendPostMessage('Fetching VAA...')
        const { vaaBytes } = await getSignedVAAWithRetry(
            chainId,
            emitterAddress,
            sequence.toString()
        )
        sendPostMessage('Fetched Signed VAA successfully...')
        return uint8ArrayToHex(vaaBytes)
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return null
    }
}

export function useHandleNFTTransfer(
    sourceTokenAddress: string,
    sourceTokenId: string,
    targetAddress: Uint8Array,
    ethProvider: IEthereumProviderContext
) {
    const { signer } = ethProvider

    return () => {
        if (
            isEVMChain(SOURCE_CHAIN) &&
            !!signer &&
            !!sourceTokenAddress &&
            !!sourceTokenId &&
            !!targetAddress
        ) {
            return evm(
                signer,
                sourceTokenAddress,
                sourceTokenId,
                TARGET_CHAIN,
                targetAddress,
                SOURCE_CHAIN
            )
        }
    }
}

const getSolanaTokenAdddress = async (originAsset: string, tokenId: string) => {
    const sourceChain = CHAIN_ID_ETH // todo: if testing, change this
    const originAssetHex = nativeToHexString(originAsset, sourceChain)

    const solanaToken = await getForeignAssetSolNFT(
        SOL_NFT_BRIDGE_ADDRESS,
        sourceChain,
        hexToUint8Array(originAssetHex || ''),
        arrayify(BigNumber.from(tokenId || '0'))
    )
    return solanaToken
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSolanaAssociatedTokenAcc = async (
    originAsset: string,
    tokenId: string,
    solPK: PublicKey
): Promise<PublicKey> => {
    const targetAsset = await getSolanaTokenAdddress(originAsset, tokenId)
    const associatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(targetAsset), // this might error
        solPK
    )

    return associatedTokenAccount
}
