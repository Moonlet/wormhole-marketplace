import { ChainId } from "@certusone/wormhole-sdk";
import {
  Button,
  Container,
  Step,
  StepButton,
  StepContent,
  Stepper,
} from "@material-ui/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { useEthereumProvider } from "../../contexts/EthereumProviderContext";
import useCheckIfWormholeWrapped from "../../hooks/useCheckIfWormholeWrapped";
import useFetchTargetAsset from "../../hooks/useFetchTargetAsset";
import { setSourceChain, setStep, setTargetChain } from "../../store/nftSlice";
import {
  selectNFTActiveStep,
  selectNFTIsRedeemComplete,
  selectNFTIsRedeeming,
  selectNFTIsSendComplete,
  selectNFTIsSending,
} from "../../store/selectors";
import { CHAINS_WITH_NFT_SUPPORT } from "../../utils/consts";
import { transferNft } from "../../wormhole2/transfer-nft";
import Redeem from "./Redeem";
import RedeemPreview from "./RedeemPreview";
import Send from "./Send";
import SendPreview from "./SendPreview";
import Source from "./Source";
import SourcePreview from "./SourcePreview";
import Target from "./Target";
import TargetPreview from "./TargetPreview";

const sourceAsset = '0xdff0cbb0a50cc3eaf8242414380eb04c7283f513'
const sourceTokenId =
    '15487864439031792820769872793764920336287736338831218889832296222679724195846'

function NFT() {
  useCheckIfWormholeWrapped(true);
  useFetchTargetAsset(true);
  const dispatch = useDispatch();
  const activeStep = useSelector(selectNFTActiveStep);
  const isSending = useSelector(selectNFTIsSending);
  const isSendComplete = useSelector(selectNFTIsSendComplete);
  const isRedeeming = useSelector(selectNFTIsRedeeming);
  const isRedeemComplete = useSelector(selectNFTIsRedeemComplete);
  const preventNavigation =
    (isSending || isSendComplete || isRedeeming) && !isRedeemComplete;

  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const pathSourceChain = query.get("sourceChain");
  const pathTargetChain = query.get("targetChain");

  const walletSolana = useWallet()
  const walletEth = useEthereumProvider()

  //This effect initializes the state based on the path params
  useEffect(() => {
    if (!pathSourceChain && !pathTargetChain) {
      return;
    }
    try {
      const sourceChain: ChainId | undefined = CHAINS_WITH_NFT_SUPPORT.find(
        (x) => parseFloat(pathSourceChain || "") === x.id
      )?.id;
      const targetChain: ChainId | undefined = CHAINS_WITH_NFT_SUPPORT.find(
        (x) => parseFloat(pathTargetChain || "") === x.id
      )?.id;

      if (sourceChain === targetChain) {
        return;
      }
      if (sourceChain) {
        dispatch(setSourceChain(sourceChain));
      }
      if (targetChain) {
        dispatch(setTargetChain(targetChain));
      }
    } catch (e) {
      console.error("Invalid path params specified.");
    }
  }, [pathSourceChain, pathTargetChain, dispatch]);

  useEffect(() => {
    if (preventNavigation) {
      window.onbeforeunload = () => true;
      return () => {
        window.onbeforeunload = null;
      };
    }
  }, [preventNavigation]);
  return (
    <Container maxWidth="md">
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step
          expanded={activeStep >= 0}
          disabled={preventNavigation || isRedeemComplete}
        >
          <StepButton onClick={() => dispatch(setStep(0))}>Source</StepButton>
          <StepContent>
            {activeStep === 0 ? <Source /> : <SourcePreview />}
          </StepContent>
        </Step>
        <Step
          expanded={activeStep >= 1}
          disabled={preventNavigation || isRedeemComplete || activeStep === 0}
        >
          <StepButton onClick={() => dispatch(setStep(1))}>Target</StepButton>
          <StepContent>
            {activeStep === 1 ? <Target /> : <TargetPreview />}
          </StepContent>
        </Step>
        <Step expanded={activeStep >= 2} disabled={isSendComplete}>
          <StepButton disabled>Send NFT</StepButton>
          <StepContent>
            {activeStep === 2 ? <Send /> : <SendPreview />}
          </StepContent>
        </Step>
        <Step expanded={activeStep >= 3} completed={isRedeemComplete}>
          <StepButton
            onClick={() => dispatch(setStep(3))}
            disabled={!isSendComplete || isRedeemComplete}
          >
            Redeem NFT
          </StepButton>
          <StepContent>
            {isRedeemComplete ? <RedeemPreview /> : <Redeem />}
          </StepContent>
        </Step>
      </Stepper>
      <Button onClick={() => transferNft(sourceAsset, sourceTokenId, walletEth, walletSolana)}>test</Button>
    </Container>
  );
}

export default NFT;
