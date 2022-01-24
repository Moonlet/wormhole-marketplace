import detectEthereumProvider from '@metamask/detect-provider'
import { BigNumber, ethers } from 'ethers'
import React, { ReactChildren, useCallback, useContext, useMemo, useState } from 'react'

export type Provider = ethers.providers.Web3Provider | undefined
export type Signer = ethers.Signer | undefined

export interface IEthereumProviderContext {
    connect(): void
    disconnect(): void
    provider: Provider
    chainId: number | undefined
    signer: Signer
    signerAddress: string | undefined
    providerError: string | null
}

const EthereumProviderContext = React.createContext<IEthereumProviderContext>({
    connect: () => undefined,
    disconnect: () => undefined,
    provider: undefined,
    chainId: undefined,
    signer: undefined,
    signerAddress: undefined,
    providerError: null,
})
export const EthereumProviderProvider = ({ children }: { children: ReactChildren }) => {
    const [providerError, setProviderError] = useState<string | null>(null)
    const [provider, setProvider] = useState<Provider>(undefined)
    const [chainId, setChainId] = useState<number | undefined>(undefined)
    const [signer, setSigner] = useState<Signer>(undefined)
    const [signerAddress, setSignerAddress] = useState<string | undefined>(undefined)
    const connect = useCallback(() => {
        setProviderError(null)
        detectEthereumProvider()
            .then(detectedProvider => {
                if (detectedProvider) {
                    const provider = new ethers.providers.Web3Provider(
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        detectedProvider,
                        'any'
                    )
                    provider
                        .send('eth_requestAccounts', [])
                        .then(() => {
                            setProviderError(null)
                            setProvider(provider)
                            provider
                                .getNetwork()
                                .then(network => {
                                    setChainId(network.chainId)
                                })
                                .catch(() => {
                                    setProviderError('An error occurred while getting the network')
                                })
                            const signer = provider.getSigner()
                            setSigner(signer)
                            signer
                                .getAddress()
                                .then(address => {
                                    setSignerAddress(address)
                                })
                                .catch(() => {
                                    setProviderError(
                                        'An error occurred while getting the signer address'
                                    )
                                })
                            // TODO: try using ethers directly
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            if (detectedProvider?.on) {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                detectedProvider.on('chainChanged', chainId => {
                                    try {
                                        setChainId(BigNumber.from(chainId).toNumber())
                                    } catch (e) {
                                        // eslint-disable-next-line no-console
                                        console.log(e)
                                    }
                                })
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                detectedProvider.on('accountsChanged', () => {
                                    try {
                                        const signer = provider.getSigner()
                                        setSigner(signer)
                                        signer
                                            .getAddress()
                                            .then(address => {
                                                setSignerAddress(address)
                                            })
                                            .catch(() => {
                                                setProviderError(
                                                    'An error occurred while getting the signer address'
                                                )
                                            })
                                    } catch (e) {
                                        // eslint-disable-next-line no-console
                                        console.log(e)
                                    }
                                })
                            }
                        })
                        .catch(() => {
                            setProviderError('An error occurred while requesting eth accounts')
                        })
                } else {
                    setProviderError('Please install MetaMask')
                }
            })
            .catch(() => {
                setProviderError('Please install MetaMask')
            })
    }, [])
    const disconnect = useCallback(() => {
        setProviderError(null)
        setProvider(undefined)
        setChainId(undefined)
        setSigner(undefined)
        setSignerAddress(undefined)
    }, [])
    const contextValue = useMemo(
        () => ({
            connect,
            disconnect,
            provider,
            chainId,
            signer,
            signerAddress,
            providerError,
        }),
        [connect, disconnect, provider, chainId, signer, signerAddress, providerError]
    )
    return (
        <EthereumProviderContext.Provider value={contextValue}>
            {children}
        </EthereumProviderContext.Provider>
    )
}
export const useEthereumProvider = () => {
    return useContext(EthereumProviderContext)
}
