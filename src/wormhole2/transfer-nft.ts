import { ChainId, CHAIN_ID_ETH, hexToUint8Array } from '@certusone/wormhole-sdk'
import {
    CHAIN_ID_ETHEREUM_ROPSTEN,
    CHAIN_ID_SOLANA,
    nativeToHexString,
    uint8ArrayToHex,
} from '@certusone/wormhole-sdk/lib/cjs/utils'
import { getForeignAssetSol as getForeignAssetSolNFT } from '@certusone/wormhole-sdk/lib/esm/nft_bridge'
// import {getForeignAssetSol as getForeignAssetSolNFT} from '../../../sdk/js/src/nft_bridge/getForeignAsset'
import { BigNumber } from '@ethersproject/bignumber'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { arrayify, zeroPad } from 'ethers/lib/utils'
import { IEthereumProviderContext } from './contexts/EthereumProviderContext'
import { useHandleNFTRedeem } from './useHandleNFTRedeem'
import { useHandleNFTTransfer } from './useHandleNFTTransfer'
import { SOL_NFT_BRIDGE_ADDRESS } from './utils/consts'
import { sendPostMessage } from './utils/helper'

export const SOURCE_CHAIN: ChainId = process.env.REACT_APP_CLUSTER === 'mainnet' ? CHAIN_ID_ETH : CHAIN_ID_ETHEREUM_ROPSTEN
export const TARGET_CHAIN: ChainId = CHAIN_ID_SOLANA

export const transferNft = async (
    sourceAsset: string /**tokenAddress */,
    sourceTokenId: string,
    ethProvider: IEthereumProviderContext,
    solanaWallet: WalletContextState
): Promise<string> => {
    if (!solanaWallet.publicKey) {
        return Promise.resolve('Missing sol pubkey')
    }

    try {
        sendPostMessage('Computing Solana addresses...')
        const targetAddressPubKey: PublicKey = await getSolanaAssociatedTokenAcc(
            sourceAsset,
            sourceTokenId,
            solanaWallet.publicKey
        )

        console.log({ targetAddressPubKey: targetAddressPubKey.toBase58() })


        const targetAddress = hexToUint8Array(
            uint8ArrayToHex(zeroPad(targetAddressPubKey.toBytes(), 32))
        )

        sendPostMessage('Transfering NFT from Ethereum...')

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const signedVAA = await useHandleNFTTransfer(
            sourceAsset,
            sourceTokenId,
            targetAddress,
            ethProvider
        )()

        // eslint-disable-next-line no-console
        console.log(`Successfully transfered, signedVaa: ${signedVAA}`)

        if (!signedVAA) {
            return Promise.reject('signedVAA is null')
        }

        sendPostMessage('Start redemming NFT on Solana...')

        // eslint-disable-next-line react-hooks/rules-of-hooks
        return await useHandleNFTRedeem(solanaWallet, signedVAA)()
    } catch (e: any) {
        // eslint-disable-next-line no-console
        console.log(e)
        return Promise.reject('Failed to transfer NFT')
    }
}

const getSolanaTokenAdddress = async (originAsset: string, tokenId: string) => {
    const originAssetHex = nativeToHexString(originAsset, SOURCE_CHAIN)

    console.log({ originAssetHex })
    console.log({ tokenId })
    const solanaToken = await getForeignAssetSolNFT(
        SOL_NFT_BRIDGE_ADDRESS,
        SOURCE_CHAIN,
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
    // eslint-disable-next-line no-console
    console.log({ targetAsset })
    const associatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(targetAsset), // this might error
        solPK
    )

    return associatedTokenAccount
}
