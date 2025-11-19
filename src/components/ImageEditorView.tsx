
import React, { useState, useRef } from 'react';
import { generateEditedImage } from '../services/geminiService';
import { PhotoIcon, DownloadIcon, MagicWandIcon } from './Icons';

const CLOTHING_OPTIONS = [
  { label: 'بدون تغيير', value: '' },
  { label: 'بدلة رسمية (أسود)', value: 'wear a formal black suit, elegant style' },
  { label: 'بدلة رسمية (أزرق داكن)', value: 'wear a formal navy blue suit, modern fit' },
  { label: 'بدلة رسمية (رمادي)', value: 'wear a formal grey suit, professional look' },
  { label: 'ملابس كلاسيكية', value: 'wear classic vintage clothing, timeless style' },
  { label: 'ملابس رياضية', value: 'wear athletic sportswear, gym style' },
  { label: 'ملابس فاخرة', value: 'wear luxurious high-fashion clothing, expensive look' },
  { label: 'ماركة عالمية', value: 'wear trendy branded fashion streetwear' },
];

export const ImageEditorView: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Options State
  const [keepFace, setKeepFace] = useState(true);
  const [makeOlder, setMakeOlder] = useState(false);
  const [clothing, setClothing] = useState('');
  const [cropFace, setCropFace] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setGeneratedImage(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !imagePreview) return;

    setIsLoading(true);
    setGeneratedImage(null);

    // Construct Prompt
    let promptParts = [];
    
    if (keepFace) {
      promptParts.push("IMPORTANT: Maintain the exact facial identity, features, and structure of the person in the original image. Do not change their identity.");
    }

    if (makeOlder) {
      promptParts.push("Transform the person to look significantly older (elderly), adding realistic wrinkles and signs of aging while keeping the same facial identity.");
    }

    if (clothing) {
      promptParts.push(clothing);
    }

    if (cropFace) {
      promptParts.push("Crop the image to a professional close-up portrait (head and shoulders only). Focus strictly on the face with high details, sharp focus, 8k resolution, professional photography lighting.");
    }

    if (customPrompt.trim()) {
      promptParts.push(customPrompt);
    }

    // Final assembly
    const finalPrompt = promptParts.join('. ') + ". Ensure high quality, photorealistic result.";
    
    try {
      // Remove data:image/png;base64, prefix
      const base64Data = imagePreview.split(',')[1];
      const mimeType = selectedImage.type;

      const resultBase64 = await generateEditedImage(finalPrompt, base64Data, mimeType);
      
      if (resultBase64) {
        setGeneratedImage(`data:image/png;base64,${resultBase64}`);
      } else {
        alert('فشل في توليد الصورة. حاول مرة أخرى.');
      }
    } catch (error) {
      alert('حدث خطأ أثناء المعالجة.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-y-auto p-3 font-sans">
      <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-4 text-center flex items-center justify-center gap-2">
        <MagicWandIcon className="w-5 h-5 text-purple-400" />
        تعديل الصور AI
      </h2>

      <div className="flex-1 space-y-4 max-w-md mx-auto w-full pb-20">
        
        {/* Image Upload Section */}
        <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 shadow-lg">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-colors h-48 relative overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
            ) : (
              <>
                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-400 text-xs">اضغط لاختيار صورة</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Options Section - Only visible if image selected */}
        {imagePreview && !generatedImage && (
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-cyan-400 text-xs font-bold mb-2 border-b border-gray-700 pb-1">خيارات التعديل</h3>
            
            {/* Toggles */}
            <div className="grid grid-cols-1 gap-3">
               <label className="flex items-center space-x-2 space-x-reverse cursor-pointer bg-gray-700/50 p-2 rounded-lg hover:bg-gray-700 transition">
                <input type="checkbox" checked={keepFace} onChange={(e) => setKeepFace(e.target.checked)} className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800" />
                <span className="text-xs text-gray-200">الحفاظ على ملامح الوجه الأصلية</span>
              </label>

              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer bg-gray-700/50 p-2 rounded-lg hover:bg-gray-700 transition">
                <input type="checkbox" checked={makeOlder} onChange={(e) => setMakeOlder(e.target.checked)} className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800" />
                <span className="text-xs text-gray-200">تحويل الوجه إلى كبير في السن (شائب)</span>
              </label>

              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer bg-gray-700/50 p-2 rounded-lg hover:bg-gray-700 transition">
                <input type="checkbox" checked={cropFace} onChange={(e) => setCropFace(e.target.checked)} className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800" />
                <div className="flex flex-col">
                   <span className="text-xs text-gray-200">تركيز وتقريب (قص احترافي للوجه والكتف)</span>
                   <span className="text-[9px] text-gray-400">دقة عالية، تفاصيل حادة 8K</span>
                </div>
              </label>
            </div>

            {/* Clothing Select */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">تغيير الملابس:</label>
              <select 
                value={clothing} 
                onChange={(e) => setClothing(e.target.value)} 
                className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-xs rounded-lg p-2 focus:ring-cyan-500 focus:border-cyan-500 block"
              >
                {CLOTHING_OPTIONS.map(opt => (
                  <option key={opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Custom Prompt */}
            <div>
               <label className="block text-xs text-gray-400 mb-1">وصف إضافي (اختياري):</label>
               <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="اكتب تعديلات إضافية هنا..."
                  className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-xs rounded-lg p-2 h-16 focus:ring-cyan-500 focus:border-cyan-500"
               />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <MagicWandIcon className="w-4 h-4" />
                  تطبيق التعديلات
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Section */}
        {generatedImage && (
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg animate-in zoom-in duration-300">
            <h3 className="text-green-400 text-xs font-bold mb-2 text-center">تم التعديل بنجاح!</h3>
            <img src={generatedImage} alt="Generated" className="w-full rounded-lg shadow-md mb-4" />
            
            <div className="flex gap-2">
               <a 
                href={generatedImage} 
                download={`edited-image-${Date.now()}.png`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <DownloadIcon className="w-4 h-4" />
                تحميل بجودة عالية
              </a>
              <button 
                 onClick={() => setGeneratedImage(null)}
                 className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
              >
                تعديل جديد
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
