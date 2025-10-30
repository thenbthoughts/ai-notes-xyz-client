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
                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                    value=""
                    onChange={() => { }}
                >
                    <option value="000000000000000000000000">Loading...</option>
                </select>
            )}
            {!loading && (
                <div className="mb-4">
                    <label className="block text-sm font-medium pb-2">
                        Category
                        <Link
                            to={'/user/life-events?action=category'}
                            className="ml-2 p-0 bg-indigo-600 text-white rounded-sm hover:bg-indigo-700 transition duration-300 inline-block text-sm"
                        >
                            <LucidePlus className="inline-block m-1"
                                size={'20px'}
                            />
                        </Link>
                    </label>
                    <select
                        className="p-2 border border-gray-300 rounded-sm hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
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