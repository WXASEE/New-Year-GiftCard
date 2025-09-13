import React, { useState, useEffect } from 'react';
import type { Category } from './types';
import { CATEGORIES } from './constants';
import ImageGenerator from './components/ImageGenerator';
import ImageResult from './components/ImageResult';
import LoadingIndicator from './components/LoadingIndicator';
import { generateProductImages } from './services/geminiService';
import { useLocalization } from './contexts/LocalizationContext';

// Define liff type for window object to satisfy TypeScript
declare global {
  interface Window {
    liff: any;
  }
}

const App: React.FC = () => {
  // The app now focuses on a single category, so we start directly at the generator.
  const [currentStep, setCurrentStep] = useState<string>('generator'); // generator, loading, result
  const [selectedCategory] = useState<Category>(CATEGORIES[0]); // Always use the first (and only) category
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [lastGenerationData, setLastGenerationData] = useState<Record<string, string | File> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLiffInitializing, setIsLiffInitializing] = useState<boolean>(true);
  const { t, setLocale, locale } = useLocalization();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('app_title');
  }, [locale, t]);

  useEffect(() => {
    const initializeLiff = async () => {
      // Hardcode the correct "Published" LIFF ID to match the Vercel deployment URL.
      const liffId = '2008103176-8bkB21qA';
      
      try {
        await window.liff.init({ liffId });
      } catch (e: any) {
        console.error('LIFF initialization failed', e);
        setLiffError(`LIFF initialization failed: ${e.message}. Please check that your LIFF ID is correct and that you are running the app inside LINE.`);
      } finally {
        setIsLiffInitializing(false);
      }
    };

    if (window.liff) {
      initializeLiff();
    } else {
      setLiffError("LIFF SDK not found. Make sure the script is loaded.");
      setIsLiffInitializing(false);
    }
  }, []);

  const handleGenerate = async (formData: Record<string, string | File>) => {
    setCurrentStep('loading');
    setGeneratedImages([]);
    setError(null);
    setLastGenerationData(formData);

    try {
      const images = await generateProductImages(selectedCategory, formData);
      setGeneratedImages(images);
      setCurrentStep('result');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`${t('error_generation_failed')} ${errorMessage}`);
      setCurrentStep('generator');
    }
  };

  const handleStartOver = () => {
    setCurrentStep('generator');
    setGeneratedImages([]);
    setLastGenerationData(null);
    setError(null);
  };
  
  const handleBackToGenerator = () => {
    setCurrentStep('generator');
    setGeneratedImages([]);
    setError(null);
  };

  const handleGenerateAgain = () => {
    if (lastGenerationData) {
      handleGenerate(lastGenerationData);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'generator':
        return (
            <ImageGenerator
              category={selectedCategory}
              onGenerate={handleGenerate}
              error={error}
              initialData={lastGenerationData}
            />
          );
      case 'loading':
        return <LoadingIndicator />;
      case 'result':
        return <ImageResult images={generatedImages} onBack={handleBackToGenerator} onGenerateAgain={handleGenerateAgain} onGoHome={handleStartOver} />;
      default:
        // Default to the generator as it's the main screen
        return (
            <ImageGenerator
              category={selectedCategory}
              onGenerate={handleGenerate}
              error={error}
              initialData={lastGenerationData}
            />
          );
    }
  };
  
  const LanguageSwitcher = () => (
    <div className="absolute top-4 right-4 z-10 flex space-x-2">
      {(['en', 'ko', 'ja'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
            locale === lang
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  if (isLiffInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-semibold">Connecting to LINE...</p>
      </div>
    );
  }

  if (liffError) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-red-500 bg-red-100 p-4 rounded-lg max-w-md text-center">
                <h1 className="font-bold text-lg">Application Error</h1>
                <p>{liffError}</p>
                <p className="mt-2 text-sm">Please make sure you are running this app inside the LINE app and have a valid LIFF ID configured.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 relative">
       <LanguageSwitcher />
      <main className="w-full max-w-2xl flex justify-center flex-grow pt-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;