import { css } from '@emotion/css'
import { Theme } from '@mui/material'
import { createUseStyle } from '../theme'

export default createUseStyle((theme: Theme) => ({
    wrapper: css`
        background-color: ${theme.palette.background.paper};
        width: 100%;
        height: 100%;
        border-radius: 8px;
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;

        img {
            border-radius: 8px 8px 0 0;
        }
    `,
    detailsWrapper: css`
        color: ${theme.palette.common.white};
        text-align: center;
        padding: 5px 5px 0 5px;
        width: 100%;
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;
        min-height: 124px;

        .very-scarce {
            color: ${theme.palette.primary.main};
        }

        .scarce {
            color: ${theme.palette.primary.main};
            opacity: 0.5;
        }

        .abundant {
            color: ${theme.palette.secondary.main};
            opacity: 0.5;
        }

        .very-abundant {
            color: ${theme.palette.secondary.main};
        }

        .neutral {
            color: #979797;
        }
    `,
    imgWrapper: css`
        display: flex;
        flex: 2;

        img {
            min-height: 276px;
            max-width: 100%;
            cursor: pointer;
        }

        span {
            margin: auto;
        }
    `,
    incomingWrapper: css`
        background-color: ${theme.palette.background.paper};
        width: 100%;
        height: 100%;
        border-radius: 8px;
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;

        img {
            border-radius: 8px 8px 0 0;
        }
    `,
    detailsIncoming: css`
        color: ${theme.palette.common.white};
        text-align: center;
        padding: 5px 5px 0 5px;
        width: 100%;
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;
        min-height: 75px;

        p {
            font-size: 18px;
            margin: 0px;
        }

        .very-scarce {
            color: ${theme.palette.primary.main};
        }

        .scarce {
            color: ${theme.palette.primary.main};
            opacity: 0.5;
        }

        .abundant {
            color: ${theme.palette.secondary.main};
            opacity: 0.5;
        }

        .very-abundant {
            color: ${theme.palette.secondary.main};
        }

        .neutral {
            color: #979797;
        }
    `,
    button: css`
        height: 32px;
        border: 1px solid ${theme.palette.primary.main};
        border-radius: 4px !important;
        padding: 6px 16px !important;
        margin-bottom: 13px !important;

        &:disabled,
        &[disabled] {
            cursor: not-allowed !important;
        }
    `,
    title: css`
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 150%;
        margin: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    `,
    titleIncoming: css`
        font-style: normal;
        font-weight: bold;
        font-size: 26px !important;
        line-height: 150%;
        margin: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    `,
    // text will be on maximum 2 lines
    details: css`
        font-size: 14px;
        line-height: 1.5em;
        min-height: 26px;
        max-height: 3.5em;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        padding: 0 3px 5px 3px;

        flex: 1;
        * {
            margin: 0;
        }
    `,
}))
