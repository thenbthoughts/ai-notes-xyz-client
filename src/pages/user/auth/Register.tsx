import { useEffect, useState } from "react"
import { Link, useNavigate } from 'react-router-dom'
import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../jotai/stateJotaiAuth';
import { useAtom, useSetAtom } from 'jotai';
import axiosCustom from "../../../config/axiosCustom";

export default function Component() {

    const navigate = useNavigate()
    const [authState] = useAtom(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (authState.isLoggedIn === 'true') {
            // redirect to /home
            navigate('/user/chat')
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccessMessage("")

        try {
            setIsLoading(true)
            const response = await axiosCustom.post(
                `/api/user/auth/register`,
                {
                    username,
                    password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            console.log("Register successful:", response.data)
            setSuccessMessage("Register successful! Welcome.")

            // wait for 250ms
            await new Promise(resolve => setTimeout(resolve, 250));

            await axiosCustom.post(
                `/api/user/auth/login`,
                {
                    username,
                    password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            // wait for 250ms
            await new Promise(resolve => setTimeout(resolve, 250));

            // Set isLoggedIn in the atom after successful login
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum);

            // wait for 500ms
            await new Promise(resolve => setTimeout(resolve, 500));

            // set default env key
            try {
                const response = await axiosCustom.post(
                    `/api/apiKeyDefault/crud/updateApiKeyDefault`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true,
                    }
                );
                console.log("User updated:", response.data);
            } catch (error) {
                console.error("Error updating user:", error);
            }

            // wait for 750ms
            await new Promise(resolve => setTimeout(resolve, 750));

            // redirect to /home
            navigate('/user/chat');
        } catch (error) {
            console.error("Register failed:", error)
            setError("Register failed. Please check your credentials and try again.");

            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
            <div className="container p-2 m-auto">
                <div className="py-3 sm:max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto">
                    <div className="px-4 py-10 bg-white shadow-sm rounded sm:p-20">
                        <div className="max-w-md mx-auto md:max-w-full grid md:grid-cols-2 gap-8">
                            <div>
                                <div className="bg-white shadow-lg rounded-2xl">
                                    <div className="p-6">
                                        <h2 className="text-3xl font-extrabold text-center text-gray-800">Register to AI Notes</h2>
                                        <p className="text-gray-600 text-center">Enter your credentials to access your AI-powered notes</p>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="p-6 space-y-6">
                                            <div className="space-y-2">
                                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                                <input
                                                    id="username"
                                                    type="text"
                                                    placeholder="Enter your username"
                                                    required
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                                <input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"} // Toggle password visibility
                                                    placeholder="Enter your password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                                <div className="flex items-center mt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="showPassword"
                                                        checked={showPassword}
                                                        onChange={() => setShowPassword(!showPassword)}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor="showPassword" className="text-sm text-gray-600 select-none">Show Password</label>
                                                </div>
                                            </div>
                                            {error && <p className="text-red-500 text-sm">{error}</p>}
                                            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                                        </div>
                                        <div className="p-6 flex flex-col space-y-4">
                                            <button
                                                type="submit"
                                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                                                disabled={isLoading}
                                                onClick={handleSubmit}
                                            >
                                                {isLoading ? "Loading..." : "Register"}
                                            </button>
                                            <div className="text-center">
                                                <Link
                                                    to="/login"
                                                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 block"
                                                >Login</Link>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="md:flex md:items-center md:justify-center hidden">
                                <div className="max-w-md">
                                    <h2 className="text-3xl font-extrabold mb-4 text-gray-800">Welcome to AI Notes</h2>
                                    <p className="text-gray-600 mb-4">
                                        AI Notes is your intelligent note-taking companion. Powered by advanced AI, it helps you organize,
                                        summarize, and enhance your notes effortlessly.
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600">
                                        <li>Smart organization of your notes</li>
                                        <li>AI-powered summaries and insights</li>
                                        <li>Seamless integration with your workflow</li>
                                        <li>Secure and private note storage</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 md:hidden">
                            <h2 className="text-3xl font-extrabold mb-4 text-gray-800">Welcome to AI Notes</h2>
                            <p className="text-gray-600 mb-4">
                                AI Notes is your intelligent note-taking companion. Powered by advanced AI, it helps you organize,
                                summarize, and enhance your notes effortlessly.
                            </p>
                            <ul className="list-disc list-inside text-gray-600">
                                <li>Smart organization of your notes</li>
                                <li>AI-powered summaries and insights</li>
                                <li>Seamless integration with your workflow</li>
                                <li>Secure and private note storage</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}