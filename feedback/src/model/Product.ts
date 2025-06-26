import mongoose, { Schema, Document } from "mongoose";

export interface Product extends Document {
    name: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    messages: mongoose.Types.ObjectId[]; // Array of message IDs
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema<Product> = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [1000, 'Product description cannot be more than 1000 characters']
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Product owner is required']
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'ProductMessage'
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const ProductModel = (mongoose.models.Product as mongoose.Model<Product>) || 
    mongoose.model<Product>('Product', ProductSchema);

export default ProductModel; 