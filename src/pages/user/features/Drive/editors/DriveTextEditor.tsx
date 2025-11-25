import { useState, useEffect } from 'react';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveGetFileUrl, driveUpdateFile } from '../utils/driveAxios';
import { LucideX, LucideSave } from 'lucide-react';
import toast from 'react-hot-toast';

interface DriveTextEditorProps {
    file: DriveFile;
    bucketName: string;
    onClose: () => void;
    onSave?: () => void;
}

const DriveTextEditor = ({ file, bucketName, onClose, onSave }: DriveTextEditorProps) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const fileUrl = driveGetFileUrl(bucketName, file.fileKey);
                const response = await fetch(fileUrl, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch file');
                }
                const text = await response.text();
                setContent(text);
            } catch (error) {
                toast.error('Failed to load file content');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [file, bucketName]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await driveUpdateFile({
                bucketName,
                fileKey: file.fileKey,
                content,
            });
            toast.success('File saved successfully');
            if (onSave) {
                onSave();
            }
            onClose();
        } catch (error) {
            toast.error('Failed to save file');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <p>Loading file...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{file.fileName}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <LucideSave size={18} />
                            <span>{saving ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-sm transition"
                        >
                            <LucideX size={24} />
                        </button>
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 p-4 border-0 resize-none focus:outline-none font-mono text-sm"
                    placeholder="File content..."
                />
            </div>
        </div>
    );
};

export default DriveTextEditor;

