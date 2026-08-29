/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import { DebounceInput } from 'react-debounce-input';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './css/map.module.scss';
import indiaGeoJson from '../india-land-simplified.json';

// Fix for default markers in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';

// Configure default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// ===============================
// TYPE DEFINITIONS
// ===============================
interface tsInterfaceProductItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    inStock: boolean;
    images: string[];
    shopInfo: {
        _id: string;
        name: string;
        address: string;
        phone: string;
        email: string;
        website?: string;
        rating: number;
        reviewCount: number;
        geolocation: {
            type: string;
            coordinates: [number, number]; // [longitude, latitude]
        };
    };
    createdAt: string;
    updatedAt: string;
}

// ===============================
// MOCK PRODUCT DATA
// ===============================
const mockProductData: tsInterfaceProductItem[] = [
    {
        _id: "prod_001",
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation.",
        price: 8999,
        currency: "INR",
        category: "Electronics",
        inStock: true,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop"],
        shopInfo: {
            _id: "shop_001",
            name: "TechHub Electronics",
            address: "Connaught Place, New Delhi",
            phone: "+91-98765-43210",
            email: "contact@techhub.com",
            website: "https://techhub.com",
            rating: 4.5,
            reviewCount: 324,
            geolocation: {
                type: "Point",
                coordinates: [77.2090, 28.6139] // Delhi
            }
        },
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-20T14:45:00Z"
    },
    {
        _id: "prod_002",
        name: "Organic Cotton T-Shirt",
        description: "Comfortable organic cotton t-shirt in multiple colors.",
        price: 1299,
        currency: "INR",
        category: "Clothing",
        inStock: true,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop"],
        shopInfo: {
            _id: "shop_002",
            name: "EcoWear Fashion",
            address: "Khan Market, New Delhi",
            phone: "+91-98765-43211",
            email: "info@ecowear.com",
            website: "https://ecowear.com",
            rating: 4.3,
            reviewCount: 156,
            geolocation: {
                type: "Point",
                coordinates: [77.2319, 28.6127] // Delhi - Khan Market
            }
        },
        createdAt: "2024-01-16T09:15:00Z",
        updatedAt: "2024-01-21T11:30:00Z"
    },
    {
        _id: "prod_003",
        name: "Artisan Coffee Beans",
        description: "Premium single-origin coffee beans roasted to perfection.",
        price: 899,
        currency: "INR",
        category: "Food & Beverage",
        inStock: true,
        images: ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=200&fit=crop"],
        shopInfo: {
            _id: "shop_003",
            name: "Mumbai Coffee Roasters",
            address: "Bandra West, Mumbai",
            phone: "+91-98765-43212",
            email: "hello@mumbaicoffe.com",
            rating: 4.7,
            reviewCount: 289,
            geolocation: {
                type: "Point",
                coordinates: [72.8261, 19.0596] // Mumbai - Bandra
            }
        },
        createdAt: "2024-01-17T08:20:00Z",
        updatedAt: "2024-01-22T16:10:00Z"
    },
    {
        _id: "prod_004",
        name: "Handcrafted Leather Wallet",
        description: "Genuine leather wallet with multiple card slots.",
        price: 2499,
        currency: "INR",
        category: "Accessories",
        inStock: false,
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=200&fit=crop"],
        shopInfo: {
            _id: "shop_004",
            name: "Mumbai Leather Works",
            address: "Colaba, Mumbai",
            phone: "+91-98765-43213",
            email: "orders@mumbaileather.com",
            website: "https://mumbaileather.com",
            rating: 4.4,
            reviewCount: 412,
            geolocation: {
                type: "Point",
                coordinates: [72.8310, 18.9067] // Mumbai - Colaba
            }
        },
        createdAt: "2024-01-18T12:45:00Z",
        updatedAt: "2024-01-23T09:30:00Z"
    },
    {
        _id: "prod_005",
        name: "Smart Fitness Watch",
        description: "Advanced fitness tracker with heart rate monitoring.",
        price: 12999,
        currency: "INR",
        category: "Electronics",
        inStock: true,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop"],
        shopInfo: {
            _id: "shop_005",
            name: "Bangalore Gadgets",
            address: "Koramangala, Bangalore",
            phone: "+91-98765-43214",
            email: "support@bangaloregadgets.com",
            website: "https://bangaloregadgets.com",
            rating: 4.6,
            reviewCount: 578,
            geolocation: {
                type: "Point",
                coordinates: [77.6117, 12.9352] // Bangalore
            }
        },
        createdAt: "2024-01-19T15:30:00Z",
        updatedAt: "2024-01-24T13:20:00Z"
    },
    {
        _id: "prod_006",
        name: "Traditional Silk Saree",
        description: "Beautiful handwoven silk saree with traditional patterns.",
        price: 15999,
        currency: "INR",
        category: "Clothing",
        inStock: true,
        images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=200&fit=crop"],
        shopInfo: {
            _id: "shop_006",
            name: "Chennai Silk House",
            address: "T. Nagar, Chennai",
            phone: "+91-98765-43215",
            email: "info@chennaisilk.com",
            rating: 4.8,
            reviewCount: 245,
            geolocation: {
                type: "Point",
                coordinates: [80.2342, 13.0417] // Chennai
            }
        },
        createdAt: "2024-01-20T11:15:00Z",
        updatedAt: "2024-01-25T10:45:00Z"
    }
];

