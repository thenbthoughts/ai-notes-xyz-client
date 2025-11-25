import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LucidePlus, LucideTrash2, LucideEdit, LucideX, LucideCheck } from 'lucide-react';
import SettingHeader from '../SettingHeader';
import { DriveBucket } from '../../../../types/pages/Drive.types';
import { driveGetBuckets, driveAddBucket, driveUpdateBucket, driveDeleteBucket } from '../../features/Drive/utils/driveAxios';

const SettingS3Buckets = () => {
    const [buckets, setBuckets] = useState<DriveBucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        bucketName: '',
        endpoint: '',
        region: '',
        accessKeyId: '',
        secretAccessKey: '',
        prefix: '',
        isActive: true,
    });

    useEffect(() => {
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        try {
            setLoading(true);
            const response = await driveGetBuckets();
            setBuckets(response.buckets);
        } catch (error) {
            toast.error('Failed to load buckets');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!formData.bucketName || !formData.endpoint || !formData.region || !formData.accessKeyId || !formData.secretAccessKey) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await driveAddBucket({
                bucketName: formData.bucketName,
                endpoint: formData.endpoint,
                region: formData.region,
                accessKeyId: formData.accessKeyId,
                secretAccessKey: formData.secretAccessKey,
                prefix: formData.prefix || undefined,
            });
            toast.success('Bucket added successfully');
            setShowAddForm(false);
            resetForm();
            fetchBuckets();
        } catch (error) {
            toast.error('Failed to add bucket');
            console.error(error);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const updateData: any = {
                bucketName: formData.bucketName,
                endpoint: formData.endpoint,
                region: formData.region,
                prefix: formData.prefix || undefined,
                isActive: formData.isActive,
            };
            
            // Only include credentials if they were provided
            if (formData.accessKeyId) {
                updateData.accessKeyId = formData.accessKeyId;
            }
            if (formData.secretAccessKey) {
                updateData.secretAccessKey = formData.secretAccessKey;
            }
            
            await driveUpdateBucket(id, updateData);
            toast.success('Bucket updated successfully');
            setEditingId(null);
            resetForm();
            fetchBuckets();
        } catch (error) {
            toast.error('Failed to update bucket');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bucket? This will also delete all indexed files for this bucket.')) {
            return;
        }

        try {
            await driveDeleteBucket(id);
            toast.success('Bucket deleted successfully');
            fetchBuckets();
        } catch (error) {
            toast.error('Failed to delete bucket');
            console.error(error);
        }
    };

    const startEdit = (bucket: DriveBucket) => {
        setEditingId(bucket._id);
        setFormData({
            bucketName: bucket.bucketName,
            endpoint: bucket.endpoint,
            region: bucket.region,
            accessKeyId: '', // Don't show existing secret
            secretAccessKey: '', // Don't show existing secret
            prefix: bucket.prefix || '',
            isActive: bucket.isActive,
        });
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            bucketName: '',
            endpoint: '',
            region: '',
            accessKeyId: '',
            secretAccessKey: '',
            prefix: '',
            isActive: true,
        });
    };

    const startAdd = () => {
        setShowAddForm(true);
        setEditingId(null);
        resetForm();
    };

    const cancelAdd = () => {
        setShowAddForm(false);
        resetForm();
    };

    if (loading) {
        return (
            <div className="p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <SettingHeader />
                <p>Loading buckets...</p>
            </div>
        );
    }

    return (
        <div className="p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <SettingHeader />

            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">S3 Buckets</h2>
                    <button
                        onClick={startAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"
                    >
                        <LucidePlus size={18} />
                        <span>Add Bucket</span>
                    </button>
                </div>

                {showAddForm && (
                    <div className="bg-gray-800 border border-gray-700 rounded-sm p-4 mb-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Add New Bucket</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Bucket Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.bucketName}
                                    onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="my-bucket"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Endpoint *
                                </label>
                                <input
                                    type="text"
                                    value={formData.endpoint}
                                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://s3.amazonaws.com or https://r2.cloudflarestorage.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Region *
                                </label>
                                <input
                                    type="text"
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="us-east-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Access Key ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.accessKeyId}
                                    onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="AKIAIOSFODNN7EXAMPLE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Secret Access Key *
                                </label>
                                <input
                                    type="password"
                                    value={formData.secretAccessKey}
                                    onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Prefix (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.prefix}
                                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="folder/subfolder"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Optional prefix to limit browsing to a specific folder
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleAdd}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition"
                                >
                                    <LucideCheck size={18} />
                                    <span>Add</span>
                                </button>
                                <button
                                    onClick={cancelAdd}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 transition"
                                >
                                    <LucideX size={18} />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {buckets.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-sm p-8 text-center">
                        <p className="text-gray-400">No buckets configured. Add your first bucket to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {buckets.map((bucket) => (
                            <div
                                key={bucket._id}
                                className="bg-gray-800 border border-gray-700 rounded-sm p-4"
                            >
                                {editingId === bucket._id ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white mb-4">Edit Bucket</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Bucket Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.bucketName}
                                                    onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Endpoint *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.endpoint}
                                                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Region *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.region}
                                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Access Key ID *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.accessKeyId}
                                                    onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Leave empty to keep existing"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Secret Access Key *
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.secretAccessKey}
                                                    onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Leave empty to keep existing"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Prefix (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.prefix}
                                                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                                    className="w-full p-2 border border-gray-600 rounded-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`active-${bucket._id}`}
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="w-4 h-4"
                                                />
                                                <label htmlFor={`active-${bucket._id}`} className="text-sm text-gray-300">
                                                    Active
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleUpdate(bucket._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition"
                                                >
                                                    <LucideCheck size={18} />
                                                    <span>Save</span>
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 transition"
                                                >
                                                    <LucideX size={18} />
                                                    <span>Cancel</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{bucket.bucketName}</h3>
                                                <p className="text-sm text-gray-400">{bucket.endpoint}</p>
                                                {bucket.prefix && (
                                                    <p className="text-sm text-gray-400">Prefix: {bucket.prefix}</p>
                                                )}
                                                <p className="text-sm text-gray-400">Region: {bucket.region}</p>
                                                <p className={`text-sm ${bucket.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {bucket.isActive ? 'Active' : 'Inactive'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEdit(bucket)}
                                                    className="p-2 text-blue-400 hover:bg-gray-700 rounded-sm transition"
                                                    title="Edit"
                                                >
                                                    <LucideEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bucket._id)}
                                                    className="p-2 text-red-400 hover:bg-gray-700 rounded-sm transition"
                                                    title="Delete"
                                                >
                                                    <LucideTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingS3Buckets;

