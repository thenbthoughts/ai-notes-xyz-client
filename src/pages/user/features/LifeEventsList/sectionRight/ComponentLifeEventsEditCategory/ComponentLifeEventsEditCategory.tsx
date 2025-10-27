import React, { useEffect, useState } from 'react';
import axiosCustom from '../../../../../../config/axiosCustom.ts';
import toast from 'react-hot-toast';

interface Category {
    _id: string;
    name: string;
}

const ComponentFilterCategory = ({ value, onChange }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosCustom.post<{
                    docs: Category[]
                }>(
                    '/api/life-events/category-crud/lifeEventCategoryGet',
                    {
                        isSubCategory: 'false',
                    }
                );
                setCategories(response.data.docs);
            } catch (err) {
                toast.error('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div>
            {loading && (
                <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={value}
                    onChange={onChange}
                >
                    <option value="000000000000000000000000">Loading...</option>
                </select>
            )}
            {!loading && (
                <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={value}
                    onChange={onChange}
                >
                    <option value="000000000000000000000000">Select</option>
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default ComponentFilterCategory;