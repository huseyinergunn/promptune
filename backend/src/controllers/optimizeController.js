const crypto = require('crypto');
const Groq = require('groq-sdk');
const Cache = require('../models/Cache');
const History = require('../models/History');

let _groq;
const getGroq = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

const countTokens = (text) => Math.ceil(text.length / 4);

const SYSTEM_PROMPT =
  'You are a prompt compression expert. Your ONLY job is to rewrite the given prompt using fewer words while keeping the exact same meaning and intent.\n\n' +
  'STRICT RULES:\n' +
  '- Output ONLY the compressed prompt. Nothing else.\n' +
  '- Do NOT answer the prompt. Do NOT explain. Do NOT add information.\n' +
  '- Do NOT write what the prompt is about.\n' +
  '- Remove filler words: "please", "can you", "could you", "I want you to", "lütfen", "bana", "verir misin", "rica etsem"\n' +
  '- Keep the same language as the input\n' +
  '- Keep questions as questions\n' +
  '- Keep commands as commands\n' +
  '- CRITICAL: Keep ALL specific instructions, numbers, formats and constraints. Example: "20 madde" must stay "20 madde", "bullet points" must stay "bullet points"\n' +
  '- CRITICAL: Never remove quantifiers like "20", "10 tane", "3 paragraf", "liste halinde" etc.\n' +
  '- Target 20-50% token reduction by removing ONLY filler words\n' +
  '- If the prompt is already minimal, return it as-is\n\n' +
  'Example:\n' +
  'Input: "Bana lütfen Javascript ile Typescript arasındaki farkları 20 madde olacak şekilde yazar mısın?"\n' +
  'Output: "Javascript ile Typescript farkları 20 madde"\n\n' +
  'Input: "Can you please explain machine learning in simple terms with 5 examples?"\n' +
  'Output: "Explain machine learning simply with 5 examples"\n\n' +
  'Now compress this prompt:';

const analyzePrompt = async (req, res) => {
  const { prompt, targetLang } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt gerekli' });
  }

  if (prompt.trim().length > 4000) {
    return res.status(400).json({
      error: 'Prompt çok uzun. Maksimum 4000 karakter girebilirsiniz.',
      maxLength: 4000,
      currentLength: prompt.trim().length,
    });
  }

  try {
    const promptHash = crypto
      .createHash('sha256')
      .update(prompt.trim().toLowerCase())
      .digest('hex');

    const cached = await Cache.findOne({ promptHash });

    if (cached) {
      return res.json({
        cached: true,
        original: { prompt: cached.originalPrompt, tokenCount: cached.originalTokenCount },
        optimized: { prompt: cached.optimizedPrompt, tokenCount: cached.optimizedTokenCount },
        savings: { tokens: cached.savedTokens, percentage: cached.percentage },
      });
    }

    const validationCompletion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: 'Is the following text a meaningful prompt that could be sent to an AI assistant? Answer with ONLY "yes" or "no":\n\n' + prompt,
        },
      ],
      temperature: 0,
      max_tokens: 5,
    });

    const isValid = validationCompletion.choices[0].message.content.trim().toLowerCase().startsWith('yes');

    if (!isValid) {
      return res.status(400).json({
        error: 'Bu metin optimize edilebilir bir prompt değil. Lütfen bir AI asistanına göndereceğiniz anlamlı bir prompt girin.',
      });
    }

    const originalTokenCount = countTokens(prompt);

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: SYSTEM_PROMPT + '\n\n' + prompt },
      ],
      temperature: 0.1,
      max_tokens: 512,
    });

    const optimizedPrompt = completion.choices[0].message.content.trim();

    let finalOptimized = optimizedPrompt;
    let finalTokenCount = countTokens(optimizedPrompt);

    if (targetLang && targetLang !== 'original') {
      const translateCompletion = await getGroq().chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Translate the following text to ${targetLang}. Output ONLY the translated text, nothing else:\n\n${optimizedPrompt}`,
        }],
        temperature: 0.1,
        max_tokens: 512,
      });
      finalOptimized = translateCompletion.choices[0].message.content.trim();
      finalTokenCount = countTokens(finalOptimized);
    }

    const optimizedTokenCount = countTokens(optimizedPrompt);
    const savedTokens = originalTokenCount - optimizedTokenCount;
    const percentage = parseFloat(((savedTokens / originalTokenCount) * 100).toFixed(2));

    await Cache.create({
      promptHash,
      originalPrompt: prompt,
      originalTokenCount,
      optimizedPrompt,
      optimizedTokenCount,
      savedTokens,
      percentage,
    });

    if (req.user && !req.isGuest) {
      await History.create({
        userId: req.user._id,
        originalPrompt: prompt,
        optimizedPrompt,
        originalTokenCount,
        optimizedTokenCount,
        savedTokens,
        percentage,
      });
    }

    res.json({
      cached: false,
      original: { prompt, tokenCount: originalTokenCount },
      optimized: { prompt: finalOptimized, tokenCount: finalTokenCount },
      savings: { tokens: savedTokens, percentage },
    });
  } catch (err) {
    res.status(500).json({ error: 'Optimizasyon başarısız', details: err.message });
  }
};

const compareOptimize = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt gerekli' });
  }

  if (prompt.trim().length > 4000) {
    return res.status(400).json({ error: 'Prompt çok uzun.' });
  }

  try {
    const approaches = [
      {
        id: 'aggressive',
        name: 'Agresif',
        desc: 'Maksimum token tasarrufu',
        instruction: 'Compress this prompt to absolute minimum tokens while keeping the core meaning. Be very aggressive - remove everything non-essential. Output ONLY the compressed prompt:',
      },
      {
        id: 'balanced',
        name: 'Dengeli',
        desc: 'Anlam ve kısalık dengesi',
        instruction: 'Optimize this prompt by removing unnecessary words while keeping all important context and meaning. Output ONLY the optimized prompt:',
      },
      {
        id: 'minimal',
        name: 'Minimal',
        desc: 'Hafif düzenleme',
        instruction: 'Lightly edit this prompt by removing only filler words like "please", "could you", "lütfen", "rica etsem". Keep everything else intact. Output ONLY the edited prompt:',
      },
    ];

    const results = await Promise.all(
      approaches.map(async (approach) => {
        const completion = await getGroq().chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: `${approach.instruction}\n\n${prompt}`,
          }],
          temperature: 0.1,
          max_tokens: 512,
        });

        const optimized = completion.choices[0].message.content.trim();
        const originalTokens = countTokens(prompt);
        const optimizedTokens = countTokens(optimized);
        const savedTokens = originalTokens - optimizedTokens;
        const percentage = parseFloat(((savedTokens / originalTokens) * 100).toFixed(2));

        return {
          ...approach,
          originalPrompt: prompt,
          optimizedPrompt: optimized,
          originalTokens,
          optimizedTokens,
          savedTokens,
          percentage,
        };
      })
    );

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Karşılaştırma başarısız', details: err.message });
  }
};

module.exports = { analyzePrompt, compareOptimize };
