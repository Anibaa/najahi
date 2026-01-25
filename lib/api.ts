import dbConnect from "@/lib/db"
import BookModel from "@/lib/models/book.model"
import OrderModel from "@/lib/models/order.model"
import SliderModel from "@/lib/models/slider.model"
import PartnerModel from "@/lib/models/partner.model"
import type { Book, SliderItem, Order, Partner } from "./types"
import { mockPartners } from "./mock-data"

// Helper to sanitize mongoose doc
const sanitize = (doc: any): Book => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj._id;
  delete obj.__v;
  // Ensure descriptionImage is preserved if it exists
  if (doc.descriptionImage) obj.descriptionImage = doc.descriptionImage;

  // Ensure dates are strings if types.ts expects strings
  if (obj.createdAt) obj.createdAt = new Date(obj.createdAt).toISOString();
  // Ensure numeric fields
  return obj as Book;
}

const sanitizeOrder = (doc: any): Order => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj._id;
  delete obj.__v;
  if (obj.createdAt) obj.createdAt = new Date(obj.createdAt).toISOString();
  return obj as Order;
}

const sanitizeSlider = (doc: any): SliderItem => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj._id;
  delete obj.__v;
  if (obj.createdAt) obj.createdAt = new Date(obj.createdAt).toISOString();
  return obj as SliderItem;
}

const sanitizePartner = (doc: any): Partner => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj._id;
  delete obj.__v;
  if (obj.createdAt) obj.createdAt = new Date(obj.createdAt).toISOString();
  return obj as Partner;
}

// Books API
export async function getBooks(filters?: {
  category?: string
  level?: string
  language?: string
}): Promise<Book[]> {
  await dbConnect();

  const query: any = {};
  if (filters?.category) query.category = filters.category;
  if (filters?.level) query.level = filters.level;
  if (filters?.language) query.language = filters.language;

  const books = await BookModel.find(query).sort({ createdAt: -1 });
  return books.map(doc => sanitize(doc));
}

export async function getBookById(id: string): Promise<Book | null> {
  await dbConnect();
  try {
    const book = await BookModel.findById(id);
    return book ? sanitize(book) : null;
  } catch (error) {
    return null;
  }
}

export async function getRelatedBooks(bookId: string, limit = 4): Promise<Book[]> {
  await dbConnect();
  try {
    const book = await BookModel.findById(bookId);
    if (!book) return [];

    const related = await BookModel.find({
      _id: { $ne: bookId },
      $or: [{ category: book.category }, { level: book.level }]
    }).limit(limit);

    return related.map(doc => sanitize(doc));
  } catch (error) {
    return [];
  }
}

// Orders API (Mongo)
export async function getOrders(): Promise<Order[]> {
  await dbConnect();
  const orders = await OrderModel.find().sort({ createdAt: -1 });
  return orders.map((doc: any) => sanitizeOrder(doc));
}

export async function getOrderById(id: string): Promise<Order | null> {
  await dbConnect();
  try {
    const order = await OrderModel.findById(id);
    return order ? sanitizeOrder(order) : null;
  } catch (error) {
    return null;
  }
}

export async function createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  await dbConnect();
  const created = await OrderModel.create(order as any);
  return sanitizeOrder(created);
}

export async function updateOrder(id: string, update: Partial<Order>): Promise<Order | null> {
  await dbConnect();
  try {
    const updated = await OrderModel.findByIdAndUpdate(id, update as any, { new: true });
    return updated ? sanitizeOrder(updated) : null;
  } catch (error) {
    return null;
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  await dbConnect();
  try {
    const res = await OrderModel.findByIdAndDelete(id);
    return !!res;
  } catch (error) {
    return false;
  }
}
// Slider API (Mongo)
export async function getSliders(): Promise<SliderItem[]> {
  await dbConnect();
  const sliders = await SliderModel.find().sort({ createdAt: -1 });
  return sliders.map((doc: any) => sanitizeSlider(doc));
}

export async function getSliderById(id: string): Promise<SliderItem | null> {
  await dbConnect();
  try {
    const slider = await SliderModel.findById(id);
    return slider ? sanitizeSlider(slider) : null;
  } catch (error) {
    return null;
  }
}

export async function createSlider(slider: Omit<SliderItem, 'id' | 'createdAt'>): Promise<SliderItem> {
  await dbConnect();
  const created = await SliderModel.create(slider as any);
  return sanitizeSlider(created);
}

export async function updateSlider(id: string, update: Partial<SliderItem>): Promise<SliderItem | null> {
  await dbConnect();
  try {
    const updated = await SliderModel.findByIdAndUpdate(id, update as any, { new: true });
    return updated ? sanitizeSlider(updated) : null;
  } catch (error) {
    return null;
  }
}

export async function deleteSlider(id: string): Promise<boolean> {
  await dbConnect();
  try {
    const res = await SliderModel.findByIdAndDelete(id);
    return !!res;
  } catch (error) {
    return false;
  }
}



// Partners API
// Partners API
export async function getPartners(): Promise<Partner[]> {
  await dbConnect();
  const partners = await PartnerModel.find().sort({ createdAt: -1 });
  return partners.map((doc: any) => sanitizePartner(doc));
}

export async function createPartner(partner: Omit<Partner, "id" | "createdAt">): Promise<Partner> {
  await dbConnect();
  const created = await PartnerModel.create(partner as any);
  return sanitizePartner(created);
}

export async function deletePartner(id: string): Promise<boolean> {
  await dbConnect();
  try {
    const res = await PartnerModel.findByIdAndDelete(id);
    return !!res;
  } catch (error) {
    return false;
  }
}
