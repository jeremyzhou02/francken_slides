import axios from "axios";

const authHeaders = (token) => ({ token });

export async function fetchSlide(baseUrl, token, id) {
  const response = await axios.get(`${baseUrl}/api/slides/${id}`, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function createSlide(baseUrl, token, payload) {
  const response = await axios.post(`${baseUrl}/api/slides`, payload, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function updateSlide(baseUrl, token, id, payload) {
  const response = await axios.put(`${baseUrl}/api/slides/${id}`, payload, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function uploadImage(baseUrl, token, selectedFile) {
  const imageData = new FormData();
  imageData.append("image", selectedFile);

  const response = await axios.post(`${baseUrl}/api/uploads`, imageData, {
    headers: authHeaders(token),
  });

  return response.data.url;
}

export async function replaceImage(baseUrl, token, filename, selectedFile) {
  const imageData = new FormData();
  imageData.append("image", selectedFile);

  const response = await axios.put(
    `${baseUrl}/api/uploads/${encodeURIComponent(filename)}`,
    imageData,
    { headers: authHeaders(token) },
  );

  return response.data.url;
}

export async function fetchQuotePreview(baseUrl, token, googleSheetUrl) {
  const response = await axios.post(
    `${baseUrl}/api/slides/quote-preview`,
    { googleSheetUrl },
    { headers: authHeaders(token) },
  );

  return response.data.items || [];
}

export async function fetchAgendaPreview(baseUrl, token, calendarId) {
  const response = await axios.post(
    `${baseUrl}/api/slides/agenda-preview`,
    { calendarId },
    { headers: authHeaders(token) },
  );

  return response.data.items || [];
}
