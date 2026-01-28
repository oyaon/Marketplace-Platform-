const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("⚠️  NEXT_PUBLIC_API_URL is not defined!");
  console.warn("⚠️  Frontend will fail to connect to backend in production.");
  console.warn("⚠️  Please set NEXT_PUBLIC_API_URL in Vercel environment variables.");
  console.warn("⚠️  Current value: 'http://localhost:5000' (development only)");
}

// For production, API_URL must be set. Fallback to localhost only for development.
const getApiUrl = () => {
  if (!API_URL) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_API_URL must be set in production environment');
    }
    return "http://localhost:5000";
  }
  // Remove trailing slash if present
  return API_URL.replace(/\/$/, '');
};

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${getApiUrl()}${endpoint}`;
  
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API Error: ${res.status} ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error: ${endpoint}`, error);
    throw error;
  }
}

