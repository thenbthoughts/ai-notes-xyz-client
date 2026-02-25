import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import stateJotaiAuthAtom from '../../../jotai/stateJotaiAuth';
import { useSetAtom } from 'jotai';
import axiosCustom from "../../../config/axiosCustom";

export default function Component() {

    const navigate = useNavigate()
    const setAuthState = useSetAtom(stateJotaiAuthAtom);

    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        handleSubmit();
    }, []);

    const handleSubmit = async () => {
        setError("")
        setSuccessMessage("")

        try {
            const response = await axiosCustom.post(
                `/api/user/auth/logout`,
                {}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            }
            )

            // Set isLoggedIn in the atom after successful logout
            setAuthState({
                isLoggedIn: 'false',
                fileStorageType: 'gridfs',
                apiKeyGroqValid: false,
                apiKeyOpenrouterValid: false,
                apiKeyS3Valid: false,
                apiKeyOllamaValid: false,
                apiKeyQdrantValid: false,
                apiKeyReplicateValid: false,
                apiKeyRunpodValid: false,
                apiKeyOpenaiValid: false,
                apiKeyLocalaiValid: false,
                smtpValid: false,
                clientFrontendUrl: '',
            });

            // delete all local storage
            localStorage.clear();

            // redirect to /login using react router dom
            navigate('/login', { replace: true });

            console.log("Logout successful:", response.data)
            setSuccessMessage("Logout successful!")
            // Here you can handle successful logout, e.g., redirect or set user state
        } catch (error) {
            console.error("Logout failed:", error)
            setError("Logout failed. Please try again.");
            setAuthState({
                isLoggedIn: 'false',
                fileStorageType: 'gridfs',
                apiKeyGroqValid: false,
                apiKeyOpenrouterValid: false,
                apiKeyS3Valid: false,
                apiKeyOllamaValid: false,
                apiKeyQdrantValid: false,
                apiKeyReplicateValid: false,
                apiKeyRunpodValid: false,
                apiKeyOpenaiValid: false,
                apiKeyLocalaiValid: false,
                smtpValid: false,
                clientFrontendUrl: '',
            });
        } finally {
            // delete all local storage
            localStorage.clear();
        }
    }

    return (
        <div>
            <div>
                <h1>Logout</h1>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
            </div>
        </div>
    )
}