import dbConnect from "@/lib/db"
import BookModel from "@/lib/models/book.model"
import OrderModel from "@/lib/models/order.model"
import SliderModel from "@/lib/models/slider.model"
import PartnerModel from "@/lib/models/partner.model"
import type { Book, SliderItem, Order, Partner } from "./types"

type BookFilters = {
  category?: string
  level?: string
  language?: string
  search?: string
}

const getErrorName = (error: unknown) =>
  error && typeof error === "object" && "name" in error ? String((error as { name?: unknown }).name) : ""

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const isMongoConnectivityError = (error: unknown) => {
  const name = getErrorName(error)
  const message = getErrorMessage(error)

  return (
    name === "MongoServerSelectionError" ||
    name === "MongoNetworkError" ||
    /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET|querySrv|server selection timed out/i.test(message)
  )
}

const logReadFailure = (resource: string, error: unknown) => {
  if (process.env.NODE_ENV !== "development") return

  console.warn(`Failed to load ${resource}; returning an empty fallback: ${getErrorMessage(error)}`)
}

const logConnectivityFailure = (resource: string, error: unknown) => {
  if (isMongoConnectivityError(error)) {
    logReadFailure(resource, error)
  }
}

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
  if (obj.metaPurchaseTrackedAt) obj.metaPurchaseTrackedAt = new Date(obj.metaPurchaseTrackedAt).toISOString();
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
export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  try {
    await dbConnect();

    const query: any = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.level) query.level = filters.level;
    if (filters?.language) query.language = filters.language;

    // Add search functionality
    if (filters?.search) {
      const searchRegex = new RegExp(filters.search, 'i'); // Case-insensitive search
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { level: searchRegex },
        { language: searchRegex },
        // Search in specifications if they exist
        { 'specifications.subject': searchRegex },
        { 'specifications.publisher': searchRegex },
        { 'specifications.isbn': searchRegex },
      ];
    }

    const books = await BookModel.find(query).sort({ createdAt: -1 });
    return books.map(doc => sanitize(doc));
  } catch (error) {
    logReadFailure("books", error)
    return []
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    await dbConnect();
    const book = await BookModel.findById(id);
    return book ? sanitize(book) : null;
  } catch (error) {
    logConnectivityFailure("book", error)
    return null;
  }
}

export async function getRelatedBooks(bookId: string, limit = 4): Promise<Book[]> {
  try {
    await dbConnect();
    const book = await BookModel.findById(bookId);
    if (!book) return [];

    const related = await BookModel.find({
      _id: { $ne: bookId },
      $or: [{ category: book.category }, { level: book.level }]
    }).limit(limit);

    return related.map(doc => sanitize(doc));
  } catch (error) {
    logConnectivityFailure("related books", error)
    return [];
  }
}

// Orders API (Mongo)
export async function getOrders(): Promise<Order[]> {
  try {
    await dbConnect();
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return orders.map((doc: any) => sanitizeOrder(doc));
  } catch (error) {
    logReadFailure("orders", error)
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    await dbConnect();
    const order = await OrderModel.findById(id);
    return order ? sanitizeOrder(order) : null;
  } catch (error) {
    logConnectivityFailure("order", error)
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
  try {
    await dbConnect();
    const sliders = await SliderModel.find().sort({ createdAt: -1 });
    return sliders.map((doc: any) => sanitizeSlider(doc));
  } catch (error) {
    logReadFailure("sliders", error)
    return []
  }
}

export async function getSliderById(id: string): Promise<SliderItem | null> {
  try {
    await dbConnect();
    const slider = await SliderModel.findById(id);
    return slider ? sanitizeSlider(slider) : null;
  } catch (error) {
    logConnectivityFailure("slider", error)
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
    const slider = await SliderModel.findById(id);
    if (!slider) return false;

    if (slider.image && slider.image.startsWith('http')) {
      try {
        const { del } = await import('@vercel/blob');
        await del(slider.image);
      } catch (e) {
        console.error("Failed to delete slider image blob", e);
      }
    }

    const res = await SliderModel.findByIdAndDelete(id);
    return !!res;
  } catch (error) {
    return false;
  }
}



// Partners API
// Partners API
export async function getPartners(): Promise<Partner[]> {
  try {
    await dbConnect();
    const partners = await PartnerModel.find().sort({ createdAt: -1 });
    return partners.map((doc: any) => sanitizePartner(doc));
  } catch (error) {
    logReadFailure("partners", error)
    return []
  }
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
