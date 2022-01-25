import { createUseStyle } from '../theme'
import { css } from '@emotion/css'

export default createUseStyle(() => ({
    submitButton: css`
        /* height: 32px; */
        /* width: 100%; */
        /* text-transform: none !important; */
        border: 1px solid '#75fcc6';
    `,

    loader: css`
        color: #21272d !important;
    `,
}))
