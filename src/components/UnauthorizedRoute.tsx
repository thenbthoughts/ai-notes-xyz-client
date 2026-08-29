import { Navigate, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import stateJotaiAuthAtom from '../jotai/stateJotaiAuth';

interface UnauthorizedRouteProps {
    children: React.ReactNode;
}

const UnauthorizedRoute: React.FC<UnauthorizedRouteProps> = ({ children }) => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const location = useLocation();

    if (authState.isLoggedIn === 'pending') {
        return <div className='text-center bg-gray-400 py-5 text-lg'>Loading...</div>;
    } else if (authState.isLoggedIn === 'false') {
        return <Navigate to="/login" state={{ from: location }} replace />;
    } else {
        return <>{children}</>; // Show children if logged in
    }
};

export default UnauthorizedRoute;
