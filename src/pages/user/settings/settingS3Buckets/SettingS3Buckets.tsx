import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { LucidePlus, LucideTrash2, LucideEdit, LucideX, LucideCheck, LucideWifi } from 'lucide-react';
import { DriveBucket } from '../../../../types/pages/Drive.types';
import { driveGetBuckets, driveAddBucket, driveUpdateBucket, driveDeleteBucket } from '../../features/Drive/utils/driveAxios';
import axiosCustom from '../../../../config/axiosCustom';

const SettingS3Buckets = () => {
    const [buckets, setBuckets] = useState<DriveBucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testLatency, setTestLatency] = useState<number | null>(null);

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

    const handleTestConnection = async () => {
        setTesting(true);
        const start = Date.now();
        try {
            const res = await axiosCustom.get('/api/dashboard/crud/test-connection');
            const elapsed = res.data.latencyMs ?? (Date.now() - start);
            setTestLatency(elapsed);
            toast.success(`Connection ok ${elapsed}ms`);
        } catch {
            toast.error('Test failed');
        } finally {
            setTesting(false);
        }
    };

    const handleTestS3 = async () => {
        const start = Date.now();
        try {
            const res = await axiosCustom.post('/api/user/api-keys/testS3Connection', {}, { withCredentials: true });
            const elapsed = res.data.latencyMs ?? (Date.now() - start);
            setTestLatency(elapsed);
            toast.success(`S3 valid ${elapsed}ms`);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-3xl">
                <div className="space-y-2">
                    {[1, 2, 3].map((k) => { return (<div key={k} className="h-12 animate-pulse rounded bg-zinc-800" />); })}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl">
            <Helmet><title>S3 Buckets - Settings</title></Helmet>
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">S3 Buckets <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{buckets.length} buckets</span></h2>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => { void handleTestConnection(); }} disabled={testing} className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50" aria-label="Test connection"><LucideWifi className="h-3 w-3" />Test {testLatency !== null ? `${testLatency}ms` : ''}</button>
                        <button type="button" onClick={() => { void handleTestS3(); }} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700" aria-label="Test S3">S3 ping</button>
                        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition" aria-label="Add bucket">
                            <LucidePlus size={18} />
                            <span>Add Bucket</span>
                        </button>
                    </div>
                </div>

                {showAddForm && (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-sm p-4 mb-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Add New Bucket</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Bucket Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.bucketName}
                                    onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="my-bucket"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Endpoint *
                                </label>
                                <input
                                    type="text"
                                    value={formData.endpoint}
                                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://s3.amazonaws.com or https://r2.cloudflarestorage.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Region *
                                </label>
                                <input
                                    type="text"
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="us-east-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Access Key ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.accessKeyId}
                                    onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="AKIAIOSFODNN7EXAMPLE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Secret Access Key *
                                </label>
                                <input
                                    type="password"
                                    value={formData.secretAccessKey}
                                    onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Prefix (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.prefix}
                                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="folder/subfolder"
                                />
                                <p className="text-xs text-zinc-400 mt-1">
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
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-sm hover:bg-zinc-700 transition"
                                >
                                    <LucideX size={18} />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {buckets.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-sm p-8 text-center">
                        <p className="text-zinc-400">No buckets configured. Add your first bucket to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {buckets.map((bucket) => (
                            <div
                                key={bucket._id}
                                className="bg-zinc-900 border border-zinc-700 rounded-sm p-4"
                            >
                                {editingId === bucket._id ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white mb-4">Edit Bucket</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Bucket Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.bucketName}
                                                    onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Endpoint *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.endpoint}
                                                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Region *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.region}
                                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Access Key ID *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.accessKeyId}
                                                    onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Leave empty to keep existing"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Secret Access Key *
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.secretAccessKey}
                                                    onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Leave empty to keep existing"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Prefix (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.prefix}
                                                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                                    className="w-full p-2 border border-zinc-700 rounded-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                <label htmlFor={`active-${bucket._id}`} className="text-sm text-zinc-300">
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
                                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-sm hover:bg-zinc-700 transition"
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
                                                <p className="text-sm text-zinc-400">{bucket.endpoint}</p>
                                                {bucket.prefix && (
                                                    <p className="text-sm text-zinc-400">Prefix: {bucket.prefix}</p>
                                                )}
                                                <p className="text-sm text-zinc-400">Region: {bucket.region}</p>
                                                <p className={`text-sm ${bucket.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {bucket.isActive ? 'Active' : 'Inactive'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEdit(bucket)}
                                                    className="p-2 text-blue-400 hover:bg-zinc-700 rounded-sm transition"
                                                    title="Edit"
                                                >
                                                    <LucideEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bucket._id)}
                                                    className="p-2 text-red-400 hover:bg-zinc-700 rounded-sm transition"
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

