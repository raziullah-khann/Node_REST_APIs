const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    // imageUrl: {
    //   type: String,
    //   required: true,
    // },
    imageUrl: {
      type: String,
      required: function () {
        return this.isNew; // Only required when creating a new post
      },
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
