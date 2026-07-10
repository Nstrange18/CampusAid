const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://campusaid-backend-bey9.onrender.com"
);

const ACCESS_TOKEN_KEY = "campusaid_token";
const REFRESH_TOKEN_KEY = "campusaid_refresh_token";

const clearStoredTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const storeTokenPair = (tokens) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    throw new Error("Session expired. Please log in again.");
  }

  const tokens = await response.json();
  storeTokenPair(tokens);
  return tokens.access_token;
};

async function request(path, options = {}) {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
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

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body,
    });
  } catch (err) {
    throw new Error("Backend unavailable. Please check the server URL, CORS settings, or your network connection.");
  }

  if (response.status === 401 && !options.skipAuthRefresh) {
    try {
      const newToken = await refreshAccessToken();
      try {
        response = await fetch(`${API_URL}${path}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
          body,
        });
      } catch (err) {
        throw new Error("Backend unavailable. Please check the server URL, CORS settings, or your network connection.");
      }
    } catch (err) {
      throw err;
    }
  }

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
    
    let response;
    try {
      response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      throw new Error("Backend unavailable. Please check the server URL, CORS settings, or your network connection.");
    }
    
    if (!response.ok) {
      let errorDetail = "Incorrect email or password";
      try {
        const data = await response.json();
        errorDetail = data.detail || errorDetail;
      } catch (e) {}
      throw new Error(errorDetail);
    }
    const tokens = await response.json();
    storeTokenPair(tokens);
    return tokens;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    clearStoredTokens();
    if (!refreshToken) return;

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (e) {
      // Local logout should still succeed even if the network request fails.
    }
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
  },

  // Admin invite token helpers
  validateInviteToken: (token) => request(`/auth/validate-invite/${token}`, { method: "GET" }),
  registerViaInvite: (data) => request("/auth/register/admin-invite", { method: "POST", body: data }),
  generateInviteLink: () => request("/admin/invite-links", { method: "POST" }),
  getInviteLinks: () => request("/admin/invite-links", { method: "GET" }),
  revokeInviteLink: (tokenId) => request(`/admin/invite-links/${tokenId}/revoke`, { method: "PUT" }),
  suspendUser: (userId, reason) => request(`/admin/users/${userId}/suspend`, { method: "PUT", body: { reason } }),
  reactivateUser: (userId, reason) => request(`/admin/users/${userId}/reactivate`, { method: "PUT", body: { reason } }),
  promoteSuperAdmin: (userId) => request(`/admin/users/${userId}/promote-superadmin`, { method: "PUT" }),
  demoteSuperAdmin: (userId) => request(`/admin/users/${userId}/demote-superadmin`, { method: "PUT" }),
  deleteUser: (userId) => request(`/admin/users/${userId}`, { method: "DELETE" }),
  getActivityLogs: () => request("/admin/activity-logs", { method: "GET" }),
  cleanupRefreshTokens: () => request("/admin/refresh-tokens/cleanup", { method: "POST" }),
};
export default api;
export { API_URL };
