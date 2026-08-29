import { Navigate, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import stateJotaiAuthAtom from '../jotai/stateJotaiAuth';

interface AuthorizedRouteProps {
    children: React.ReactNode;
}

const AuthorizedRoute: React.FC<AuthorizedRouteProps> = ({ children }) => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const location = useLocation();

    if (authState.isLoggedIn === 'pending') {
        return <div className='text-center bg-gray-400 py-5 text-lg'>Loading...</div>;
    } else if (authState.isLoggedIn === 'false') {
        return <>{children}</>; // Show children if logged in
    } else {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
};

export default AuthorizedRoute;
