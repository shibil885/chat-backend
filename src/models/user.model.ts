import mongoose from "mongoose";

const PROFILE_DEFAULTS = [
  "https://pics.craiyon.com/2023-07-09/2397d134ccee4679bfa3de7f100a62f4.webp",
  "https://www.shutterstock.com/image-vector/cute-cartoon-cat-profile-avatar-600nw-2432356437.jpg",
  "https://cdn.dribbble.com/users/1677071/screenshots/5689364/media/be35f843295e7dc79e2f8bb673ca58e5.gif?resize=400x0",
  "https://static.vecteezy.com/system/resources/thumbnails/034/639/180/small_2x/ai-generated-cute-cat-avatar-icon-clip-art-sticker-decoration-simple-background-free-photo.jpg",
  "https://media.istockphoto.com/id/1369292442/vector/cat-user-profile-icon-avatar-forum-symbol-placeholder-for-social-networks-forums-face-sign.jpg?s=170667a&w=0&k=20&c=V9q_fnpEyaWFXWiYLdRKIwTWQ7EVyWeMp_ir122qYFE=",
];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    avatar: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    socketId: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.avatar) {
    const userCount = await mongoose.model("User").countDocuments();
    const avatarIndex = userCount % PROFILE_DEFAULTS.length;
    this.avatar = PROFILE_DEFAULTS[avatarIndex];
  }
  next();
});


export default mongoose.model("User", userSchema);
