// models/Inventory.js
import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ingredient name is required"],
      trim: true,
      unique: true, // no duplicate ingredients
    },
    category: {
      type: String,
      enum: ["grain", "oil", "vegetable", "dairy", "spice", "beverage", "other"],
      default: "other",
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "litre", "ml", "pieces", "packets"],
      required: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    lastRestockedAt: {
      type: Date,
    },
    lastRestockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Virtual — is stock low?
inventorySchema.virtual("isLowStock").get(function () {
  return this.currentStock <= this.lowStockThreshold;
});

inventorySchema.set("toJSON", { virtuals: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
