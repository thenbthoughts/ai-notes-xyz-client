import { useEffect, useState } from 'react';

const useScreenWidth = () => {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('2xl');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);

            if (width >= 1536) {
                setScreenSize('2xl');
            } else if (width >= 1280) {
                setScreenSize('xl');
            } else if (width >= 1024) {
                setScreenSize('lg');
            } else if (width >= 768) {
                setScreenSize('md');
            } else if (width >= 640) {
                setScreenSize('sm');
            } else {
                setScreenSize('2xl');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call it initially to set the state
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return { screenWidth, screenSize };
};

export default useScreenWidth;
