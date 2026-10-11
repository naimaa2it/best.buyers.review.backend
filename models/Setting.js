const mongoose = require('mongoose');

// Single-document settings store (findOne()/findOneAndUpdate({}, ...)).
// strict:false keeps the generic /settings endpoint able to persist other keys.
const settingSchema = new mongoose.Schema(
  {
    // --- Auto product-rotation (hidden super-admin feature) ---
    // Master toggle. Gates BOTH the delete-on-insert and the daily behaviour.
    // OFF (default) = nothing is ever auto-deleted.
    autoDeleteEnabled: { type: Boolean, default: false },

    // How many of the oldest products the daily job removes per run (FIFO).
    // Owner-configurable: 0 disables only the daily part, 1, 2, 3, …
    dailyDeleteCount: { type: Number, default: 1, min: 0 },

    // Internal bookkeeping for the daily scheduler (not user-facing).
    lastDailyDeleteAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model('Setting', settingSchema);
