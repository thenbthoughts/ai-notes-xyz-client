import { useState, useEffect } from "react";

export const screenList = {
    sm: 'sm',
    lg: 'lg',
};

const useResponsiveScreen = () => {

    const [currentScreen, setCurrentScreen] = useState(screenList.lg);

    const updateDimensions = () => {
        if (window.innerWidth < 992) {
            setCurrentScreen(screenList.sm);
        } else {
            setCurrentScreen(screenList.lg);
        }
    };

    useEffect(() => {
        updateDimensions(); // Set initial screen size
        window.addEventListener("resize", updateDimensions); // Add resize event listener

        return () => window.removeEventListener("resize", updateDimensions); // Cleanup event listener
    }, []);

    return currentScreen;
};

export default useResponsiveScreen;
