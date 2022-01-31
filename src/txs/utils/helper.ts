export const sendPostMessage = (message: string) => {
    window?.postMessage(
        {
            type: 'wormhole-processing',
            message
        },
        '*'
    )
}