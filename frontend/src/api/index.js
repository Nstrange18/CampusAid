const API_URL = "http://localhost:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("campusaid_token");
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is not FormData, serialize it to JSON
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    let errorDetail = "An error occurred";
    try {
      const data = await response.json();
      errorDetail = data.detail || errorDetail;
    } catch (e) {
      // Response is not JSON
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  
  // OAuth2 login using form data
  login: async (email, password) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      let errorDetail = "Incorrect email or password";
      try {
        const data = await response.json();
        errorDetail = data.detail || errorDetail;
      } catch (e) {}
      throw new Error(errorDetail);
    }
    return response.json();
  },
  
  // Generic upload handler (multipart/form-data)
  uploadFile: async (path, file, extraData = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(extraData).forEach(([key, val]) => {
      formData.append(key, val);
    });
    
    return request(path, {
      method: "POST",
      body: formData,
    });
  }
};
export default api;
export { API_URL };
