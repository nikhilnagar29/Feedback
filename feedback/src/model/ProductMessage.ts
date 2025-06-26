import mongoose, { Schema, Document } from "mongoose";

export interface ProductMessage extends Document {
    content: string;
    product: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ProductMessageSchema: Schema<ProductMessage> = new Schema({
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required']
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender reference is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ProductMessageModel = (mongoose.models.ProductMessage as mongoose.Model<ProductMessage>) || 
    mongoose.model<ProductMessage>('ProductMessage', ProductMessageSchema);

export default ProductMessageModel; 