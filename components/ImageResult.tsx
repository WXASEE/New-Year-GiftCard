import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';

interface ImageResultProps {
  images: string[];
  onBack: () => void;
  onGenerateAgain: () => void;
  onGoHome: () => void;
}

// Access liff from the global window object
declare global {
  interface Window {
    liff: any;
  }
}

const ImageResult: React.FC<ImageResultProps> = ({ images, onBack, onGenerateAgain, onGoHome }) => {
  const { t } = useLocalization();

  const handleDownload = (imageUrl: string, index: number) => {
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = imageUrl;
      a.download = `product_photo_${index + 1}.jpeg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed:", e);
      alert(t('alert_download_failed'));
    }
  };

  const handleShare = async () => {
    // This is a simplified share function for demonstration.
    // To share the actual image, you first need to upload the base64 data
    // to a server to get a public URL. This URL can then be used in the
    // `liff.sendMessages` or `liff.shareTargetPicker` payload to send an image message.
    if (!window.liff || !window.liff.isInClient()) {
        alert(t('alert_share_unavailable'));
        return;
    }

    try {
        const message = {
            type: 'text' as const,
            text: t('text_share_message'),
        };

        if (window.liff.isApiAvailable('shareTargetPicker')) {
            await window.liff.shareTargetPicker([message]);
        } else {
            // Fallback for older LINE versions
            await window.liff.sendMessages([message]);
        }
    } catch (error) {
        console.error('LIFF share failed:', error);
        alert(`Error sharing: ${error}`);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('result_title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {images.map((image, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
            <img src={image} alt={`${t('result_image_alt_prefix')} ${index + 1}`} className="w-full h-auto object-cover aspect-square" />
             <div className="grid grid-cols-2 mt-auto">
                <button
                    onClick={() => handleDownload(image, index)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-2.5 px-2 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <span>{t('button_download')}</span>
                </button>
                <button
                    onClick={handleShare}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-center py-2.5 px-2 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1.5"
                    style={{backgroundColor: '#06C755'}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    <span>{t('button_share_line')}</span>
                </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
         <button
          onClick={onGoHome}
          className="w-full sm:w-auto bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
        >
          {t('button_back_to_home')}
        </button>
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          {t('button_edit_options')}
        </button>
        <button
          onClick={onGenerateAgain}
          className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          {t('button_regenerate')}
        </button>
      </div>
    </div>
  );
};

export default ImageResult;