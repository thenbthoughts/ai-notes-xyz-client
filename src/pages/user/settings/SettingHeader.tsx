import { Link } from "react-router-dom";

const SettingHeader = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 py-5 text-white">Setting</h1>

            <div className="border-b border-gray-300  mb-5" />

            <p className="text-gray-500 text-sm pb-1 text-white">Customize your profile and preferences.</p>

            <div className="mb-5">
                <Link to="/user/setting/" className="text-white hover:underline mr-2">Profile Settings</Link>{'|'}
                <Link to="/user/setting/model-preference" className="text-white hover:underline mx-2">Model Preferences</Link>{'|'}
                <Link to="/user/setting/login-history" className="text-white hover:underline mx-2">Login History</Link>{'|'}
                <Link to="/user/setting/api-key" className="text-white hover:underline mx-2">API Keys</Link>
            </div>
        </div>
    );
};

export default SettingHeader;