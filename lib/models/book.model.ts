
import mongoose, { Schema } from 'mongoose';

const BookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, enum: ["writing", "cours", "devoirs", "histoire"], required: true },
    level: { type: String, enum: ["college", "lycee", "preparatoire"], required: true },
    language: { type: String, enum: ["ar", "fr", "en"], required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    status: { type: String, enum: ["En stock", "Hors stock", "Préparation", "Livraison", "Livré"], default: "En stock" },
    specifications: { type: Map, of: String }, // Flexible for key-value pairs
    descriptionImages: { type: [String], default: [] }, // Changed to array
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure the 'id' virtual is created (maps _id to id)
BookSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure that we don't have model recompilation errors in dev mode
// Ensure that we don't have model recompilation errors in dev mode
if (mongoose.models.Book) {
    delete mongoose.models.Book
}
const Book = mongoose.model('Book', BookSchema);

export default Book;
