import { CircularProgress } from '@mui/material'
import React, { CSSProperties } from 'react'

interface IProgressBarProps {
    noTheme?: boolean // if the progress bar is used outside the ThemeContext
}

const ProgressBar: React.FC<IProgressBarProps> = props => {
    const style: CSSProperties = {
        height: 200,
        ...(props.noTheme && {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
        }),
    }
    return (
        <div style={style}>
            <CircularProgress color={props.noTheme ? 'inherit' : 'primary'} />
        </div>
    )
}

export default ProgressBar
