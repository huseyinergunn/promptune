const BASE_URL = 'https://promptune-api.onrender.com/api';

const authHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const authHeadersFormData = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function register(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Giriş başarısız');
  return data;
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Kullanıcı alınamadı');
  return data;
}

export async function optimizePrompt(prompt, targetLang = 'original') {
  const res = await fetch(`${BASE_URL}/optimize`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ prompt, targetLang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export async function compareModels(tokenCount, taskType) {
  const res = await fetch(`${BASE_URL}/models/compare`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ tokenCount, taskType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${BASE_URL}/vision`, {
    method: 'POST',
    headers: authHeadersFormData(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export async function compareOptimizations(prompt) {
  const res = await fetch(`${BASE_URL}/optimize/compare`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export async function getHistory() {
  const res = await fetch(`${BASE_URL}/history`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export async function deleteHistory() {
  const res = await fetch(`${BASE_URL}/history`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

export async function summarizeChat(messages) {
  const res = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}
