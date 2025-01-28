'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ServiceRequest } from '@/lib/firebase';
import ImageZoomModal from '@/components/ImageZoomModal';

export default function ServiceProviderDashboard() {
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<ServiceRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/signin');
      return;
    }

    const availableRequestsRef = ref(db, 'service_requests');
    const availableRequestsQuery = query(availableRequestsRef, orderByChild('status'), equalTo('pending'));

    const unsubscribeAvailable = onValue(availableRequestsQuery, (snapshot) => {
      const requestsData = snapshot.val();
      const requestsList = requestsData
        ? Object.entries(requestsData).map(([id, data]) => ({ id, ...data as ServiceRequest }))
        : [];
      setAvailableRequests(requestsList);
    });

    const providerRequestsRef = ref(db, 'service_requests');
    const providerRequestsQuery = query(
      providerRequestsRef,
      orderByChild('provider_id'),
      equalTo(user.uid)
    );

    const unsubscribeProvider = onValue(providerRequestsQuery, (snapshot) => {
      const requestsData = snapshot.val();
      const requestsList = requestsData
        ? Object.entries(requestsData).map(([id, data]) => ({ id, ...data as ServiceRequest }))
        : [];
      setAcceptedRequests(requestsList.filter((request) => request.status === 'accepted'));
      setCompletedRequests(requestsList.filter((request) => request.status === 'completed'));
    });

    return () => {
      unsubscribeAvailable();
      unsubscribeProvider();
    };
  }, [router]);

  const handleAccept = async (requestId: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const requestRef = ref(db, `service_requests/${requestId}`);
        await update(requestRef, {
          provider_id: user.uid,
          status: 'accepted',
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error accepting request:', error);
      }
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Service Provider Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Requests</h2>
          <ul className="space-y-4">
            {availableRequests.map((request) => (
              <li key={request.id} className="border p-4 rounded-lg shadow">
                <p className="font-bold text-lg mb-2">{request.description}</p>
                <p><strong>Location:</strong> {request.location}</p>
                <p><strong>Wage:</strong> ${request.wage}</p>
                <p><strong>Contact Number:</strong> {request.contactNumber}</p>
                {request.latitude && request.longitude && (
                  <p>
                    <strong>Coordinates:</strong>{' '}
                    <a
                      href="#"
                      onClick={() => openGoogleMaps(request.latitude!, request.longitude!)}
                      className="text-blue-500 hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </p>
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
                  onClick={() => handleAccept(request.id)}
                  className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Accept Request
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Accepted Requests</h2>
          <ul className="space-y-4">
            {acceptedRequests.map((request) => (
              <li key={request.id} className="border p-4 rounded-lg shadow">
                <p className="font-bold text-lg mb-2">{request.description}</p>
                <p><strong>Location:</strong> {request.location}</p>
                <p><strong>Wage:</strong> ${request.wage}</p>
                <p><strong>Contact Number:</strong> {request.contactNumber}</p>
                {request.latitude && request.longitude && (
                  <p>
                    <strong>Coordinates:</strong>{' '}
                    <a
                      href="#"
                      onClick={() => openGoogleMaps(request.latitude!, request.longitude!)}
                      className="text-blue-500 hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </p>
                )}
                {request.imageUrl && (
                  <img
                    src={request.imageUrl || "/placeholder.svg"}
                    alt="Request"
                    className="mt-2 max-w-full h-auto rounded cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setZoomedImage(request.imageUrl)}
                  />
                )}
                <p><strong>Status:</strong> <span className="capitalize text-blue-600">{request.status}</span></p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Completed Requests</h2>
          <ul className="space-y-4">
            {completedRequests.map((request) => (
              <li key={request.id} className="border p-4 rounded-lg shadow">
                <p className="font-bold text-lg mb-2">{request.description}</p>
                <p><strong>Location:</strong> {request.location}</p>
                <p><strong>Wage:</strong> ${request.wage}</p>
                <p><strong>Contact Number:</strong> {request.contactNumber}</p>
                {request.latitude && request.longitude && (
                  <p>
                    <strong>Coordinates:</strong>{' '}
                    <a
                      href="#"
                      onClick={() => openGoogleMaps(request.latitude!, request.longitude!)}
                      className="text-blue-500 hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </p>
                )}
                {request.imageUrl && (
                  <img
                    src={request.imageUrl || "/placeholder.svg"}
                    alt="Request"
                    className="mt-2 max-w-full h-auto rounded cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setZoomedImage(request.imageUrl)}
                  />
                )}
                <p><strong>Status:</strong> <span className="text-green-600 capitalize">{request.status}</span></p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {zoomedImage && (
        <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
}

