// Orders.js
// Handles logic for 'orders' and 'guestOrders' collections in Firestore
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const ORDERS_COLLECTION = "orders";
const GUEST_ORDERS_COLLECTION = "guestOrders";

// Fetch all orders from a collection (orders or guestOrders)
export async function fetchOrders(isGuest = false) {
  const colName = isGuest ? GUEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const colRef = collection(db, colName);
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Fetch a single order by ID
export async function fetchOrderById(orderId, isGuest = false) {
  const colName = isGuest ? GUEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const docRef = doc(db, colName, orderId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

// Create a new order
export async function createOrder(orderData, isGuest = false) {
  const colName = isGuest ? GUEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const colRef = collection(db, colName);
  const docRef = await addDoc(colRef, orderData);
  return docRef.id;
}

// Update an order (e.g., status)
export async function updateOrder(orderId, updateData, isGuest = false) {
  const colName = isGuest ? GUEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const docRef = doc(db, colName, orderId);
  await updateDoc(docRef, updateData);
}

// Delete an order
export async function deleteOrder(orderId, isGuest = false) {
  const colName = isGuest ? GUEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const docRef = doc(db, colName, orderId);
  await deleteDoc(docRef);
}

// Utility: Get all orders from both collections
export async function fetchAllOrdersCombined() {
  const [authOrders, guestOrders] = await Promise.all([
    fetchOrders(false),
    fetchOrders(true),
  ]);
  const authOrdersWithFlag = authOrders.map((o) => ({ ...o, isGuest: false }));
  const guestOrdersWithFlag = guestOrders.map((o) => ({ ...o, isGuest: true }));
  return [...authOrdersWithFlag, ...guestOrdersWithFlag];
}

// Fetch orders by status from a collection (orders or guestOrders)
export async function fetchOrdersByStatus(status, isGuest = false) {
  const colName = isGuest ? GUEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const colRef = collection(db, colName);
  const q = query(
    colRef,
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Fetch all orders by status from both collections
export async function fetchAllOrdersByStatus(status) {
  const [authOrders, guestOrders] = await Promise.all([
    fetchOrdersByStatus(status, false),
    fetchOrdersByStatus(status, true),
  ]);
  const authOrdersWithFlag = authOrders.map((o) => ({ ...o, isGuest: false }));
  const guestOrdersWithFlag = guestOrders.map((o) => ({ ...o, isGuest: true }));
  return [...authOrdersWithFlag, ...guestOrdersWithFlag];
}
