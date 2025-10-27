/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { DebounceInput } from 'react-debounce-input';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './css/map.module.scss';
import indiaGeoJson from './india-land-simplified.json';

// Fix for default markers in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../config/axiosCustom';

// Configure default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface tsInterfaceMapsData {
    _id: string;
    fromCollection: 'infoVault',
    lifeEvents: {
        _id: string;
        name: string;
        description: string;
        infoVaultAddress: {
            latitude: number;
            longitude: number;
        }[]
    }
}

// ===============================
// MAIN MAP COMPONENT
// ===============================
const MapSearchProduct = () => {
    // States
    const [currentScreen, setCurrentScreen] = useState('sm');
    const [displayWidth, setDisplayWidth] = useState({ list: '35%', map: '65%' });
    const [toggleListMap, setToggleListMap] = useState(true);
    const [currentCoords, setCurrentCoords] = useState({ latitude: 28.6139, longitude: 77.2090 });
    const [query, setQuery] = useState('');

    const [mapsData, setMapsData] = useState<tsInterfaceMapsData[]>([]);
    const [totalCount, setTotalCount] = useState(0 as number);

    // Refs
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const indiaLayerRef = useRef<L.GeoJSON | null>(null);

    // Initialize map
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            // Create map
            mapInstanceRef.current = L.map(mapRef.current, {
                center: [currentCoords.latitude, currentCoords.longitude],
                zoom: 6,
                scrollWheelZoom: true,
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapInstanceRef.current);

            // Add India boundaries GeoJSON layer
            indiaLayerRef.current = L.geoJSON(indiaGeoJson as any, {
                style: {
                    color: '#ff4444',
                    weight: 2,
                    opacity: 0.8,
                    fillColor: '#ff4444',
                    fillOpacity: 0.1
                }
            }).addTo(mapInstanceRef.current);

            // Handle map events
            // mapInstanceRef.current.on('moveend', handleMapMove);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Screen size management
    useEffect(() => {
        const updateDimensions = () => {
            setCurrentScreen(window.innerWidth < 992 ? 'sm' : 'lg');
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Display width management
    useEffect(() => {
        let tempDisplayWidth = { list: '35%', map: '65%' };

        if (currentScreen === 'sm') {
            tempDisplayWidth = toggleListMap ? { list: '100%', map: '0%' } : { list: '0%', map: '100%' };
        }

        setDisplayWidth(tempDisplayWidth);

        // Refresh map size
        setTimeout(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        }, 300);
    }, [currentScreen, toggleListMap]);

    useEffect(() => {
        fetchData();
    }, []);

    // Get current location
    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            setCurrentCoords(coords);

            if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([coords.latitude, coords.longitude], 12);

                // Add current location marker
                L.marker([coords.latitude, coords.longitude])
                    .addTo(mapInstanceRef.current)
                    .bindPopup('Your Location')
                    .openPopup();
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to get your location');
        });
    };

    const fetchData = async () => {
        try {
            const config = {
                method: 'post',
                url: `/api/maps/crud/mapsLocationsGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: 1,
                    perPage: 100,
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            // docs
            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }
            setMapsData(tempArr);

            // count
            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') {
                tempTotalCount = response.data.count;
            }
            setTotalCount(tempTotalCount);
        } catch (error) {
            console.error(error);
        }
    };

    const updateMapMarkersLifeEvents = () => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => mapInstanceRef.current?.removeLayer(marker));
        markersRef.current = [];

        // Add new markers
        mapsData.forEach(map => {
            console.log(map);
            const lng = map.lifeEvents.infoVaultAddress[0].longitude;
            const lat = map.lifeEvents.infoVaultAddress[0].latitude;

            const marker = L.marker([lat, lng])
                .bindPopup(`
                    <div>${map.lifeEvents.name}</div>
                `)
                .addTo(mapInstanceRef.current!);

            markersRef.current.push(marker);
        });
    };

    useEffect(() => {
        updateMapMarkersLifeEvents();
    }, [mapsData]);

    // Render functions
    const renderSearchBar = () => (
        <div className="flex">
            <DebounceInput
                minLength={0}
                debounceTimeout={750}
                type='text'
                placeholder='Search products...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-white shadow-sm rounded border border-gray-200 h-10 px-3 mr-2 focus:border-blue-500 focus:outline-none transition-colors"
            />

            <div className="w-10 h-10 bg-white rounded border flex items-center justify-center ml-2 shadow-sm">
                <span className="text-green-500 text-sm">✅</span>1
            </div>

            <button
                className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm ml-2 hover:bg-blue-50 transition-colors"
                onClick={getCurrentLocation}
                title="Get current location"
            >
                📍
            </button>

            {currentScreen === 'sm' && (
                <button
                    className="px-3 py-1 border border-gray-400 text-gray-600 rounded text-sm ml-1 hover:bg-gray-50 transition-colors"
                    onClick={() => setToggleListMap(!toggleListMap)}
                    title="Toggle view"
                >
                    {toggleListMap ? '🗺️' : '📋'}
                </button>
            )}
        </div>
    );

    const renderList = () => (
        <div className={styles.s__sProductList_container} style={{ height: '100%', overflowY: 'auto', padding: '10px' }}>
            {currentScreen === 'lg' && renderSearchBar()}

            <hr />


            <div className='py-5'>
                <h3>Total Count: {totalCount}</h3>
            </div>

            <div className='pb-5'>

            {mapsData.map((map) => (
                <div key={map._id} className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-4 mb-3 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">🗺️</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{map.lifeEvents.name}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Life Event</span>
                                <span className="text-gray-500 text-sm">📍 Location</span>
                            </div>
                        </div>
                        <div className="text-gray-400 hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            ))}

            </div>

            <hr />
        </div>
    );

    return (
        <div className='w-full bg-gray-100 p-0'>

            {currentScreen === 'sm' && (
                <div className="p-2 border-b bg-white">
                    {renderSearchBar()}
                </div>
            )}

            <div className='flex' style={{ height: currentScreen === 'sm' ? 'calc(100vh - 117px)' : 'calc(100vh - 60px)' }}>
                {/* Product List */}
                <div style={{
                    width: displayWidth.list,
                    display: displayWidth.list === '0%' ? 'none' : 'block',
                }}>
                    {renderList()}
                </div>

                {/* Map */}
                <div style={{ width: displayWidth.map }}>
                    <div
                        ref={mapRef}
                        style={{
                            height: currentScreen === 'sm' ? 'calc(100vh - 117px)' : 'calc(100vh - 60px)',
                            width: '100%',
                            minHeight: '400px'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MapSearchProduct;