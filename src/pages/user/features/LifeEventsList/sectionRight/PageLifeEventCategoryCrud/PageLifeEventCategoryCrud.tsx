import React, { useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface ILifeEventCategory {
  _id: string;
  name: string;
  isSubCategory: boolean;
  parentId: string | null;
}

const EMPTY_ID = "000000000000000000000000";

// Dropdown for selecting parent category
function CategoryDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  const [categories, setCategories] = useState<ILifeEventCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axiosCustom
      .post<{ docs: ILifeEventCategory[] }>(
        "/api/life-events/category-crud/lifeEventCategoryGet",
        { isSubCategory: false }
      )
      .then((res) => mounted && setCategories(res.data.docs))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <select
      className="w-full rounded-lg border border-zinc-200/90 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:py-2"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <option value={EMPTY_ID}>
        {loading ? "Loading..." : "Select parent category"}
      </option>
      {categories.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}

// Add Category Form
function AddCategory({ onAdd }: { onAdd: () => void }) {
  const [level, setLevel] = useState<"main" | "sub">("main");
  const [parentId, setParentId] = useState(EMPTY_ID);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setParentId(EMPTY_ID);
  }, [level]);

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Category name required");
      return;
    }
    if (level === "sub" && (!parentId || parentId === EMPTY_ID)) {
      toast.error("Select parent category");
      return;
    }
    setLoading(true);
    try {
      await axiosCustom.post("/api/life-events/category-crud/lifeEventCategoryAdd", {
        name: name.trim(),
        isSubCategory: level === "sub",
        parentId: level === "sub" ? parentId : "",
      });
      toast.success("Category added!");
      setName("");
      setLevel("main");
      setParentId(EMPTY_ID);
      onAdd();
    } catch {
      toast.error("Failed to add category");
    }
    setLoading(false);
  };

  return (
    <div className="mb-6 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:mb-8 sm:rounded-2xl sm:p-6">
      <div className="mb-4 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Level</label>
          <select
            className="w-full rounded-lg border border-zinc-200/90 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:py-2"
            value={level}
            onChange={(e) => setLevel(e.target.value as "main" | "sub")}
          >
            <option value="main">Main</option>
            <option value="sub">Subcategory</option>
          </select>
        </div>
        {level === "sub" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Parent</label>
            <CategoryDropdown value={parentId} onChange={(e) => setParentId(e.target.value)} />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
          <input
            className="w-full rounded-lg border border-zinc-200/90 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
        </div>
      </div>
      <button
        className="w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 sm:py-2"
        onClick={handleAdd}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Category"}
      </button>
    </div>
  );
}

// Edit Category Form
function EditCategory({
  category,
  onCancel,
  onSave,
}: {
  category: ILifeEventCategory;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(category.name);
  }, [category]);

  const handleEdit = async () => {
    if (!name.trim()) {
      toast.error("Category name required");
      return;
    }
    setLoading(true);
    try {
      await axiosCustom.post("/api/life-events/category-crud/lifeEventCategoryEdit", {
        _id: category._id,
        name: name.trim(),
      });
      toast.success("Category updated!");
      onSave();
    } catch {
      toast.error("Failed to update");
    }
    setLoading(false);
  };

  return (
    <div className="mb-6 rounded-xl border border-indigo-200/60 bg-indigo-50/40 p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zinc-700">Edit Name</label>
        <input
          className="w-full rounded-lg border border-zinc-200/90 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:py-2"
          onClick={handleEdit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 sm:py-2"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Subcategories List
function Subcategories({
  parentId,
  onEdit,
  onDelete,
}: {
  parentId: string;
  onEdit: (cat: ILifeEventCategory) => void;
  onDelete: (id: string) => void;
}) {
  const [subs, setSubs] = useState<ILifeEventCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await axiosCustom.post<{ docs: ILifeEventCategory[] }>(
        "/api/life-events/category-crud/lifeEventCategoryGet",
        { isSubCategory: true, parentId }
      );
      setSubs(res.data.docs);
    } catch {
      toast.error("Failed to load subcategories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubs();
    // eslint-disable-next-line
  }, [parentId]);

  if (loading) return <div className="ml-4 text-xs text-zinc-500 sm:ml-6">Loading subcategories...</div>;
  if (!subs.length) return null;

  return (
    <ul className="ml-2 mt-2 space-y-2 sm:ml-4">
      {subs.map((sub) => (
        <li
          key={sub._id}
          className="flex flex-col gap-2 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 transition hover:border-zinc-200 sm:flex-row sm:items-center sm:justify-between sm:py-1.5"
        >
          <span className="flex items-center gap-1 text-sm text-zinc-700">
            <span className="text-indigo-500">↳</span> {sub.name}
          </span>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
            <button
              className="min-h-9 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 sm:min-h-0"
              onClick={() => onEdit(sub)}
            >
              Edit
            </button>
            <button
              className="min-h-9 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 sm:min-h-0"
              onClick={() => onDelete(sub._id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Main CRUD Component
function CategoryCrud() {
  const [categories, setCategories] = useState<ILifeEventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState<ILifeEventCategory | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosCustom.post<{ docs: ILifeEventCategory[] }>(
        "/api/life-events/category-crud/lifeEventCategoryGet",
        { isSubCategory: false }
      );
      setCategories(res.data.docs);
    } catch {
      toast.error("Failed to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axiosCustom.post("/api/life-events/category-crud/lifeEventCategoryDelete", { _id: id });
      toast.success("Deleted!");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to delete");
      setRefreshKey((k) => k + 1);
    }
  };

  // Responsive grid for categories
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Category Management
        </h2>
        <div className="mt-4 flex justify-center">
          <Link
            to="/user/life-events"
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            ← Back
          </Link>
        </div>
      </div>
      <AddCategory onAdd={() => setRefreshKey((k) => k + 1)} />
      {editCat && (
        <EditCategory
          category={editCat}
          onCancel={() => setEditCat(null)}
          onSave={() => {
            setEditCat(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
      {loading ? (
        <div className="py-8 text-center text-sm text-zinc-500">Loading categories...</div>
      ) : (
        <ul className="space-y-3 sm:space-y-4">
          {categories
            .filter((cat) => !cat.isSubCategory)
            .map((cat) => (
              <li
                key={cat._id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 sm:gap-2 sm:px-5 sm:py-4"
              >
                <div className="flex flex-col gap-3">
                  <span className="text-lg font-semibold text-zinc-900">{cat.name}</span>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                    <button
                      className="min-h-10 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 sm:min-h-0"
                      onClick={() => setEditCat(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="min-h-10 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 sm:min-h-0"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <Subcategories
                  parentId={cat._id}
                  onEdit={setEditCat}
                  onDelete={handleDelete}
                />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default CategoryCrud;