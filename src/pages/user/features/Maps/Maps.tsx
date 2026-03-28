import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './css/map.module.scss';
import indiaGeoJson from './india-land-simplified.json';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../config/axiosCustom';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface InfoVaultAddressRow {
    _id?: string;
    latitude: number;
    longitude: number;
    label?: string;
    address?: string;
    city?: string;
    state?: string;
    countryRegion?: string;
}

interface TsInterfaceMapsData {
    _id: string;
    fromCollection: 'infoVault';
    lifeEvents: {
        _id: string;
        name: string;
        notes?: string;
        infoVaultType?: string;
        infoVaultAddress: InfoVaultAddressRow[];
    };
}

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const getRowKey = (doc: TsInterfaceMapsData) => {
    const addrId = doc.lifeEvents.infoVaultAddress?.[0]?._id;
    return addrId ? `${doc._id}-${String(addrId)}` : `${doc._id}-0`;
};

const formatAddressLine = (addr: InfoVaultAddressRow) => {
    const parts = [addr.label, addr.address, addr.city, addr.state, addr.countryRegion].filter(
        Boolean,
    ) as string[];
    return parts.join(' · ');
};

const MapSearchProduct = () => {
    const [currentScreen, setCurrentScreen] = useState('sm');
    const [displayWidth, setDisplayWidth] = useState({ list: '35%', map: '65%' });
    const [toggleListMap, setToggleListMap] = useState(true);
    const [currentCoords, setCurrentCoords] = useState({ latitude: 28.6139, longitude: 77.209 });
    const [query, setQuery] = useState('');

    const [mapsData, setMapsData] = useState<TsInterfaceMapsData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showIndiaOutline, setShowIndiaOutline] = useState(true);
    const [highlightKey, setHighlightKey] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const markerByKeyRef = useRef<Map<string, L.Marker>>(new Map());
    const indiaLayerRef = useRef<L.GeoJSON | null>(null);
    const userLocationMarkerRef = useRef<L.Marker | null>(null);
    const hasFittedBoundsRef = useRef(false);

    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current, {
                center: [currentCoords.latitude, currentCoords.longitude],
                zoom: 6,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapInstanceRef.current);

            L.control.scale({ imperial: false, metric: true }).addTo(mapInstanceRef.current);

            indiaLayerRef.current = L.geoJSON(indiaGeoJson as GeoJSON.GeoJsonObject, {
                style: {
                    color: '#ff4444',
                    weight: 2,
                    opacity: 0.8,
                    fillColor: '#ff4444',
                    fillOpacity: 0.1,
                },
            }).addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            userLocationMarkerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !indiaLayerRef.current) return;
        if (showIndiaOutline) {
            if (!mapInstanceRef.current.hasLayer(indiaLayerRef.current)) {
                indiaLayerRef.current.addTo(mapInstanceRef.current);
            }
        } else {
            mapInstanceRef.current.removeLayer(indiaLayerRef.current);
        }
    }, [showIndiaOutline]);

    useEffect(() => {
        const updateDimensions = () => {
            setCurrentScreen(window.innerWidth < 992 ? 'sm' : 'lg');
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        let tempDisplayWidth = { list: '35%', map: '65%' };

        if (currentScreen === 'sm') {
            tempDisplayWidth = toggleListMap ? { list: '100%', map: '0%' } : { list: '0%', map: '100%' };
        }

        setDisplayWidth(tempDisplayWidth);

        const t = window.setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
        }, 300);
        return () => window.clearTimeout(t);
    }, [currentScreen, toggleListMap]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                method: 'post',
                url: `/api/maps/crud/mapsLocationsGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: 1,
                    perPage: 200,
                    search: query.trim(),
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            const rawDocs = Array.isArray(response.data.docs) ? response.data.docs : [];
            setMapsData(rawDocs as TsInterfaceMapsData[]);

            const cnt = response.data.count;
            setTotalCount(typeof cnt === 'number' ? cnt : rawDocs.length);
            hasFittedBoundsRef.current = false;
        } catch (e) {
            console.error(e);
            setError('Could not load locations. Try again.');
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getCurrentLocation = () => {
        if (!mapInstanceRef.current) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setCurrentCoords(coords);

                if (userLocationMarkerRef.current) {
                    mapInstanceRef.current?.removeLayer(userLocationMarkerRef.current);
                }
                userLocationMarkerRef.current = L.marker([coords.latitude, coords.longitude])
                    .addTo(mapInstanceRef.current!)
                    .bindPopup('Your location')
                    .openPopup();

                mapInstanceRef.current?.flyTo([coords.latitude, coords.longitude], 12);
            },
            (err) => {
                console.error('Geolocation error:', err);
                alert('Unable to get your location');
            },
        );
    };

    const focusOnRow = useCallback((doc: TsInterfaceMapsData) => {
        const key = getRowKey(doc);
        setHighlightKey(key);
        const marker = markerByKeyRef.current.get(key);
        const addr = doc.lifeEvents.infoVaultAddress?.[0];
        if (!mapInstanceRef.current || !addr) return;

        const lat = addr.latitude;
        const lng = addr.longitude;
        if (marker) {
            marker.openPopup();
            mapInstanceRef.current.flyTo([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 12));
        } else {
            mapInstanceRef.current.flyTo([lat, lng], 12);
        }
    }, []);

    const updateMapMarkers = useCallback(() => {
        if (!mapInstanceRef.current) return;

        markersRef.current.forEach((m) => mapInstanceRef.current?.removeLayer(m));
        markersRef.current = [];
        markerByKeyRef.current = new Map();

        const latLngs: L.LatLng[] = [];

        mapsData.forEach((mapDoc) => {
            const key = getRowKey(mapDoc);
            const addr = mapDoc.lifeEvents.infoVaultAddress?.[0];
            if (!addr) return;

            const lat = addr.latitude;
            const lng = addr.longitude;
            if (lat === 0 && lng === 0) return;

            const title = mapDoc.lifeEvents.name || 'Untitled';
            const notes = mapDoc.lifeEvents.notes?.trim();
            const typeLabel = mapDoc.lifeEvents.infoVaultType?.trim();
            const addressLine = formatAddressLine(addr);

            const popupHtml = `
                <div class="${styles.mapPopup}">
                    <div class="${styles.mapPopup__title}">${escapeHtml(title)}</div>
                    ${typeLabel ? `<div class="${styles.mapPopup__meta}">${escapeHtml(typeLabel)}</div>` : ''}
                    ${addressLine ? `<div class="${styles.mapPopup__addr}">${escapeHtml(addressLine)}</div>` : ''}
                    ${notes ? `<div class="${styles.mapPopup__notes}">${escapeHtml(notes)}</div>` : ''}
                </div>
            `;

            const marker = L.marker([lat, lng]).bindPopup(popupHtml);
            marker.addTo(mapInstanceRef.current!);
            markersRef.current.push(marker);
            markerByKeyRef.current.set(key, marker);
            latLngs.push(L.latLng(lat, lng));
        });

        if (latLngs.length > 0 && mapInstanceRef.current && !hasFittedBoundsRef.current) {
            const bounds = L.latLngBounds(latLngs);
            mapInstanceRef.current.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
            hasFittedBoundsRef.current = true;
        }
    }, [mapsData]);

    useEffect(() => {
        updateMapMarkers();
    }, [updateMapMarkers]);

    const resultLabel = useMemo(() => {
        if (loading) return 'Loading…';
        if (!query.trim()) return `${totalCount} on map`;
        return `${mapsData.length} shown · ${totalCount} matching`;
    }, [loading, query, totalCount, mapsData.length]);

    const renderSearchBar = () => (
        <div className="flex flex-wrap gap-2 items-center">
            <DebounceInput
                minLength={0}
                debounceTimeout={500}
                type="text"
                placeholder="Search by name, notes, city, address…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 min-w-[160px] bg-white shadow-sm rounded-sm border border-gray-200 h-10 px-3 focus:border-blue-500 focus:outline-none transition-colors"
            />

            <span
                className="inline-flex items-center px-2 h-10 bg-white rounded-sm border border-gray-200 text-xs text-gray-600 tabular-nums"
                title="Result count"
            >
                {resultLabel}
            </span>

            <label className="inline-flex items-center gap-1 text-xs text-gray-600 cursor-pointer whitespace-nowrap">
                <input
                    type="checkbox"
                    checked={showIndiaOutline}
                    onChange={(e) => setShowIndiaOutline(e.target.checked)}
                />
                India outline
            </label>

            <button
                type="button"
                className="px-3 py-1 border border-blue-600 text-blue-600 rounded-sm text-sm hover:bg-blue-50 transition-colors"
                onClick={getCurrentLocation}
                title="Center on your location"
            >
                My location
            </button>

            <button
                type="button"
                className="px-3 py-1 border border-gray-400 text-gray-600 rounded-sm text-sm hover:bg-gray-50 transition-colors"
                onClick={() => {
                    hasFittedBoundsRef.current = false;
                    updateMapMarkers();
                }}
                title="Zoom to fit all pins"
            >
                Fit all
            </button>

            {currentScreen === 'sm' && (
                <button
                    type="button"
                    className="px-3 py-1 border border-gray-400 text-gray-600 rounded-sm text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => setToggleListMap(!toggleListMap)}
                    title="Toggle list / map"
                >
                    {toggleListMap ? 'Map' : 'List'}
                </button>
            )}
        </div>
    );

    const renderList = () => (
        <div
            className={styles.s__sProductList_container}
            style={{ height: '100%', overflowY: 'auto', padding: '10px' }}
        >
            {currentScreen === 'lg' && renderSearchBar()}

            <hr className="my-3 border-gray-200" />

            {error && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-sm px-3 py-2">
                    {error}
                </div>
            )}

            <div className="py-2">
                <h3 className="text-sm font-semibold text-gray-700">{resultLabel}</h3>
            </div>

            <div className="pb-5">
                {!loading && mapsData.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-10 px-2">
                        No saved locations yet. Add addresses with coordinates in Info Vault to see them
                        here.
                    </div>
                )}

                {mapsData.map((mapDoc) => {
                    const rowKey = getRowKey(mapDoc);
                    const addr = mapDoc.lifeEvents.infoVaultAddress?.[0];
                    const addressLine = addr ? formatAddressLine(addr) : '';
                    const active = highlightKey === rowKey;
                    return (
                        <button
                            type="button"
                            key={rowKey}
                            onClick={() => focusOnRow(mapDoc)}
                            className={`w-full text-left bg-gradient-to-r rounded-sm p-4 mb-3 border shadow-sm transition-all duration-200 cursor-pointer ${
                                active
                                    ? 'from-amber-50 to-orange-50 border-amber-300 ring-1 ring-amber-200'
                                    : 'from-blue-50 to-indigo-100 border-blue-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm flex items-center justify-center shadow-lg shrink-0">
                                    <span className="text-white text-lg" aria-hidden>
                                        📍
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                                        {mapDoc.lifeEvents.name || 'Untitled'}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {mapDoc.lifeEvents.infoVaultType && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-sm font-medium">
                                                {mapDoc.lifeEvents.infoVaultType}
                                            </span>
                                        )}
                                        {addressLine && (
                                            <span className="text-gray-600 text-sm truncate">{addressLine}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <hr className="border-gray-200" />
        </div>
    );

    return (
        <div className="w-full bg-gray-100 p-0">
            {currentScreen === 'sm' && <div className="p-2 border-b bg-white">{renderSearchBar()}</div>}

            <div
                className="flex relative"
                style={{
                    height: currentScreen === 'sm' ? 'calc(100vh - 117px)' : 'calc(100vh - 60px)',
                }}
            >
                {loading && (
                    <div className="absolute inset-0 z-[500] bg-white/50 flex items-center justify-center pointer-events-none">
                        <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-sm shadow border border-gray-200">
                            Loading map…
                        </span>
                    </div>
                )}

                <div
                    style={{
                        width: displayWidth.list,
                        display: displayWidth.list === '0%' ? 'none' : 'block',
                    }}
                >
                    {renderList()}
                </div>

                <div style={{ width: displayWidth.map }}>
                    <div
                        ref={mapRef}
                        style={{
                            height:
                                currentScreen === 'sm' ? 'calc(100vh - 117px)' : 'calc(100vh - 60px)',
                            width: '100%',
                            minHeight: '400px',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MapSearchProduct;
