import { createUseStyle } from '../theme'
import { css } from '@emotion/css'

export default createUseStyle(() => ({
    submitButton: css`
        /* height: 32px; */
        /* width: 100%; */
        /* text-transform: none !important; */
        color: #75fcc6 !important;
        border: 1px solid '#75fcc6';
        border-radius: 4px !important;
        /* padding: 6px 16px !important; */
        margin-bottom: 13px !important;
        color: #75fcc6 !important;
        /* font-size: 23px !important; */
        min-width: 100px !important;
        min-height: 40px !important;
    `,

    loader: css`
        color: #75fcc6 !important;
    `,
}))
