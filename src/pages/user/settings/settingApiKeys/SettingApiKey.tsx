import SettingHeader from "../SettingHeader";

import ComponentApiKeySet from "../../userhomepage/ComponentApiKeySet";

// API Key Components
import GroqApiKey from "./GroqApiKey";
import OpenrouterApiKey from "./OpenrouterApiKey";
import S3ApiKey from "./S3ApiKey";
import OllamaApiKey from "./OllamaApiKey";
import QdrantApiKey from "./QdrantApiKey";
import ReplicateApiKey from "./ReplicateApiKey";
import RunpodApiKey from "./RunpodApiKey";
import OpenaiApiKey from "./OpenaiApiKey";
import LocalaiApiKey from "./LocalaiApiKey";
import SmtpSettings from "./SmtpSettings";
import FileStorageType from "./FileStorageType";
import ClientFrontendUrl from "./ClientFrontendUrl";

const SettingApiKey = () => {

    const renderApiKeys = () => {
        return (
            <div
                id="api-keys"
            >
                <h2 className="text-xl font-bold text-gray-900 py-2">Api Keys</h2>

                <div className="my-4">
                    <ComponentApiKeySet />
                </div>

                {/* File Storage Type */}
                <FileStorageType />

                {/* API Key Components */}
                <GroqApiKey />
                <OpenrouterApiKey />
                <S3ApiKey />
                <OllamaApiKey />
                <QdrantApiKey />
                <ReplicateApiKey />
                <RunpodApiKey />
                <OpenaiApiKey />
                <LocalaiApiKey />
                <SmtpSettings />

                {/* Client Frontend Url */}
                <ClientFrontendUrl />
            </div>
        )
    }

    return (
        <div
            className="p-4"
            style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}
        >
            <SettingHeader />

            {renderApiKeys()}
        </div>
    );
};

export default SettingApiKey;