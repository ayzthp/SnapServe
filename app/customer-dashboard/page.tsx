'use client'

import { useState, useEffect } from 'react';
import { ref, push, set, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ServiceRequest } from '@/lib/firebase';
import ImageUpload from '@/components/ImageUpload';
import ImageZoomModal from '@/components/ImageZoomModal';

export default function CustomerDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [wage, setWage] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/signin');
      return;
    }

    const requestsRef = ref(db, 'service_requests');
    const userRequestsQuery = query(requestsRef, orderByChild('customer_id'), equalTo(user.uid));
    
    const unsubscribe = onValue(userRequestsQuery, (snapshot) => {
      const requestsData = snapshot.val();
      const requestsList = requestsData
        ? Object.entries(requestsData).map(([id, data]) => ({ id, ...data as ServiceRequest }))
        : [];
      setRequests(requestsList);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        const newRequestRef = push(ref(db, 'service_requests'));
        const newRequest: ServiceRequest = {
          id: newRequestRef.key!,
          customer_id: user.uid,
          provider_id: null,
          description,
          location,
          wage: parseFloat(wage),
          contactNumber,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          imageUrl,
          latitude: latitude || undefined,
          longitude: longitude || undefined,
        };
        await set(newRequestRef, newRequest);

        setDescription('');
        setLocation('');
        setWage('');
        setContactNumber('');
        setImageUrl('');
        setLatitude(null);
        setLongitude(null);
      } catch (error) {
        console.error('Error creating service request:', error);
      }
    }
  };

  const handleMarkCompleted = async (requestId: string) => {
    try {
      const requestRef = ref(db, `service_requests/${requestId}`);
      await update(requestRef, {
        status: 'completed',
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error marking request as completed:', error);
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleLocationCapture = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const pendingRequests = requests.filter(request => request.status === 'pending');
  const acceptedRequests = requests.filter(request => request.status === 'accepted');
  const completedRequests = requests.filter(request => request.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Customer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Service Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="wage" className="block text-gray-700 text-sm font-bold mb-2">
                Wage
              </label>
              <input
                id="wage"
                type="number"
                value={wage}
                onChange={(e) => setWage(e.target.value)}
                placeholder="Wage"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-gray-700 text-sm font-bold mb-2">
                Contact Number
              </label>
              <input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Contact Number"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <ImageUpload onImageUpload={handleImageUpload} onLocationCapture={handleLocationCapture} />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Request
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Requests</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Pending Requests</h3>
              <ul className="space-y-4">
                {pendingRequests.map((request) => (
                  <li key={request.id} className="border p-4 rounded-lg shadow">
                    <p className="font-bold text-lg mb-2">{request.description}</p>
                    <p><strong>Location:</strong> {request.location}</p>
                    <p><strong>Wage:</strong> ${request.wage}</p>
                    <p><strong>Contact Number:</strong> {request.contactNumber}</p>
                    <p><strong>Status:</strong> <span className="capitalize text-yellow-600">{request.status}</span></p>
                    {request.latitude && request.longitude && (
                      <p><strong>Coordinates:</strong> {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</p>
                    )}
                    {request.imageUrl && (
                      <img
                        src={request.imageUrl || "/placeholder.svg"}
                        alt="Request"
                        className="mt-2 max-w-full h-auto rounded cursor-pointer transition-transform hover:scale-105"
                        onClick={() => setZoomedImage(request.imageUrl)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Accepted Requests</h3>
              <ul className="space-y-4">
                {acceptedRequests.map((request) => (
                  <li key={request.id} className="border p-4 rounded-lg shadow">
                    <p className="font-bold text-lg mb-2">{request.description}</p>
                    <p><strong>Location:</strong> {request.location}</p>
                    <p><strong>Wage:</strong> ${request.wage}</p>
                    <p><strong>Contact Number:</strong> {request.contactNumber}</p>
                    <p><strong>Status:</strong> <span className="capitalize text-blue-600">{request.status}</span></p>
                    {request.latitude && request.longitude && (
                      <p><strong>Coordinates:</strong> {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</p>
                    )}
                    {request.imageUrl && (
                      <img
                        src={request.imageUrl || "/placeholder.svg"}
                        alt="Request"
                        className="mt-2 max-w-full h-auto rounded cursor-pointer transition-transform hover:scale-105"
                        onClick={() => setZoomedImage(request.imageUrl)}
                      />
                    )}
                    <button
                      onClick={() => handleMarkCompleted(request.id)}
                      className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Mark as Completed
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Completed Requests</h3>
              <ul className="space-y-4">
                {completedRequests.map((request) => (
                  <li key={request.id} className="border p-4 rounded-lg shadow">
                    <p className="font-bold text-lg mb-2">{request.description}</p>
                    <p><strong>Location:</strong> {request.location}</p>
                    <p><strong>Wage:</strong> ${request.wage}</p>
                    <p><strong>Contact Number:</strong> {request.contactNumber}</p>
                    <p><strong>Status:</strong> <span className="capitalize text-green-600">{request.status}</span></p>
                    <p><strong>Service Provider:</strong> {request.provider_id}</p>
                    {request.latitude && request.longitude && (
                      <p><strong>Coordinates:</strong> {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</p>
                    )}
                    {request.imageUrl && (
                      <img
                        src={request.imageUrl || "/placeholder.svg"}
                        alt="Request"
                        className="mt-2 max-w-full h-auto rounded cursor-pointer transition-transform hover:scale-105"
                        onClick={() => setZoomedImage(request.imageUrl)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {zoomedImage && (
        <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
}

