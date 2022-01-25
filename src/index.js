import { MuiThemeProvider } from '@material-ui/core'
import { ThemeProvider } from '@mui/material/styles'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { EthereumProviderProvider } from './wormhole2/contexts/EthereumProviderContext'
import { SolanaWalletProvider } from './wormhole2/contexts/SolanaWalletContext.tsx'
import { theme } from './muiTheme'

ReactDOM.render(
        <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
                <SolanaWalletProvider>
                    <EthereumProviderProvider>
                        <HashRouter>
                            <App />
                        </HashRouter>
                    </EthereumProviderProvider>
                </SolanaWalletProvider>
            </ThemeProvider>
        </MuiThemeProvider>
    ,
    document.getElementById('wormhole')
)
