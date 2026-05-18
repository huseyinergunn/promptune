import { useState, useRef } from 'react';
import { TrayArrowUpIcon, ImageSquareIcon } from '@phosphor-icons/react';
import { analyzeImage } from '../../services/api';
import { TAB_HEADERS, btn } from '../../constants.jsx';
import EmptyState from '../EmptyState.jsx';

export default function Vision({ showToast }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visionResult, setVisionResult] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState(null);
  const [visionCopied, setVisionCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setVisionResult(null);
    setVisionError(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVisionAnalyze = async () => {
    if (!imageFile) return;
    setVisionLoading(true);
    setVisionError(null);
    setVisionResult(null);
    try {
      const data = await analyzeImage(imageFile);
      setVisionResult(data);
      showToast('Görsel başarıyla analiz edildi!', 'success');
    } catch (err) {
      setVisionError(err.message);
      showToast(err.message, 'error');
    } finally {
      setVisionLoading(false);
    }
  };

  const handleVisionCopy = () => {
    navigator.clipboard.writeText(visionResult.optimized.prompt);
    setVisionCopied(true);
    setTimeout(() => setVisionCopied(false), 2000);
    showToast('Kopyalandı! 📋', 'info');
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{TAB_HEADERS.vision.title}</h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">{TAB_HEADERS.vision.subtitle}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

      {!imagePreview ? (
        <button
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
              setVisionResult(null);
              setVisionError(null);
            }
          }}
          className={`cursor-pointer w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center transition-all ${
            isDragging ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-orange-400 dark:hover:border-orange-500/50'
          }`}
        >
          <TrayArrowUpIcon size={40} weight="regular" className={`mb-3 ${isDragging ? 'text-orange-500' : 'text-stone-400'}`} />
          <span className={`text-sm font-medium ${isDragging ? 'text-orange-600' : 'text-stone-500'}`}>
            {isDragging ? 'Bırakın...' : 'Görsel yükleyin'}
          </span>
          <span className="text-stone-400 text-xs mt-1">PNG, JPG, WEBP — max 5MB</span>
        </button>
      ) : (
        <div
          className="w-full border-2 border-dashed border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-2xl p-6 flex flex-col items-center hover:border-orange-400 dark:hover:border-orange-500/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          <img src={imagePreview} alt="Preview" className="max-h-48 object-contain rounded-xl mb-3" />
          <span className="text-stone-400 text-xs">{imageFile.name}</span>
        </div>
      )}

      <button
        onClick={handleVisionAnalyze}
        disabled={visionLoading || !imageFile}
        className={`mt-4 w-full text-sm px-4 py-3 ${btn.primary}`}
      >
        {visionLoading ? 'Analiz ediliyor...' : 'Analiz Et'}
      </button>

      {visionError && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-red-600 text-sm">{visionError}</p>
        </div>
      )}

      {!visionResult && !imageFile && !visionLoading && (
        <EmptyState
          icon={<ImageSquareIcon size={40} weight="regular" />}
          title="Görsel yükleyin veya sürükleyin"
          description="PNG, JPG, WEBP desteklenir — max 5MB"
        />
      )}

      {visionResult && (
        <div className="mt-6">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 mb-3 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 dark:text-zinc-600 font-medium tracking-widest">OKUNAN METİN</p>
              <span className="text-xs text-stone-500 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                {visionResult.originalTokenCount} token
              </span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">{visionResult.extractedText}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 shadow-sm dark:shadow-none">
              <p className="text-xs text-stone-400 dark:text-zinc-600 font-medium tracking-widest">ORİJİNAL</p>
              <div className="mt-2">
                <span className="text-3xl font-bold text-stone-900">{visionResult.originalTokenCount}</span>
                <span className="text-stone-400 dark:text-zinc-600 text-sm ml-1">token</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl p-5 shadow-sm dark:shadow-none">
              <p className="text-xs text-stone-400 dark:text-zinc-600 font-medium tracking-widest">OPTİMİZE</p>
              <div className="mt-2">
                <span className="text-3xl font-bold text-orange-500">{visionResult.optimized.tokenCount}</span>
                <span className="text-stone-400 dark:text-zinc-600 text-sm ml-1">token</span>
              </div>
              <div className="border-t border-stone-100 dark:border-zinc-800 mt-3 pt-3">
                <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">{visionResult.optimized.prompt}</p>
                <button
                  onClick={handleVisionCopy}
                  className={`cursor-pointer mt-3 text-xs px-3 py-1.5 border transition-all duration-150 transform hover:scale-[1.03] active:scale-[0.97] rounded-lg ${
                    visionCopied
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:bg-stone-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {visionCopied ? 'Kopyalandı!' : 'Kopyala'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-stone-600 dark:text-zinc-400">
              <span className="text-2xl font-bold text-orange-600">%{visionResult.savings.percentage}</span>
              {' '}tasarruf
            </span>
            <span className="text-sm text-stone-600 dark:text-zinc-400">
              <span className="font-semibold text-stone-900 dark:text-white">{visionResult.savings.tokens}</span> token kazanıldı
            </span>
          </div>
        </div>
      )}
    </>
  );
}
