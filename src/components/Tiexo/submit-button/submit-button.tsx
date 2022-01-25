import { CircularProgress, ButtonProps } from '@mui/material'
import Button from '@mui/material/Button'
import React from 'react'
import styles from './submit-button.style'

// need to be defined like this because 'ButtonProps' is a type
export type ISubmitButtonProps = {
    label?: string
    loading?: boolean
} & ButtonProps

const SubmitButton: React.FC<ISubmitButtonProps> = (props: ISubmitButtonProps) => {
    const style = styles()
    const { label, loading, ...buttonProps } = props
    return (
        <Button
            variant="contained"
            color="primary"
            onClick={props.onClick}
            className={style.submitButton}
            disabled={props.disabled}
            {...buttonProps}
        >
            {!loading ? (
                label
            ) : (
                <CircularProgress size={24} color={'primary'} className={style.loader} />
            )}
        </Button>
    )
}

export default SubmitButton
