import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
    bookIds: { type: [String], required: true },
    quantities: { type: [Number], required: true },
    totalPrice: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, default: 'Card' },
    status: { type: String, enum: ['Préparation', 'Livraison', 'Livré'], default: 'Préparation' },
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

OrderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

if ((mongoose as any).models && (mongoose as any).models.Order) {
    delete (mongoose as any).models.Order;
}

const Order = mongoose.model('Order', OrderSchema);

export default Order;
