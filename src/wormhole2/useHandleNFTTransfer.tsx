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

// eth tx
async function evm(
    // dispatch: any,
    // enqueueSnackbar: any,
    signer: Signer,
    tokenAddress: string,
    tokenId: string,
    recipientChain: ChainId,
    recipientAddress: Uint8Array,
    chainId: ChainId
): Promise<string | null> {
    // dispatch(setIsSending(true))
    try {
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
        // dispatch(
        //   setTransferTx({ id: receipt.transactionHash, block: receipt.blockNumber })
        // )
        // enqueueSnackbar(null, {
        //   content: <Alert severity="success">Transaction confirmed</Alert>,
        // })
        const sequence = parseSequenceFromLogEth(receipt, getBridgeAddressForChain(chainId))
        const emitterAddress = getEmitterAddressEth(getNFTBridgeAddressForChain(chainId))
        // enqueueSnackbar(null, {
        //   content: <Alert severity="info">Fetching VAA</Alert>,
        // })
        const { vaaBytes } = await getSignedVAAWithRetry(chainId, emitterAddress, sequence.toString())
        return uint8ArrayToHex(vaaBytes)
        // dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)))
        // enqueueSnackbar(null, {
        //   content: <Alert severity="success">Fetched Signed VAA</Alert>,
        // })
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return null
        // enqueueSnackbar(null, {
        //   content: <Alert severity="error">{parseError(e)}</Alert>,
        // })
        // dispatch(setIsSending(false))
    }
}

export function useHandleNFTTransfer(
    sourceTokenAddress: string /**tokenAddress in ETH  "0xdff0cbb0a50cc3eaf8242414380eb04c7283f513" */,
    sourceTokenId: string /** '15487864439031792820769872793764920336287736338831218889832296222679724195845" */,
    targetAddress: Uint8Array,
    ethProvider: IEthereumProviderContext
) {
    const { signer } = ethProvider

    return () => {
        // TODO: we should separate state for transaction vs fetching vaa
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
