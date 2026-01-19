import dbConnect from "@/lib/db"
import BookModel from "@/lib/models/book.model"
import type { Book, SliderItem, Order, Partner } from "./types"
import { mockSliders, mockOrders, mockPartners } from "./mock-data" // Removed mockBooks

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

// Slider API
export async function getSliders(): Promise<SliderItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockSliders
}

// Orders API
export async function getOrders(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockOrders
}

export async function createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const newOrder: Order = {
    ...order,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  }
  mockOrders.push(newOrder)
  return newOrder
}

// Partners API
export async function getPartners(): Promise<Partner[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockPartners
}

export async function createPartner(partner: Omit<Partner, "id" | "createdAt">): Promise<Partner> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const newPartner: Partner = {
    ...partner,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  }
  mockPartners.push(newPartner)
  return newPartner
}
