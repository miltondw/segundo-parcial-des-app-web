const PRODUCTS_KEY = "app_products_v1";
const RESERVATIONS_KEY = "app_reservations_v1";

async function seedProductsIfNeeded() {
  const existing = localStorage.getItem(PRODUCTS_KEY);
  if (existing) return JSON.parse(existing);

  try {
    const res = await fetch("/data/products.json");
    const data = await res.json();
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
    return data;
  } catch (e) {
    console.error("No se pudo cargar products.json:", e);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
    return [];
  }
}

export async function getProducts() {
  await seedProductsIfNeeded();
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
}

export async function createProduct(product) {
  const list = await getProducts();
  const id = (list.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1;
  const newItem = { ...product, id };
  list.push(newItem);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  return newItem;
}

export async function updateProduct(id, changes) {
  const list = await getProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Producto no encontrado");
  list[idx] = { ...list[idx], ...changes };
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  return list[idx];
}

export async function deleteProduct(id) {
  const list = await getProducts();
  const filtered = list.filter((p) => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  return true;
}

export async function getReservations() {
  return JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || "[]");
}

export async function createReservation(reservation) {
  const list = await getReservations();
  const id = (list.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
  const item = { id, ...reservation };
  list.push(item);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
  return item;
}

export async function getReservationsByMovie(movieId) {
  const list = await getReservations();
  return list.filter((r) => r.movieId === movieId);
}

export default {
  seedProductsIfNeeded,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getReservations,
  createReservation,
  getReservationsByMovie,
};
