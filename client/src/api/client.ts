const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = async (url:any, options = {}, retry = true) => {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Handle 401 (token expired)
    if (response.status === 401 && retry) {
      const refresh = localStorage.getItem("refresh_token");

      if (refresh) {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newAccess = data.access;

          localStorage.setItem("access_token", newAccess);

          // retry original request with new token
          return api(url, options, false);
        } else {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
      }
    }

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { status: response.status, data: errorData };
    }

    return response.json();
  } catch (error) {
    return Promise.reject(error);
  }
};

export default api
