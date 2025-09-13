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
      a.download = `new_year_card_${index + 1}.jpeg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed:", e);
      alert(t('alert_download_failed'));
    }
  };

  const handleShare = async (imageUrl: string) => {
    // To share the actual image via LIFF, it must be available at a public HTTPS URL.
    // The current `imageUrl` is a base64 string, which cannot be sent directly.
    // A backend is required to receive this base64 data, upload it to cloud storage,
    // and return a public URL that can be used in the `shareTargetPicker`.
    alert(t('alert_image_share_info'));

    if (!window.liff || !window.liff.isInClient()) {
        alert(t('alert_share_unavailable'));
        return;
    }

    try {
      // As a fallback, we will share a text message.
      const message = {
        type: 'text' as const,
        text: t('text_share_message'),
      };

      // --- FUTURE BACKEND INTEGRATION ---
      // Once you have a backend endpoint to upload the image:
      // 1. Send the base64 `imageUrl` to your backend.
      // 2. Get a public HTTPS URL back.
      // 3. Use the image message format below.
      /*
      const publicImageUrl = 'URL_FROM_YOUR_BACKEND';
      const imageMessage = {
          type: 'image' as const,
          originalContentUrl: publicImageUrl,
          previewImageUrl: publicImageUrl,
      };
      await window.liff.shareTargetPicker([imageMessage]);
      */
      
      if (window.liff.isApiAvailable('shareTargetPicker')) {
        await window.liff.shareTargetPicker([message]);
      } else {
        // Fallback for older LINE versions
        await window.liff.sendMessages([message]);
      }
    } catch (error: any) {
        console.error('LIFF share failed:', error);
        alert(`${t('alert_share_error')} ${error.message}`);
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
                    onClick={() => handleShare(image)}
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
          {t('button_new_card')}
        </button>
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          {t('button_edit_card')}
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