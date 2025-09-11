import { Fragment } from "react";
import { useAtomValue } from "jotai";
import { LucideFile, LucideMic } from "lucide-react";
import toast from "react-hot-toast";

import stateJotaiAuthAtom from "../jotai/stateJotaiAuth";

const FileUploadEnvCheck = ({
    children,
    iconType,
}: {
    children: React.ReactNode;
    iconType: 'audio' | 'file';
}) => {
    const authState = useAtomValue(stateJotaiAuthAtom);

    return (
        <Fragment>
            {authState.apiKeyS3Valid ? (
                <Fragment>
                    {children}
                </Fragment>
            ) : (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                    style={{
                        height: '40px',
                    }}
                    onClick={() => {
                        toast.error("S3 compatible storage are required. Please set up S3 compatible storage in the settings.");
                    }}
                >
                    {
                        iconType === 'audio' ? (
                            <LucideMic
                                style={{
                                    height: '20px',
                                }}
                            />
                        ) : (
                            <LucideFile
                                style={{
                                    height: '20px',
                                }}
                            />
                        )
                    }
                </button>
            )}
        </Fragment>
    )
}

export default FileUploadEnvCheck;