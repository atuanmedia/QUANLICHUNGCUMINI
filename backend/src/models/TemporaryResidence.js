const mongoose = require("mongoose");

const tempRecordSchema = mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
    },
    type: {
      type: String,
      enum: ["tam_tru", "tam_vang"], // tạm trú hoặc tạm vắng
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const TemporaryResidence = mongoose.model("TemporaryResidence", tempRecordSchema);
module.exports = TemporaryResidence;
