import { NFTImplementation } from '@certusone/wormhole-sdk'
import { TextField } from '@mui/material'
import Typography from '@mui/material/Typography'
import { WalletName } from '@solana/wallet-adapter-wallets'
import React, { useCallback, useState } from 'react'
import { useEthereumProvider } from '../txs/contexts/EthereumProviderContext'
import { useSolanaWallet } from '../txs/contexts/SolanaWalletContext'
import { transferNft } from '../txs/transfer-nft'
import { getEthereumNFT, ethNFTToNFTParsedTokenAccount } from '../txs/utils/ethereum'
import { sendPostMessage } from '../txs/utils/helper'
import CardDetails from './card/card-details'
import useStyle from './card/card-details.style'
import ProgressBar from './loader/progress-bar'
import SubmitButton from './submit-button/submit-button'
import useEffectAsync from './use-effect-async'

const sourceAsset = '0xdff0cbb0a50cc3eaf8242414380eb04c7283f513'
const sourceTokenId =
    '15487864439031792820769872793764920336287736338831218889832296222679724195853'

// 15487864439031792820769872793764920336287736338831218889832296222679724195854
declare global {
    interface Window {
        solana: any
    }
}

type NFTDto = {
    name: string
    description?: string
    image: string
    address: string
    tokenId: string
}

const Tiexo: React.FC = () => {
    const style = useStyle()
    const ethWallet = useEthereumProvider()
    const solWallet = useSolanaWallet()
    const [nfts, setNfts] = useState<NFTDto[]>([])
    const [holderString, setHolderString] = useState<string>('')
    const [tokenIdHolderString, setTokenIdHolderString] = useState<string>('')
    const [addLoader, setAddLoader] = useState(false)

    useEffectAsync(async () => {
        ethWallet?.connect()
        solWallet?.select?.(WalletName.Phantom)
    }, [])

    useEffectAsync(async () => {
        const { connected, wallet, connect, ready } = solWallet
        if (!connected && wallet && ready) {
            await connect()
        }
    }, [solWallet.connected, solWallet.wallet?.name, solWallet.ready])

    // useEffect(() => {
    //     if (solWallet.wallet && !solWallet.connected) {
    //         solWallet.connect()
    //     }
    // }, [solWallet.wallet?.name])

    console.log('eth: ', ethWallet.signerAddress)
    console.log('sol: ', solWallet.publicKey?.toBase58())

    const getEthNft: (address: string, tokenId: string) => Promise<NFTDto> = useCallback(
        async (address: string, tokenId: string) => {
            if (ethWallet?.provider && ethWallet?.signerAddress) {
                try {
                    const tokenAccount = await getEthereumNFT(address, ethWallet?.provider)
                    if (!tokenAccount) {
                        return Promise.reject('Could not find the specified token.')
                    }
                    const data = await ethNFTToNFTParsedTokenAccount(
                        tokenAccount as NFTImplementation,
                        tokenId,
                        ethWallet?.signerAddress
                    )
                    if (!data) {
                        return Promise.reject('Unable to fetch data')
                    }

                    const splits = data?.uri?.split('/')

                    return fetch(`https://ipfs.io/ipfs/${splits[splits?.length - 1]}`).then(
                        async res => {
                            const data = await res.json()
                            const splits2 = data?.image?.split('/')
                            return {
                                ...data,
                                image: `https://ipfs.io/ipfs/${
                                    splits2[splits2?.length - 2]
                                }/image.png`,
                                address,
                                tokenId,
                            }
                        }
                    )
                } catch (e) {
                    return Promise.reject('Unable to retrive the specific token.')
                }
            } else {
                return Promise.reject({ error: 'Wallet is not connected.' })
            }
        },
        [ethWallet?.provider, ethWallet?.signerAddress]
    )

    useEffectAsync(async () => {
        if (ethWallet?.signerAddress && sourceAsset && sourceTokenId) {
            const data = await getEthNft(sourceAsset, sourceTokenId)
            console.log({ data })
            setNfts([data])
        }
    }, [ethWallet?.signerAddress])

    const onTransferToSol = async (nft: NFTDto) => {
        window?.postMessage(
            {
                type: 'wormhole-start-processing',
            },
            '*'
        )
        try {
            sendPostMessage('Start processing...')
            const mint = await transferNft(nft.address, nft.tokenId, ethWallet, solWallet)
            console.log({ mint })
            sendPostMessage('Success.')
            window.location.href = `${
                window.location.origin
            }/marketplace/nft/${'3k5AG1VM5BMjNj1AaRFjCDn5fkSotVWYY5yJwJbPo2tY'}`
        } catch (e) {
            sendPostMessage('Failed to transfer the NFT, try again later')
            console.log('Failed to transfer the NFT ', e)
        }
    }

    const onAddNft = async () => {
        if (!holderString || !tokenIdHolderString) {
            return
        }
        setAddLoader(true)
        try {
            const newNft = await getEthNft(holderString, tokenIdHolderString)
            if (newNft) {
                setNfts([...nfts, newNft])
                setHolderString('')
                setTokenIdHolderString('')
            }
        } catch (e) {
            console.log(e)
        } finally {
            setAddLoader(false)
        }
    }

    if (sourceAsset && sourceTokenId && nfts.length === 0) {
        return (
            <div style={{ marginLeft: '48%', marginTop: '15%' }}>
                <ProgressBar />
            </div>
        )
    }

    return (
        <div style={{ display: 'flex' }}>
            {nfts.map((nft, index) => (
                <div key={index}>
                    <CardDetails
                        title={nft.name}
                        description={nft.description}
                        imgURI={nft.image}
                        actionText={'Transfer to Solana'}
                        onClickHandler={() => onTransferToSol(nft)}
                    />
                </div>
            ))}
            <div className={style.addWrapper}>
                <Typography textAlign={'center'} color={'#e1e1e1'}>
                    If you don't see your NFT, add it manually
                </Typography>
                <TextField
                    variant="outlined"
                    label="Address"
                    value={holderString}
                    autoComplete="off"
                    onChange={event => setHolderString(event.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    variant="outlined"
                    label="Token Id"
                    value={tokenIdHolderString}
                    autoComplete="off"
                    onChange={event => setTokenIdHolderString(event.target.value)}
                    fullWidth
                    margin="normal"
                />
                <div>
                    <SubmitButton
                        variant="outlined"
                        color="primary"
                        // className={style.button}
                        disabled={!holderString || !tokenIdHolderString}
                        onClick={onAddNft}
                        label={'Add NFT'}
                        loading={addLoader}
                    />
                </div>
            </div>
        </div>
    )
}

export default Tiexo
