import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required!']
    },
    description: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: true,
        enum: ["Clothing", "Electronics", "Groceries", "Footwear", "Wristwatch", "Phone accessories"],
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default mongoose.model("Product", ProductSchema)