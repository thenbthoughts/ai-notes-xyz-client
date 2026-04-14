import React, { useEffect, useState } from 'react';
import axiosCustom from '../../../../../../config/axiosCustom.ts';
import toast from 'react-hot-toast';

interface Category {
    _id: string;
    name: string;
}

const ComponentLifeEventsEditCategory = ({ value, onChange, categoryId }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    categoryId: string;
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await axiosCustom.post<{
                    docs: Category[]
                }>(
                    '/api/life-events/category-crud/lifeEventCategoryGet',
                    {
                        isSubCategory: 'true',
                        parentId: categoryId,
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
    }, [categoryId]);

    return (
        <div>
            {loading && (
                <select
                    className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:p-2.5"
                    value={value}
                    onChange={onChange}
                >
                    <option value="000000000000000000000000">Loading...</option>
                </select>
            )}
            {!loading && (
                <select
                    className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:p-2.5"
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

export default ComponentLifeEventsEditCategory;