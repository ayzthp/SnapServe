import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase, ref, get, set, increment, push, update } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getDatabase(app)
const storage = getStorage(app)

export type ServiceRequest = {
  id: string
  customer_id: string
  provider_id: string | null
  description: string
  location: string
  wage: number
  contactNumber: string
  status: "pending" | "accepted" | "completed"
  createdAt: number
  updatedAt: number
  imageUrl?: string
  latitude?: number | null
  longitude?: number | null
}

export type ChatMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: number
  read: boolean
}

export type UnreadCounts = {
  [requestId: string]: number
}

export type Review = {
  id: string
  customer_id: string
  provider_id: string
  request_id: string
  rating: number
  comment: string
  createdAt: number
}

export type ProviderProfile = {
  id: string
  name: string
  email: string
  skills: string
  averageRating: number
  totalReviews: number
}

export type NotInterestedRequests = {
  [requestId: string]: boolean
}

export { app, auth, db, storage }

export const updateUnreadCount = async (requestId: string, senderId: string, receiverId: string) => {
  const unreadCountRef = ref(db, `unreadCounts/${receiverId}/${requestId}`)
  await set(unreadCountRef, increment(1))
}

export const resetUnreadCount = async (userId: string, requestId: string) => {
  const unreadCountRef = ref(db, `unreadCounts/${userId}/${requestId}`)
  await set(unreadCountRef, 0)
}

export const getUnreadCounts = async (userId: string): Promise<UnreadCounts> => {
  const unreadCountsRef = ref(db, `unreadCounts/${userId}`)
  const snapshot = await get(unreadCountsRef)
  return snapshot.val() || {}
}

export const addReview = async (review: Omit<Review, "id">) => {
  const reviewRef = push(ref(db, "reviews"))
  const newReview = { ...review, id: reviewRef.key! }
  await set(reviewRef, newReview)

  // Update provider's average rating and total reviews
  const providerRef = ref(db, `users/${review.provider_id}`)
  const providerSnapshot = await get(providerRef)
  const providerData = providerSnapshot.val()

  const newTotalReviews = (providerData.totalReviews || 0) + 1
  const newAverageRating = ((providerData.averageRating || 0) * (newTotalReviews - 1) + review.rating) / newTotalReviews

  await set(providerRef, {
    ...providerData,
    averageRating: newAverageRating,
    totalReviews: newTotalReviews,
  })
}

export const getProviderProfile = async (providerId: string): Promise<ProviderProfile | null> => {
  const providerRef = ref(db, `users/${providerId}`)
  const snapshot = await get(providerRef)
  return snapshot.val()
}

export const getProviderReviews = async (providerId: string): Promise<Review[]> => {
  const reviewsRef = ref(db, "reviews")
  const snapshot = await get(reviewsRef)
  const allReviews = snapshot.val()
  return Object.values(allReviews).filter((review: Review) => review.provider_id === providerId)
}

export const handleAccept = async (requestId: string) => {
  const user = auth.currentUser
  if (user) {
    try {
      const requestRef = ref(db, `service_requests/${requestId}`)
      await update(requestRef, {
        provider_id: user.uid,
        status: "accepted",
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }
}

export const markRequestAsNotInterested = async (requestId: string, providerId: string) => {
  const user = auth.currentUser
  if (user) {
    try {
      // Add the request to the provider's not interested requests
      const notInterestedRef = ref(db, `providers/${providerId}/notInterestedRequests/${requestId}`)
      await set(notInterestedRef, true)

      // Update the service request status only if the current provider is assigned to it
      const requestRef = ref(db, `service_requests/${requestId}`)
      const requestSnapshot = await get(requestRef)
      const requestData = requestSnapshot.val()

      if (requestData && requestData.provider_id === providerId) {
        await update(requestRef, {
          status: "pending",
          provider_id: null,
          updatedAt: Date.now(),
        })
      }
    } catch (error) {
      console.error("Error marking request as not interested:", error)
    }
  }
}

export const getNotInterestedRequests = async (providerId: string): Promise<{ [key: string]: boolean }> => {
  const notInterestedRef = ref(db, `providers/${providerId}/notInterestedRequests`)
  const snapshot = await get(notInterestedRef)
  return snapshot.val() || {}
}

