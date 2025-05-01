import { Fragment, useEffect, useRef, useState } from "react";
import axiosCustom from "../config/axiosCustom";
import stateJotaiAuthAtom from "../jotai/stateJotaiAuth";
import { useAtomValue } from "jotai";

const LlmTaskBackgroundProcess = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingPause, setProcessingPause] = useState(0);
    const [time, setTime] = useState(0);
    const refUseEffectCallOnce = useRef(false);

    // useEffect
    useEffect(() => {
        if (refUseEffectCallOnce.current === false) {
            console.log('LlmTaskBackgroundProcess called');
            setInterval(() => {
                setTime((prevTime) => {
                    return prevTime + 1;
                })
            }, 1000)
        }

        return () => {
            refUseEffectCallOnce.current = true;
        }
    }, [])

    useEffect(() => {
        if (isProcessing === false && processingPause <= 0) {
            if (authState.isLoggedIn === "true") {
                fetchRecords();
            }
        } else {
            if (processingPause >= 1) {
                setProcessingPause((prevNum) => {
                    return prevNum - 1;
                })
            }
        }
    }, [time])

    const fetchRecords = async () => {
        setIsProcessing(true);
        try {
            await axiosCustom.post('/api/llm-task-background-process/crud/processBackgroundTask', {}, {
                withCredentials: true,
                timeout: 100000, // Set timeout to 10 seconds
            });
        } catch (error) {
            console.error(error);
            setProcessingPause(30);
        } finally {
            setIsProcessing(false);
        }
    }

    return <Fragment />;
};

export default LlmTaskBackgroundProcess;