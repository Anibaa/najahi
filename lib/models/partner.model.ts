import mongoose, { Schema } from 'mongoose';

const PartnerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    bookTitle: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    language: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

PartnerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Avoid OverwriteModelError
if ((mongoose as any).models && (mongoose as any).models.Partner) {
    delete (mongoose as any).models.Partner;
}

const Partner = mongoose.model('Partner', PartnerSchema);

export default Partner;
