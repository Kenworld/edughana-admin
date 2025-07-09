import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  startAfter,
  limit as qLimit,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/**
 * Adds a new blog post to Firestore 'blogs' collection.
 * @param {Object} blogData - The blog post data (title, author, content, images, tags, etc.)
 * @returns {Promise<string>} - The new document ID
 */
export async function addBlogPost(blogData) {
  const docRef = await addDoc(collection(db, "blogs"), {
    ...blogData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Fetches all blog posts from Firestore 'blogs' collection.
 * @returns {Promise<Array>} - Array of blog post objects with id and data
 */
export async function getAllBlogs() {
  const querySnapshot = await getDocs(collection(db, "blogs"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Updates a blog post in Firestore 'blogs' collection by ID.
 * @param {string} blogId - The blog document ID
 * @param {Object} data - The updated blog data
 * @returns {Promise<void>}
 */
export async function updateBlogPost(blogId, data) {
  const blogRef = doc(db, "blogs", blogId);
  await updateDoc(blogRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a blog post from Firestore 'blogs' collection by ID.
 * @param {string} blogId - The blog document ID
 * @returns {Promise<void>}
 */
export async function deleteBlogPost(blogId) {
  const blogRef = doc(db, "blogs", blogId);
  await deleteDoc(blogRef);
}

/**
 * Fetches blogs with optional date range and pagination.
 * @param {Object} options { startDate, endDate, limit, startAfterDoc }
 * @returns {Promise<{blogs: Array, lastDoc: any}>}
 */
export async function getBlogsFiltered({
  startDate,
  endDate,
  limit = 6,
  startAfterDoc = null,
} = {}) {
  let qRef = collection(db, "blogs");
  let constraints = [];
  if (startDate) constraints.push(where("createdAt", ">=", startDate));
  if (endDate) constraints.push(where("createdAt", "<=", endDate));
  if (constraints.length) qRef = query(qRef, ...constraints);
  if (startAfterDoc)
    qRef = query(
      qRef,
      orderBy("createdAt", "desc"),
      startAfter(startAfterDoc),
      qLimit(limit)
    );
  else qRef = query(qRef, orderBy("createdAt", "desc"), qLimit(limit));
  const snap = await getDocs(qRef);
  return {
    blogs: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
  };
}
