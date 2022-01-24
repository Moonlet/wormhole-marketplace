import Button from '@mui/material/Button'
import React from 'react'
import useStyle from './card-details.style'

export interface ICardDetailsProps {
    onClickHandler?: (id: string) => void
    title: string
    description: string | React.ReactNode
    imgURI: string
    actionText: string
}

const CardDetails: React.FC<ICardDetailsProps> = (props: ICardDetailsProps) => {
    const style = useStyle()

    return (
        <div className={style.wrapper}>
            <div className={style.imgWrapper}>
                {props?.imgURI && <img src={props?.imgURI} alt="asd" />}
            </div>
            <div className={style.detailsWrapper}>
                <p className={style.title}>{props.title || '-'}</p>
                <div className={style.details}>{props.description}</div>

                <div>
                    <Button variant="outlined" color="primary" className={style.button}>
                        {props.actionText}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CardDetails
