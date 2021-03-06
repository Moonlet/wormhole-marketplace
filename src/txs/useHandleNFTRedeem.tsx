import {
    CHAIN_ID_SOLANA,
    getClaimAddressSolana,
    hexToUint8Array,
    parseNFTPayload,
    postVaaSolanaWithRetry,
} from '@certusone/wormhole-sdk'
import {
    createMetaOnSolana,
    getForeignAssetSol,
    isNFTVAASolanaNative,
    redeemOnSolana,
} from '@certusone/wormhole-sdk/lib/esm/nft_bridge'
import { arrayify } from '@ethersproject/bytes'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { TARGET_CHAIN } from './transfer-nft'
import {
    MAX_VAA_UPLOAD_RETRIES_SOLANA,
    SOLANA_HOST,
    SOL_BRIDGE_ADDRESS,
    SOL_NFT_BRIDGE_ADDRESS,
} from './utils/consts'
import { sendPostMessage } from './utils/helper'
import { getMetadataAddress } from './utils/metaplex'
import { signSendAndConfirm } from './utils/solana'

async function solana(
    wallet: WalletContextState,
    payerAddress: string, //TODO: we may not need this since we have wallet
    signedVAA: Uint8Array
) {
    let finalMintAddress = ''
    try {
        if (!wallet.signTransaction) {
            throw new Error('wallet.signTransaction is undefined')
        }
        const connection = new Connection(SOLANA_HOST, 'confirmed')
        const claimAddress = await getClaimAddressSolana(SOL_NFT_BRIDGE_ADDRESS, signedVAA)
        const claimInfo = await connection.getAccountInfo(claimAddress)
        let txid
        if (!claimInfo) {
            sendPostMessage('Post VAA on Solana...')
            await postVaaSolanaWithRetry(
                connection,
                wallet.signTransaction,
                SOL_BRIDGE_ADDRESS,
                payerAddress,
                Buffer.from(signedVAA),
                MAX_VAA_UPLOAD_RETRIES_SOLANA
            )
            // TODO: how do we retry in between these steps
            const transaction = await redeemOnSolana(
                connection,
                SOL_BRIDGE_ADDRESS,
                SOL_NFT_BRIDGE_ADDRESS,
                payerAddress,
                signedVAA
            )
            txid = await signSendAndConfirm(wallet, connection, transaction)
            // eslint-disable-next-line no-console
            console.log('redeem Tx: ', txid)
            // TODO: didn't want to make an info call we didn't need, can we get the block without it by modifying the above call?
        }
        const isNative = await isNFTVAASolanaNative(signedVAA)
        if (!isNative) {
            const { parse_vaa } = await import('@certusone/wormhole-sdk/lib/esm/solana/core/bridge')
            const parsedVAA = parse_vaa(signedVAA)
            const { originChain, originAddress, tokenId } = parseNFTPayload(
                Buffer.from(new Uint8Array(parsedVAA.payload))
            )
            const mintAddress = await getForeignAssetSol(
                SOL_NFT_BRIDGE_ADDRESS,
                originChain,
                hexToUint8Array(originAddress),
                arrayify(tokenId)
            )
            console.log({mintAddress})
            finalMintAddress = mintAddress
            const [metadataAddress] = await getMetadataAddress(mintAddress)
            const metadata = await connection.getAccountInfo(metadataAddress)
            if (!metadata) {
                sendPostMessage('Create metadata on Solana...')
                const transaction = await createMetaOnSolana(
                    connection,
                    SOL_BRIDGE_ADDRESS,
                    SOL_NFT_BRIDGE_ADDRESS,
                    payerAddress,
                    signedVAA
                )
                txid = await signSendAndConfirm(wallet, connection, transaction)
                // eslint-disable-next-line no-console
                console.log('create meta Tx: ', txid)
            }
        }
    } catch (e) {
        console.log(e)
    }

    return finalMintAddress
}

export const useHandleNFTRedeem = (solanaWallet: WalletContextState, signedVAAHex: string) => {
    const solPK = solanaWallet?.publicKey
    const signedVAA = hexToUint8Array(signedVAAHex)

    return () => {
        if (TARGET_CHAIN === CHAIN_ID_SOLANA && !!solanaWallet && !!solPK && signedVAA) {
            return solana(solanaWallet, solPK.toString(), signedVAA)
        }
    }
}
