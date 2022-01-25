import { createTheme, responsiveFontSizes } from '@material-ui/core'

export const theme = responsiveFontSizes(
    createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#75fcc6',
            },
            secondary: {
                main: '#ffe710',
            },
            background: {
                paper: '#3f4c54',
                default: '#292a31',
            },
            grey: {
                50: '#3f4c54',
                100: '#e1e1e1',
                500: '#292a31',
                900: '#21272d',
            },
        },
        typography: {
            fontFamily: 'Roboto',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        color: '#75fcc6', //todo: replace this after all grey colors are added
                    },
                },
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: {
                        color: '#75fcc6',
                        backgroundColor: '#3f4c54',
                        height: '18px',
                        width: '100%',
                        borderRadius: '2px 2px 0 0',
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: '#75fcc6',
                        color: '#3f4c54',
                    },
                },
            },
        },
    })
)
