'use client';

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper, { ReactCropperElement } from 'react-cropper';
import {
  UploadCloud,
  Download,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Crop as CropIcon,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

export default function CropPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  // Crop Controls
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [scaleX, setScaleX] = useState<number>(1);
  const [scaleY, setScaleY] = useState<number>(1);
  const [exportFormat, setExportFormat] = useState<string>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.9);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCroppedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp'],
    },
    multiple: false,
  });

  // Action Handlers
  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        setCroppedImage(canvas.toDataURL(exportFormat, exportQuality));
      }
    }
  };

  const handleRotateLeft = () => {
    cropperRef.current?.cropper.rotate(-90);
  };

  const handleRotateRight = () => {
    cropperRef.current?.cropper.rotate(90);
  };

  const handleFlipHorizontal = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const newScale = scaleX === 1 ? -1 : 1;
      cropper.scaleX(newScale);
      setScaleX(newScale);
    }
  };

  const handleFlipVertical = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const newScale = scaleY === 1 ? -1 : 1;
      cropper.scaleY(newScale);
      setScaleY(newScale);
    }
  };

  const changeAspectRatio = (value: number | undefined) => {
    setAspectRatio(value);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(value ?? NaN);
    }
  };

  const handleReset = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
      cropper.setAspectRatio(NaN);
    }
    setScaleX(1);
    setScaleY(1);
    setAspectRatio(undefined);
  };

  const resetAll = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setScaleX(1);
    setScaleY(1);
    setAspectRatio(undefined);
  };

  const aspectPresets = [
    { label: 'Free', value: undefined },
    { label: '1:1 Square', value: 1 },
    { label: '16:9 Cover', value: 16 / 9 },
    { label: '4:3 Standard', value: 4 / 3 },
    { label: '9:16 Story', value: 9 / 16 },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Page Title */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/80 text-purple-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Precise Aspect Ratio & Image Cropping
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Image <span className="text-purple-600">Cropper</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-base">
          Crop, rotate, and flip your photos with preset aspect ratios for social media and web.
        </p>
      </div>

      {!imageSrc ? (
        /* Upload Area */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 bg-white/70 backdrop-blur-xs ${
            isDragActive
              ? 'border-purple-500 bg-purple-50/50 scale-[1.01]'
              : 'border-gray-300 hover:border-purple-400 hover:shadow-lg'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xs">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {isDragActive ? 'Drop your image here...' : 'Drag & drop an image to crop'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Supports PNG, JPG, WEBP and BMP
          </p>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer">
            Select File from Device
          </button>
        </div>
      ) : (
        /* Workspace Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Sidebar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-gray-900 text-lg">Crop Tools</h2>
              </div>
              <button
                onClick={resetAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Change Image
              </button>
            </div>

            {/* Aspect Ratios */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => changeAspectRatio(preset.value)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      aspectRatio === preset.value
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transformations */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Transformations
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleRotateLeft}
                  title="Rotate Left 90°"
                  className="p-2.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotateRight}
                  title="Rotate Right 90°"
                  className="p-2.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFlipHorizontal}
                  title="Flip Horizontally"
                  className="p-2.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFlipVertical}
                  title="Flip Vertically"
                  className="p-2.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'PNG', value: 'image/png' },
                  { label: 'JPG', value: 'image/jpeg' },
                  { label: 'WEBP', value: 'image/webp' },
                ].map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setExportFormat(fmt.value)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      exportFormat === fmt.value
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCrop}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition-all duration-200 cursor-pointer"
              >
                <CropIcon className="w-5 h-5" /> Crop Selection
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer text-center"
              >
                Reset Crop Area
              </button>
            </div>

          </div>

          {/* Canvas & Preview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cropper Canvas */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
              <div className="h-[420px] w-full rounded-2xl overflow-hidden bg-gray-900">
                <Cropper
                  ref={cropperRef}
                  src={imageSrc}
                  style={{ height: '100%', width: '100%' }}
                  initialAspectRatio={undefined}
                  aspectRatio={aspectRatio ?? NaN}
                  guides={true}
                  viewMode={1}
                  minCropBoxWidth={20}
                  minCropBoxHeight={20}
                  background={false}
                  responsive={true}
                  autoCropArea={0.8}
                  checkOrientation={false}
                />
              </div>
            </div>

            {/* Cropped Output Preview */}
            {croppedImage && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                    <img
                      src={croppedImage}
                      alt="Cropped Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cropped Successfully
                    </span>
                    <p className="text-xs text-gray-400">Ready to download to your device.</p>
                  </div>
                </div>

                <a
                  href={croppedImage}
                  download={`cropped-image.${exportFormat.split('/')[1]}`}
                  className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download Cropped Image
                </a>
              </div>
            )}

          </div>

        </div>
      )}

    </main>
  );
}
