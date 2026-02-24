// models/Inventory.js
import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
      unique: true, // one inventory record per menu item
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10, // alert when stock falls below this
    },
    unit: {
      type: String,
      enum: ["pieces", "plates", "cups", "bowls", "packets"],
      default: "pieces",
    },
    lastRestockedAt: {
      type: Date,
    },
    lastRestockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who restocked
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Virtual — returns true if stock is low
inventorySchema.virtual("isLowStock").get(function () {
  return this.currentStock <= this.lowStockThreshold;
});

// Include virtuals in JSON output
inventorySchema.set("toJSON", { virtuals: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
