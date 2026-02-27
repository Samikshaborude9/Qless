// controllers/menuController.js
import MenuItem from "../models/MenuItem.js";
import Inventory from "../models/Inventory.js";

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenu = async (req, res, next) => {
  try {
    const { category, available, search } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (available === "true") filter.isAvailable = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const menuItems = await MenuItem.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new menu item
// @route   POST /api/menu
// @access  Private/Admin
export const addMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock, prepTime, tags } =
      req.body;

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      image,
      stock,
      prepTime,
      tags,
    });

    // Auto create inventory record for this item
    // await Inventory.create({
    //   menuItem: menuItem._id,
    //   currentStock: stock || 0,
    // });

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Delete associated inventory record
    // await Inventory.findOneAndDelete({ menuItem: req.params.id });

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock only
// @route   PATCH /api/menu/:id/stock
// @access  Private/Admin
export const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Sync inventory record
    await Inventory.findOneAndUpdate(
      { menuItem: req.params.id },
      { currentStock: stock, lastRestockedAt: new Date(), lastRestockedBy: req.user._id },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      menuItem,
    });
  } catch (error) {
    next(error);
  }
};
