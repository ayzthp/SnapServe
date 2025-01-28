import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Welcome to Service Request App
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Post your service requests or find jobs as a service provider.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/signup" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sign Up
          </Link>
          <Link href="/signin" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

