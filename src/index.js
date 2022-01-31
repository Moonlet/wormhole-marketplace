import { MuiThemeProvider } from '@material-ui/core'
import { ThemeProvider } from '@mui/material/styles'
import ReactDOM from 'react-dom'
import App from './App'
import { EthereumProviderProvider } from './txs/contexts/EthereumProviderContext'
import { SolanaWalletProvider } from './txs/contexts/SolanaWalletContext.tsx'
import { theme } from './muiTheme'

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
            <SolanaWalletProvider>
                <EthereumProviderProvider>
                    <App />
                </EthereumProviderProvider>
            </SolanaWalletProvider>
        </ThemeProvider>
    </MuiThemeProvider>,
    document.getElementById('wormhole')
)