// ===============================
// PRODUCT ITEM COMPONENT
// ===============================
const ProductItem: React.FC<{ itemProduct: tsInterfaceProductItem }> = ({ itemProduct }) => {
    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const renderStars = (rating: number) => {
        return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    };

    return (
        <div className="bg-white rounded-sm shadow-sm mb-2 max-w-sm">
            <div className="p-3">
                {/* Product Image */}
                {itemProduct.images && itemProduct.images.length > 0 && (
                    <div className="mb-2">
                        <img
                            src={itemProduct.images[0]}
                            alt={itemProduct.name}
                            className="w-full h-30 object-cover rounded"
                            style={{ height: '120px' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
                            }}
                        />
                    </div>
                )}

                {/* Product Name */}
                <h6 className="text-lg font-bold mb-2 truncate" title={itemProduct.name}>
                    {itemProduct.name}
                </h6>

                {/* Price and Stock */}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-green-600">
                        {formatPrice(itemProduct.price, itemProduct.currency)}
                    </span>
                    <span className={`px-2 py-1 rounded-sm text-xs font-medium ${itemProduct.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {itemProduct.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {itemProduct.description}
                </p>

                {/* Category */}
                <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-sm text-xs mb-2">{itemProduct.category}</span>

                {/* Shop Info */}
                <div className="border-t pt-2 mt-2">
                    <div className="flex items-center mb-1">
                        <strong className="text-blue-600 text-sm mr-2">{itemProduct.shopInfo.name}</strong>
                        <span className="text-yellow-500 text-sm">{renderStars(itemProduct.shopInfo.rating)}</span>
                        <span className="text-gray-500 text-sm ml-1">({itemProduct.shopInfo.reviewCount})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        <div>📍 {itemProduct.shopInfo.address}</div>
                        {itemProduct.shopInfo.phone && <div>📞 {itemProduct.shopInfo.phone}</div>}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-2 md:flex md:justify-end">
                    <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded-sm text-sm hover:bg-blue-50 transition-colors">
                        View Details
                    </button>
                    {itemProduct.inStock && (
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 transition-colors">
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

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
    const [listLoading, setListLoading] = useState(false);
    const [listLoadingError, setListLoadingError] = useState('');
    const [currentCoords, setCurrentCoords] = useState({ latitude: 28.6139, longitude: 77.2090 });
    const [productList, setProductList] = useState<tsInterfaceProductItem[]>([]);
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
            mapInstanceRef.current.on('moveend', handleMapMove);
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

    // Initial search
    useEffect(() => {
        searchProducts();
    }, [query]);

    useEffect(() => {
        fetchData();
    }, []);

    // Filter products based on map bounds and query
    const filterProducts = (bounds?: L.LatLngBounds) => {
        let filtered = mockProductData;

        // Filter by search query
        if (query) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase()) ||
                product.shopInfo.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Filter by map bounds
        if (bounds && mapInstanceRef.current) {
            filtered = filtered.filter(product => {
                const [lng, lat] = product.shopInfo.geolocation.coordinates;
                return bounds.contains([lat, lng]);
            });
        }

        return filtered;
    };

    // Search products
    const searchProducts = async () => {
        try {
            setListLoading(true);
            setListLoadingError('');

            await new Promise(resolve => setTimeout(resolve, 300));

            const bounds = mapInstanceRef.current?.getBounds();
            const filtered = filterProducts(bounds);
            setProductList(filtered);

            setListLoading(false);
        } catch (error) {
            console.error(error);
            setProductList([]);
            setListLoading(false);
            setListLoadingError('Error loading products');
        }
    };

    // Handle map movement
    const handleMapMove = () => {
        if (currentScreen === 'sm' && toggleListMap) return;
        setTimeout(searchProducts, 500);
    };

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
                className="flex-1 bg-white shadow-sm rounded-sm border border-gray-200 h-10 px-3 mr-2 focus:border-blue-500 focus:outline-none transition-colors"
            />

            <div className="w-10 h-10 bg-white rounded-sm border flex items-center justify-center ml-2 shadow-sm">
                {listLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : listLoadingError ? (
                    <span className="text-red-500 text-sm">❌</span>
                ) : (
                    <span className="text-green-500 text-sm">✅</span>
                )}
            </div>

            <button
                className="px-3 py-1 border border-blue-600 text-blue-600 rounded-sm text-sm ml-2 hover:bg-blue-50 transition-colors"
                onClick={getCurrentLocation}
                title="Get current location"
            >
                📍
            </button>

            {currentScreen === 'sm' && (
                <button
                    className="px-3 py-1 border border-gray-400 text-gray-600 rounded-sm text-sm ml-1 hover:bg-gray-50 transition-colors"
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
                <div key={map._id} className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-sm p-4 mb-3 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">🗺️</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{map.lifeEvents.name}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-sm font-medium">Life Event</span>
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

            <div>
                {productList.map((product) => (
                    <div key={product._id} className="mb-2">
                        <ProductItem itemProduct={product} />
                    </div>
                ))}
            </div>
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