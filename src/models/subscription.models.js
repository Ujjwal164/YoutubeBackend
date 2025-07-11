import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type:moongoose.Schema.Types.ObjectId,
        ref: "User",
        
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, {timestamps: true});

export const Subscription = moongoose.model("Subscription", subscriptionSchema);