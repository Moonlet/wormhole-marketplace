import { NFTImplementation, TokenImplementation } from '@certusone/wormhole-sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { useEthereumProvider } from '../../contexts/EthereumProviderContext'
import { NFTParsedTokenAccount } from '../../store/nftSlice'
import {
    getEthereumNFT,
    getEthereumToken,
    ethNFTToNFTParsedTokenAccount,
    ethTokenToParsedTokenAccount,
} from '../../utils/ethereum'
import CardDetails from './card/card-details'
// import { useEthereumProvider } from '../../wormhole2/contexts/EthereumProviderContext';
import useEffectAsync from './use-effect-async'

const sourceAsset = '0xdff0cbb0a50cc3eaf8242414380eb04c7283f513'
const sourceTokenId =
    '15487864439031792820769872793764920336287736338831218889832296222679724195849'

type NFTDto = {
    name: string
    description?: string
    image: string
}

const Tiexo: React.FC = () => {
    const { provider, signerAddress, connect } = useEthereumProvider()
    const [nfts, setNfts] = useState<NFTDto[]>([])

    useEffect(() => {
        connect()
    }, [])

    const getEthNft: (
        address: string,
        tokenId: string
    ) => Promise<{
        name: string
        description: string
        image: string
    }> = useCallback(
        async (address: string, tokenId: string) => {
            if (provider && signerAddress) {
                try {
                    const tokenAccount = await getEthereumNFT(address, provider)
                    if (!tokenAccount) {
                        return Promise.reject('Could not find the specified token.')
                    }
                    const data = await ethNFTToNFTParsedTokenAccount(
                        tokenAccount as NFTImplementation,
                        tokenId,
                        signerAddress
                    )
                    if (!data) {
                        return Promise.reject('Unable to fetch data')
                    }

                    const splits = data?.uri?.split('/')

                    return fetch(`https://ipfs.io/ipfs/${splits[splits?.length - 1]}`).then(res =>
                        res.json()
                    )
                } catch (e) {
                    return Promise.reject('Unable to retrive the specific token.')
                }
            } else {
                return Promise.reject({ error: 'Wallet is not connected.' })
            }
        },
        [provider, signerAddress]
    )

    useEffectAsync(async () => {
        if (signerAddress) {
            const data = await getEthNft(sourceAsset, sourceTokenId)
            console.log({ data })
            setNfts([data])
        }
    }, [signerAddress])

    return (
        <div>
            {nfts.map(nft => (
                <CardDetails
                    title={nft.name}
                    description={nft.description}
                    imgURI={nft.image}
                    actionText={'Transfer to Solana'}
                />
            ))}
        </div>
    )
}

export default Tiexo
