'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sliders,
  Sparkles,
  FileImage,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  // Compression options
  const [maxSizeMB, setMaxSizeMB] = useState<number>(1);
  const [quality, setQuality] = useState<number>(0.8);
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // File size formatter
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompress = useCallback(
    async (targetFile: File) => {
      setIsCompressing(true);
      try {
        const options = {
          maxSizeMB: maxSizeMB,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
          initialQuality: quality,
          fileType: fileType,
        };

        const outputBlob = await imageCompression(targetFile, options);
        const outputFilename = `compressed-${targetFile.name.replace(/\.[^/.]+$/, '')}.${fileType.split('/')[1]}`;
        const outputConvertedFile = new File([outputBlob], outputFilename, {
          type: fileType,
        });

        setCompressedFile(outputConvertedFile);

        if (compressedUrl) {
          URL.revokeObjectURL(compressedUrl);
        }
        setCompressedUrl(URL.createObjectURL(outputConvertedFile));
      } catch (error) {
        console.error('Error compressing image:', error);
      } finally {
        setIsCompressing(false);
      }
    },
    [maxSizeMB, quality, fileType, compressedUrl]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        setOriginalUrl(URL.createObjectURL(selectedFile));
        handleCompress(selectedFile);
      }
    },
    [handleCompress, originalUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp', '.heic'],
    },
    multiple: false,
  });

  // Re-compress when options change
  useEffect(() => {
    if (file) {
      const timer = setTimeout(() => {
        handleCompress(file);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [maxSizeMB, quality, fileType]);

  const resetAll = () => {
    setFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setOriginalUrl(null);
    setCompressedFile(null);
    setCompressedUrl(null);
  };

  // Calculate savings
  const savedPercent =
    file && compressedFile
      ? Math.max(0, Math.round(((file.size - compressedFile.size) / file.size) * 100))
      : 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Header Title */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Fast & Lossless Image Compression
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Image <span className="text-blue-600">Compressor</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-base">
          Reduce JPG, PNG, and WEBP file size without losing visible quality. Processed entirely in your browser.
        </p>
      </div>

      {!file ? (
        /* Upload Area */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 bg-white/70 backdrop-blur-xs ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : 'border-gray-300 hover:border-blue-400 hover:shadow-lg'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xs">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {isDragActive ? 'Drop your image here...' : 'Drag & drop an image here'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Supports PNG, JPG, WEBP and BMP (up to 50MB)
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer">
            Select File from Device
          </button>
        </div>
      ) : (
        /* Main Processing Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Sidebar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-900 text-lg">Compression Options</h2>
              </div>
              <button
                onClick={resetAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Quality Slider */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-2 text-gray-700">
                <span>Quality Level</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Max Compression</span>
                <span>Best Quality</span>
              </div>
            </div>

            {/* Target Format */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'JPG', value: 'image/jpeg' },
                  { label: 'PNG', value: 'image/png' },
                  { label: 'WEBP', value: 'image/webp' },
                ].map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setFileType(fmt.value)}
                    className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                      fileType === fmt.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Size Cap */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-2 text-gray-700">
                <span>Target Size Cap</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                  {maxSizeMB} MB
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={maxSizeMB}
                onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Savings Banner */}
            {compressedFile && !isCompressing && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-extrabold text-xl mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{savedPercent}% Reduction</span>
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  {formatBytes(file.size)} ➔ {formatBytes(compressedFile.size)}
                </p>
              </div>
            )}

            {/* Download Button */}
            {compressedUrl && (
              <a
                href={compressedUrl}
                download={compressedFile?.name || 'compressed-image'}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
              >
                <Download className="w-5 h-5" /> Download Compressed Image
              </a>
            )}

          </div>

          {/* Side by Side Preview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-blue-600" /> Image Preview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
              
              {/* Original */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative border border-gray-200/80 mb-3 shadow-inner">
                  {originalUrl && (
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  )}
                  <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    Original
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              {/* Compressed */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative border border-gray-200/80 mb-3 shadow-inner">
                  {isCompressing ? (
                    <div className="flex flex-col items-center text-blue-600 gap-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-semibold text-gray-500">Compressing...</span>
                    </div>
                  ) : compressedUrl ? (
                    <img
                      src={compressedUrl}
                      alt="Compressed"
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                  
                  {!isCompressing && (
                    <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      Compressed
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">
                    {compressedFile?.name || fileType.split('/')[1]}
                  </p>
                  <p className="text-sm font-bold text-blue-600">
                    {compressedFile ? formatBytes(compressedFile.size) : 'Processing...'}
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
              <span>Client-side WebWorker processing</span>
              <button
                onClick={resetAll}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Upload another image
              </button>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
