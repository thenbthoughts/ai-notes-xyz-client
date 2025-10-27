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
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white text-gray-800"
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
    <div className="bg-white rounded-2xl p-6 mb-8 shadow border border-gray-100">
      <div className="flex flex-col gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-gray-800"
            value={level}
            onChange={(e) => setLevel(e.target.value as "main" | "sub")}
          >
            <option value="main">Main</option>
            <option value="sub">Subcategory</option>
          </select>
        </div>
        {level === "sub" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
            <CategoryDropdown value={parentId} onChange={(e) => setParentId(e.target.value)} />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-gray-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
        </div>
      </div>
      <button
        className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:scale-105 transition disabled:opacity-60"
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
    <div className="bg-white rounded-2xl p-6 mb-6 shadow border border-indigo-100">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Edit Name</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition"
          onClick={handleEdit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
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

  if (loading) return <div className="ml-6 text-xs text-gray-400">Loading subcategories...</div>;
  if (!subs.length) return null;

  return (
    <ul className="ml-4 mt-1 space-y-1">
      {subs.map((sub) => (
        <li
          key={sub._id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded-lg px-3 py-1 hover:bg-indigo-50 transition"
        >
          <span className="text-sm text-gray-700 flex items-center gap-1 mb-2 sm:mb-0">
            <span className="text-indigo-400">↳</span> {sub.name}
          </span>
          <div className="flex flex-col gap-1 sm:flex-row">
            <button
              className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 text-xs"
              onClick={() => onEdit(sub)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
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
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-fuchsia-50 rounded-3xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-8 text-indigo-700 text-center tracking-tight">
        Category Management


      <div className="flex justify-center mb-4">
        <Link
          to="/user/life-events"
          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold px-2 py-1 rounded shadow transition flex items-center text-sm mt-2"
        >
          ← Back
        </Link>
      </div>

      </h2>
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
        <div className="text-center text-gray-400 py-8">Loading categories...</div>
      ) : (
        <ul className="space-y-4">
          {categories
            .filter((cat) => !cat.isSubCategory)
            .map((cat) => (
              <li
                key={cat._id}
                className="bg-gradient-to-r from-indigo-100 to-fuchsia-100 rounded-2xl px-5 py-4 flex flex-col gap-2 shadow hover:shadow-md border border-indigo-50 transition"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-lg text-indigo-800">{cat.name}</span>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                    <button
                      className="bg-yellow-400 text-white px-4 py-1 rounded-lg font-semibold hover:bg-yellow-500 transition"
                      onClick={() => setEditCat(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded-lg font-semibold hover:bg-red-600 transition"
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