import React, { Fragment, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import toast from 'react-hot-toast';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import {
    jotaiStateLifeEventCategory,
    jotaiStateLifeEventCategorySub,
} from '../stateJotai/lifeEventStateJotai';

interface Category {
    _id: string;
    name: string;
}

const ComponentFilterCategorySub = () => {
    const [categorySub, setCategorySub] = useAtom(jotaiStateLifeEventCategorySub);

    const category = useAtomValue(jotaiStateLifeEventCategory);

    const [categories, setCategories] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);



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
                        parentId: category,
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
    }, [category]);

    return (
        <Fragment>
            {category.length === 24 && (
                <div>
                    {loading && (
                        <select
                            className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-xs text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:text-sm"
                            value={categorySub}
                            onChange={(e) => setCategorySub(e.target.value)}
                        >
                            <option value="000000000000000000000000">Loading...</option>
                        </select>
                    )}
                    {!loading && (
                        <div className="mb-3 sm:mb-4">
                            <label className="mb-1.5 block text-xs font-medium text-zinc-800 sm:text-sm">Sub Category</label>
                            <select
                                className="block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-xs text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:text-sm"
                                value={categorySub}
                                onChange={(e) => setCategorySub(e.target.value)}
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
            )}
        </Fragment>
    );
};

export default ComponentFilterCategorySub;