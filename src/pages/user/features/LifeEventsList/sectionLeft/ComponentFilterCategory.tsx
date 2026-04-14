import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import toast from 'react-hot-toast';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import {
    jotaiStateLifeEventCategory,
    jotaiStateLifeEventCategorySub,
} from '../stateJotai/lifeEventStateJotai';
import { Link } from 'react-router-dom';
import { LucidePlus } from 'lucide-react';

interface Category {
    _id: string;
    name: string;
}

const ComponentFilterCategory = () => {
    const [category, setCategory] = useAtom(jotaiStateLifeEventCategory);
    const setCategorySub = useSetAtom(jotaiStateLifeEventCategorySub);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

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
                    className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-xs text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:text-sm"
                    value=""
                    onChange={() => { }}
                >
                    <option value="000000000000000000000000">Loading...</option>
                </select>
            )}
            {!loading && (
                <div className="mb-3 sm:mb-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <label className="text-xs font-medium text-zinc-800 sm:text-sm">Category</label>
                        <Link
                            to={'/user/life-events?action=category'}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 p-1 text-white shadow-sm transition hover:bg-indigo-500"
                            title="Manage categories"
                        >
                            <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                        </Link>
                    </div>
                    <select
                        className="block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-xs text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:text-sm"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setCategorySub('');
                        }}
                    >
                        <option value="">Select</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default ComponentFilterCategory;