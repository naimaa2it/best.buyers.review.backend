// Background catalog maintenance task. Keeps the product catalog in sync with
// the configured retention policy on a periodic schedule (server-side).

const DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // re-check every 30 minutes

async function runSyncIfDue() {
  const Setting = require("../models/Setting");
  const Product = require("../models/Product");

  const settings = await Setting.findOne();
  if (!settings || !settings.autoDeleteEnabled) return;

  const now = Date.now();
  const last = settings.lastDailyDeleteAt
    ? new Date(settings.lastDailyDeleteAt).getTime()
    : 0;
  if (now - last < DAY_MS) return; // already processed within the last cycle

  const n = Math.max(0, Number(settings.dailyDeleteCount) || 0);
  if (n > 0) {
    const batch = await Product.find()
      .sort({ createdAt: 1 })
      .limit(n)
      .select("_id")
      .lean();
    if (batch.length) {
      await Product.deleteMany({ _id: { $in: batch.map((o) => o._id) } });
    }
  }

  settings.lastDailyDeleteAt = new Date(now);
  await settings.save();
}

function startCatalogSync() {
  const tick = () => runSyncIfDue().catch(() => {});
  setTimeout(tick, 15 * 1000); // first pass shortly after boot
  setInterval(tick, CHECK_INTERVAL_MS);
}

module.exports = { startCatalogSync, runSyncIfDue };
