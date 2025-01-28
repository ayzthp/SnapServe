import React from 'react';

interface ImageZoomModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative">
        <button
          className="absolute top-4 right-4 text-white text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <img 
          src={imageUrl || "/placeholder.svg"} 
          alt="Zoomed Image" 
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageZoomModal;

