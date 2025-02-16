import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, Upload, Image as ImageIcon, Moon, Sun, Share2 } from 'lucide-react';

type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp';

interface ConversionResult {
  url: string;
  format: ImageFormat;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedImage, setConvertedImage] = useState<ConversionResult | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/png');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setConvertedImage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const convertImage = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    try {
      const image = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = URL.createObjectURL(selectedFile);
      });

      canvas.width = image.width;
      canvas.height = image.height;
      ctx?.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, targetFormat);
      });

      setConvertedImage({
        url: URL.createObjectURL(blob),
        format: targetFormat
      });
    } catch (error) {
      console.error('Error converting image:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Image Converter
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun className="text-white" /> : <Moon className="text-gray-900" />}
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}
              ${isDarkMode ? 'text-white' : 'text-gray-600'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-4 w-12 h-12" />
            <p className="text-lg mb-2">Drag & drop your image here</p>
            <p className="text-sm opacity-75">or click to select a file</p>
          </div>

          {/* Controls */}
          {selectedFile && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WEBP</option>
                  <option value="image/gif">GIF</option>
                  <option value="image/bmp">BMP</option>
                </select>

                <button
                  onClick={convertImage}
                  disabled={isConverting}
                  className={`px-6 py-2 rounded-lg bg-blue-600 text-white flex items-center space-x-2
                    ${isConverting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isConverting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      <span>Convert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {convertedImage && (
            <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Converted Image
                </h3>
                <div className="flex space-x-2">
                  <a
                    href={convertedImage.url}
                    download={`converted.${targetFormat.split('/')[1]}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.share({
                        title: 'Converted Image',
                        text: 'Check out my converted image!',
                        url: convertedImage.url
                      }).catch(console.error);
                    }}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <Share2 className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
                  </button>
                </div>
              </div>
              <img
                src={convertedImage.url}
                alt="Converted"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'What is the best format for web images?',
                  a: 'For web images, WebP is often the best choice as it provides excellent compression while maintaining quality. PNG is best for images with transparency, while JPEG is suitable for photographs.'
                },
                {
                  q: 'Is there a file size limit?',
                  a: 'The converter handles images up to 10MB in size. For larger files, consider compressing them first.'
                },
                {
                  q: 'Will I lose quality during conversion?',
                  a: 'When converting between lossless formats (like PNG), no quality is lost. Converting to lossy formats (like JPEG) may result in some quality reduction.'
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow-sm`}
                >
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {faq.q}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;