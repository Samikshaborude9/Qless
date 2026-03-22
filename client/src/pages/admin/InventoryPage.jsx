// src/pages/admin/InventoryPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getInventoryAPI,
  addIngredientAPI,
  updateStockAPI,
  deleteIngredientAPI,
  updateThresholdAPI,
} from "../../api/inventoryAPI";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Package,
  X,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import useSocket from "../../hooks/useSocket";

const CATEGORIES = [
  "grain",
  "oil",
  "vegetable",
  "dairy",
  "spice",
  "beverage",
  "other",
];

const UNITS = ["kg", "g", "litre", "ml", "pieces", "packets"];

const EMPTY_FORM = {
  name: "",
  category: "other",
  currentStock: "",
  unit: "kg",
  lowStockThreshold: "",
  notes: "",
};

const InventoryPage = () => {
  const { on, off } = useSocket();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowOnly, setShowLowOnly] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory === "all" ? "" : selectedCategory;
      const data = await getInventoryAPI(cat);
      setInventory(data.inventory);
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // Real-time low stock alert
  useEffect(() => {
    on("stock:low", (data) => {
      toast.warning(`⚠️ Low stock: ${data.ingredientName}`);
    });
    return () => off("stock:low");
  }, [on, off]);

  const openAddModal = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold,
      notes: item.notes || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        currentStock: Number(form.currentStock),
        lowStockThreshold: Number(form.lowStockThreshold),
      };

      if (editItem) {
        await updateStockAPI(editItem._id, payload);
        setInventory((prev) =>
          prev.map((item) =>
            item._id === editItem._id ? { ...item, ...payload } : item
          )
        );
        toast.success("Ingredient updated!");
      } else {
        const data = await addIngredientAPI(payload);
        setInventory((prev) => [data.ingredient, ...prev]);
        toast.success("Ingredient added!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save ingredient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;
    setDeleting(id);
    try {
      await deleteIngredientAPI(id);
      setInventory((prev) => prev.filter((item) => item._id !== id));
      toast.success("Ingredient deleted");
    } catch (error) {
      toast.error("Failed to delete ingredient");
    } finally {
      setDeleting(null);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLow = showLowOnly
      ? item.currentStock <= item.lowStockThreshold
      : true;
    return matchesSearch && matchesLow;
  });

  const lowStockCount = inventory.filter(
    (item) => item.currentStock <= item.lowStockThreshold
  ).length;

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
            <h1 className="font-bold text-xl">Inventory</h1>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Ingredient
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Low Stock Banner */}
        {lowStockCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-6"
          >
            <AlertTriangle size={20} className="text-orange-500 shrink-0" />
            <p className="text-sm text-orange-700 font-medium">
              {lowStockCount} ingredient{lowStockCount > 1 ? "s are" : " is"}{" "}
              running low on stock!
            </p>
            <button
              onClick={() => setShowLowOnly(!showLowOnly)}
              className="ml-auto text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg font-medium"
            >
              {showLowOnly ? "Show All" : "View Low Stock"}
            </button>
          </motion.div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search ingredients..."
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

        {/* Inventory Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-20">
            <Package
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground mb-4">
              No ingredients found
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
            >
              Add First Ingredient
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                    Ingredient
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                    Category
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                    Stock
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                    Threshold
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInventory.map((item, i) => {
                  const isLow = item.currentStock <= item.lowStockThreshold;
                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={isLow ? "bg-orange-50/50" : ""}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-muted px-2.5 py-1 rounded-full capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-bold text-sm ${
                            isLow ? "text-orange-600" : "text-foreground"
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                          {item.lowStockThreshold} {item.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isLow ? (
                          <span className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                            <AlertTriangle size={12} />
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ OK
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deleting === item._id}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors disabled:opacity-60"
                          >
                            {deleting === item._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
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
              <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="font-bold text-lg">
                    {editItem ? "Update Stock" : "Add Ingredient"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Ingredient Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={!!editItem}
                      placeholder="Rice"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        disabled={!!editItem}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="capitalize">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Unit</label>
                      <select
                        name="unit"
                        value={form.unit}
                        onChange={handleChange}
                        disabled={!!editItem}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                      >
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Current Stock
                      </label>
                      <input
                        name="currentStock"
                        type="number"
                        value={form.currentStock}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="50"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Low Stock Alert
                      </label>
                      <input
                        name="lowStockThreshold"
                        type="number"
                        value={form.lowStockThreshold}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="10"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Notes (optional)
                    </label>
                    <input
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Basmati rice, supplier XYZ"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {editItem ? "Update Stock" : "Add Ingredient"}
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

export default InventoryPage;
