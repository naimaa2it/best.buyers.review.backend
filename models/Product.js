const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  feature: [String],
});

const seoSchema = new mongoose.Schema({
  title: String,
  description: String,
  keywords: [String],
});

const specificationSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const reviewSchema = new mongoose.Schema({
  author: String,
  rating: Number,
  title: String,
  content: String,
  date: Date,
});

const questionSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

const anchorTagSchema = new mongoose.Schema({
  word: String,
  link: String,
  isExternal: {
    type: Boolean,
    default: false,
  },
});

const productSchema = new mongoose.Schema(
  {
    asin: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    brand: String,

    // Category System(ref is same cz in category schema there have hiaercical flow)
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    labels: {
      type: [String],
      default: [],
    },

    // Images - UPDATED for sub-images
    images: [
      {
        url: String,
        variant: {
          type: String,
          enum: ["MAIN", "SUB", "VARIANT", "FEATURE"],
          default: "SUB",
        },
        height: Number,
        width: Number,
        caption: String,
        altText: String,
      },
    ],

    // Pricing
    price: {
      amount: Number,
      currency: String,
      displayAmount: String,
    },
    listPrice: {
      amount: Number,
      currency: String,
      displayAmount: String,
    },
    discount: {
      amount: Number,
      currency: String,
      displayAmount: String,
      percentage: Number,
    },

    // Custom Rating
    customRating: {
      rating: Number,
      reviewCount: Number,
    },

    // Bought in Past Month
    boughtInPastMonth: {
      type: String,
      trim: true,
    },

    // Product Details
    description: String,
    descriptionTitle: String,
    introduction: String,

    // Anchor Tags for auto-linking
    anchorTags: [anchorTagSchema],

    // Features & Specifications
    features: featureSchema,
    colors: [String],
    styles: [String],
    specifications: [specificationSchema],

    // SEO
    seo: seoSchema,

    // Content Sections
    factorsToConsider: [String],
    mostImportantFactors: {
      heading: String,
      text: String,
    },
    commonQuestions: [questionSchema],
    conclusion: {
      heading: String,
      text: String,
    },

    // Custom Reviews
    customReviews: [reviewSchema],

    // Affiliate
    affiliateUrl: String,
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isCoupon: {
      type: Boolean,
      default: false,
    },

    // Status
    availability: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Pre-order", "Available"],
      default: "In Stock",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    isFullReview: {
      type: Boolean,
      default: false,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ "price.amount": 1 });
productSchema.index({ brand: 1 });
productSchema.index({ asin: 1 }, { unique: true });
productSchema.index({ mainCategory: 1, subCategory: 1, subSubCategory: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ labels: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ "customRating.rating": -1 });
productSchema.index({ mainCategory: 1 });
productSchema.index({ lastUpdated: -1 });
productSchema.index({ isFeatured: 1 });

// --- Delete-on-insert rotation ------------------------------------------
// When the master toggle is ON, creating a NEW product hard-deletes the single
// oldest product (FIFO by createdAt), one-for-one. Fires ONLY on insert, never
// on edit/update. Silent by design: errors are swallowed so a create never breaks.
productSchema.pre("save", function (next) {
  // capture insert-vs-update before save() flips isNew
  this.$locals.wasNew = this.isNew;
  next();
});

productSchema.post("save", async function (doc) {
  if (!this.$locals.wasNew) return; // updates must not trigger deletion
  try {
    const Setting = require("./Setting");
    const settings = await Setting.findOne().select("autoDeleteEnabled").lean();
    if (!settings || !settings.autoDeleteEnabled) return;

    const Product = mongoose.model("Product");
    const oldest = await Product.findOne({ _id: { $ne: doc._id } })
      .sort({ createdAt: 1 })
      .select("_id")
      .lean();
    if (oldest) {
      await Product.deleteOne({ _id: oldest._id }); // hard delete, no hooks recursion
    }
  } catch {
    // silent — never surface to the caller
  }
});

module.exports = mongoose.model("Product", productSchema);
