// src/pages/admin/MenuManagement.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMenuAPI,
  addMenuItemAPI,
  updateMenuItemAPI,
  deleteMenuItemAPI,
} from "../../api/menuAPI";
import { formatPrice } from "../../lib/utils";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  X,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
  "beverages",
  "other",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "snacks",
  stock: "",
  prepTime: "",
  tags: "",
  image: "",
  isAvailable: true,
};

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, [search, selectedCategory]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (selectedCategory !== "all") filters.category = selectedCategory;
      const data = await getMenuAPI(filters);
      setMenuItems(data.menuItems);
    } catch (error) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      stock: item.stock,
      prepTime: item.prepTime,
      tags: item.tags?.join(", ") || "",
      image: item.image || "",
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        prepTime: Number(form.prepTime),
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim())
          : [],
      };

      if (editItem) {
        await updateMenuItemAPI(editItem._id, payload);
        setMenuItems((prev) =>
          prev.map((item) =>
            item._id === editItem._id ? { ...item, ...payload } : item
          )
        );
        toast.success("Menu item updated!");
      } else {
        const data = await addMenuItemAPI(payload);
        setMenuItems((prev) => [data.menuItem, ...prev]);
        toast.success("Menu item added!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    setDeleting(id);
    try {
      await deleteMenuItemAPI(id);
      setMenuItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Menu item deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-xl">Menu Management</h1>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <UtensilsCrossed
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground mb-4">No menu items found</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {menuItems.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border rounded-2xl overflow-hidden ${
                  item.isAvailable
                    ? "border-border"
                    : "border-red-200 opacity-60"
                }`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center">
                    <UtensilsCrossed
                      size={28}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {item.category}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-primary">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stock: {item.stock}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80 transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      {deleting === item._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="font-bold text-lg">
                    {editItem ? "Edit Menu Item" : "Add Menu Item"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-sm font-medium">Name</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Veg Burger"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Crispy veggie patty..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Price (₹)</label>
                      <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="60"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Stock</label>
                      <input
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="50"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="capitalize">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Prep Time (mins)
                      </label>
                      <input
                        name="prepTime"
                        type="number"
                        value={form.prepTime}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="10"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="text-sm font-medium">Image URL</label>
                      <input
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="text-sm font-medium">
                        Tags (comma separated)
                      </label>
                      <input
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="veg, spicy, popular"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="col-span-2 flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        id="isAvailable"
                        checked={form.isAvailable}
                        onChange={handleChange}
                        className="w-4 h-4 accent-primary"
                      />
                      <label
                        htmlFor="isAvailable"
                        className="text-sm font-medium"
                      >
                        Available for ordering
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {editItem ? "Update Item" : "Add Item"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuManagement;
