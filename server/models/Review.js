// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // can only review if actually ordered
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    foodSnap: {
      type: String, // image URL
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// One review per student per order item
reviewSchema.index({ student: 1, menuItem: 1, order: 1 }, { unique: true });

// After saving a review, update MenuItem's average rating
reviewSchema.post("save", async function () {
  const Review = this.constructor;

  const stats = await Review.aggregate([
    { $match: { menuItem: this.menuItem } },
    {
      $group: {
        _id: "$menuItem",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("MenuItem").findByIdAndUpdate(this.menuItem, {
      "ratings.average": Math.round(stats[0].avgRating * 10) / 10,
      "ratings.count": stats[0].count,
    });
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
