const Groq = require('groq-sdk');

let _groq;
const getGroq = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

const countTokens = (text) => Math.ceil(text.length / 4);

const summarizeChat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Mesajlar gerekli' });
  }

  if (messages.length < 4) {
    return res.status(400).json({ error: 'Özetlemek için en az 4 mesaj gerekli' });
  }

  try {
    const formatted = messages
      .map((m) => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.content}`)
      .join('\n');

    const summaryPrompt =
      'Aşağıdaki konuşmayı 2-3 cümleyle özetle. Türkçe yaz. Sadece özeti yaz, başka bir şey yazma:\n\n' +
      formatted;

    const originalTokenCount = countTokens(summaryPrompt);

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: summaryPrompt }],
      temperature: 0.3,
      max_tokens: 512,
    });

    const summary = completion.choices[0].message.content.trim();
    const summaryTokenCount = countTokens(summary);

    const savedTokens = originalTokenCount - summaryTokenCount;
    const percentage = parseFloat(((savedTokens / originalTokenCount) * 100).toFixed(2));

    res.json({
      summary,
      originalMessages: messages.length,
      originalTokenCount,
      summaryTokenCount,
      savings: { tokens: savedTokens, percentage },
    });
  } catch (err) {
    res.status(500).json({ error: 'Özetleme başarısız', details: err.message });
  }
};

module.exports = { summarizeChat };
