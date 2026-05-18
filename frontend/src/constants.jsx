import { LightningIcon, FileTextIcon, GitDiffIcon, ImageSquareIcon, ClockCounterClockwiseIcon, HouseLineIcon, CalculatorIcon } from '@phosphor-icons/react';

export const LANGUAGES = [
  { value: 'original', label: '🌐 Orijinal dil' },
  { value: 'Turkish', label: '🇹🇷 Türkçe' },
  { value: 'English', label: '🇬🇧 İngilizce' },
  { value: 'German', label: '🇩🇪 Almanca' },
  { value: 'French', label: '🇫🇷 Fransızca' },
  { value: 'Spanish', label: '🇪🇸 İspanyolca' },
  { value: 'Italian', label: '🇮🇹 İtalyanca' },
  { value: 'Portuguese', label: '🇵🇹 Portekizce' },
  { value: 'Russian', label: '🇷🇺 Rusça' },
  { value: 'Japanese', label: '🇯🇵 Japonca' },
  { value: 'Chinese', label: '🇨🇳 Çince' },
  { value: 'Arabic', label: '🇸🇦 Arapça' },
];

export const CALC_SCENARIOS = [
  { label: '💬 Basit sohbet', input: 500, output: 300 },
  { label: '📝 İçerik üretimi', input: 200, output: 1000 },
  { label: '💻 Kod asistanı', input: 1000, output: 500 },
  { label: '📊 Veri analizi', input: 2000, output: 1000 },
  { label: '🔍 Prompt optimize', input: 100, output: 50 },
];

export const MODEL_PRICES = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPer1k: 0.005, outputPer1k: 0.015, color: '#10a37f' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPer1k: 0.00015, outputPer1k: 0.0006, color: '#10a37f' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPer1k: 0.003, outputPer1k: 0.015, color: '#d97706' },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputPer1k: 0.001, outputPer1k: 0.005, color: '#d97706' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', inputPer1k: 0.00015, outputPer1k: 0.0006, color: '#4285f4' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta (Groq)', inputPer1k: 0.00059, outputPer1k: 0.00079, color: '#0064e0' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', inputPer1k: 0.00125, outputPer1k: 0.005, color: '#4285f4' },
];

export const TASK_TYPES = [
  { value: 'genel', label: 'Genel' },
  { value: 'kod', label: 'Kod Yazma' },
  { value: 'analiz', label: 'Analiz' },
  { value: 'chatbot', label: 'Chatbot' },
  { value: 'ozet', label: 'Özetleme' },
  { value: 'karmasik', label: 'Karmaşık Görev' },
];

export const TEMPLATES = [
  { id: 1, label: 'E-posta yaz', prompt: 'Profesyonel bir iş e-postası yaz. Konu: [KONU]. Alıcı: [ALICI]. İçerik: [İÇERİK].' },
  { id: 2, label: 'Kod açıkla', prompt: 'Aşağıdaki kodu satır satır açıkla ve ne işe yaradığını anlat: [KOD]' },
  { id: 3, label: 'Makale özetle', prompt: 'Aşağıdaki makaleyi 3 madde halinde özetle, ana fikirleri çıkar: [METİN]' },
  { id: 4, label: 'Hata ayıkla', prompt: 'Bu kodda neden hata alıyorum? Hatayı bul ve düzelt: [KOD] Hata mesajı: [HATA]' },
  { id: 5, label: 'Sosyal medya', prompt: 'Bu içerik için Twitter/X için ilgi çekici bir post yaz, hashtag ekle: [İÇERİK]' },
  { id: 6, label: 'Çeviri', prompt: 'Aşağıdaki metni Türkçeye çevir, doğal bir dil kullan: [METİN]' },
  { id: 7, label: 'Kod optimize et', prompt: "Aşağıdaki kodu optimize et. Kurallar: yorum satırlarını kaldır, gereksiz console.log'ları sil, tekrar eden kod bloklarını birleştir, okunabilirliği artır. Değişken ve fonksiyon isimlerine kesinlikle dokunma. Sadece optimize edilmiş kodu döndür, açıklama yapma: [KOD]" },
  { id: 8, label: 'Prompt yaz', prompt: 'Şu amaç için etkili bir AI promptu yaz, kısa ve net olsun: [AMAÇ]' },
  { id: 9, label: 'Test yaz', prompt: "Aşağıdaki fonksiyon için unit test yaz, edge case'leri de kapsa: [KOD]" },
];

export const btn = {
  primary: 'cursor-pointer bg-orange-500 hover:bg-orange-400 text-white font-medium rounded-xl transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
  secondary: 'cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 rounded-lg transition-all duration-150 transform hover:scale-[1.03] active:scale-[0.97]',
};

export const TABS = [
  { id: 'dashboard', icon: <HouseLineIcon size={18} weight="regular" />, label: 'Dashboard' },
  { id: 'optimize', icon: <LightningIcon size={18} weight="regular" />, label: 'Prompt Optimize' },
  { id: 'summarize', icon: <FileTextIcon size={18} weight="regular" />, label: 'Chat Özetle' },
  { id: 'calculator', icon: <CalculatorIcon size={18} weight="regular" />, label: 'Token Hesaplayıcı' },
  { id: 'compare', icon: <GitDiffIcon size={18} weight="regular" />, label: 'Model Karşılaştır' },
  { id: 'vision', icon: <ImageSquareIcon size={18} weight="regular" />, label: 'Görsel Analiz' },
  { id: 'history', icon: <ClockCounterClockwiseIcon size={18} weight="regular" />, label: 'Geçmiş' },
];

export const TAB_DESCRIPTIONS = {
  dashboard: null,
  optimize: 'Gereksiz kelimeleri kaldırarak token tasarrufu edin',
  summarize: 'Uzun konuşmaları kısa özete dönüştürün',
  calculator: 'Model maliyetlerini karşılaştır ve hesaplayın',
  compare: 'Modelleri ve yaklaşımları karşılaştırın',
  vision: 'Görselinizi yükleyin, metni okutun ve optimize edin',
  history: 'Önceki optimizasyonlarınızı inceleyin',
};

export const TAB_HEADERS = {
  optimize: { title: 'Prompt Optimize', subtitle: 'Gereksiz kelimeleri kaldırarak token tasarrufu edin' },
  summarize: { title: 'Chat Özetle', subtitle: 'Uzun konuşmaları kısa özete dönüştürün' },
  calculator: { title: 'Token Hesaplayıcı', subtitle: 'Farklı modeller için tahmini maliyet hesaplayın' },
  compare: { title: 'Karşılaştır', subtitle: 'Model ve yaklaşımları karşılaştırın' },
  vision: { title: 'Görsel Analiz', subtitle: 'Görselinizi yükleyin, metni okutun ve optimize edin' },
  history: { title: 'Geçmiş', subtitle: 'Önceki optimizasyonlarınızı inceleyin' },
};

export const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};
