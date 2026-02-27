// controllers/inventoryController.js
import Inventory from "../models/Inventory.js";

// @desc    Get all inventory ingredients
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventory = async (req, res, next) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) filter.category = category;

    const inventory = await Inventory.find(filter)
      .populate("lastRestockedBy", "name email")
      .sort({ currentStock: 1 }); // lowest stock first

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock ingredients
// @route   GET /api/inventory/low-stock
// @access  Private/Admin
export const getLowStockItems = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().populate(
      "lastRestockedBy",
      "name email"
    );

    const lowStockItems = inventory.filter(
      (item) => item.currentStock <= item.lowStockThreshold
    );

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      lowStockItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new ingredient
// @route   POST /api/inventory
// @access  Private/Admin
export const addIngredient = async (req, res, next) => {
  try {
    const { name, category, currentStock, unit, lowStockThreshold, notes } =
      req.body;

    const ingredient = await Inventory.create({
      name,
      category,
      currentStock,
      unit,
      lowStockThreshold,
      notes,
      lastRestockedAt: new Date(),
      lastRestockedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Ingredient added successfully",
      ingredient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ingredient stock
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateStock = async (req, res, next) => {
  try {
    const { currentStock, lowStockThreshold, notes } = req.body;

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        currentStock,
        lowStockThreshold,
        notes,
        lastRestockedAt: new Date(),
        lastRestockedBy: req.user._id,
      },
      { new: true, runValidators: true }
    ).populate("lastRestockedBy", "name email");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    // Emit low stock alert to admin if needed
    if (currentStock <= inventory.lowStockThreshold) {
      const io = req.app.locals.io;
      if (io) {
        io.to("adminRoom").emit("stock:low", {
          ingredientName: inventory.name,
          currentStock,
          unit: inventory.unit,
          lowStockThreshold: inventory.lowStockThreshold,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteIngredient = async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ingredient deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update threshold only
// @route   PATCH /api/inventory/:id/threshold
// @access  Private/Admin
export const updateThreshold = async (req, res, next) => {
  try {
    const { lowStockThreshold } = req.body;

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { lowStockThreshold },
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Threshold updated successfully",
      inventory,
    });
  } catch (error) {
    next(error);
  }
};
