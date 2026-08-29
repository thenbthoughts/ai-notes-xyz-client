import { useAtomValue } from "jotai";

import stateJotaiAuthAtom from '../../../../jotai/stateJotaiAuth';

const ClientFrontendUrl = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);

    return (
        <div className="mb-4">
            <label htmlFor="clientFrontendUrl" className="block text-zinc-300 font-bold mb-2">
                Client Frontend Url
            </label>
            <input
                type="text"
                id="clientFrontendUrl"
                className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                value={authState.clientFrontendUrl}
                disabled
            />
        </div>
    );
};

export default ClientFrontendUrl;