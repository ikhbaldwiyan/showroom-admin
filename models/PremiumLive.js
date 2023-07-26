const mongoose = require('mongoose');

const premiumLiveSchema = new mongoose.Schema(
  {
    liveDate: { type: String, required: true },
    webSocketId: { type: String, required: true },
    setlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Setlist' },
    theaterShow: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  },
  {
    collection: 'premium-lives',
  }
);

module.exports = mongoose.model('PremiumLive', premiumLiveSchema);
