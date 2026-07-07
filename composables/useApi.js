export const useApi = () => {
  const config = useRuntimeConfig();
  const BASE = config.public.apiBase || "http://localhost:3002/api";

  const getToken = () => {
    if (process.client) return localStorage.getItem("valeur_token");
    return null;
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  });

  function handleTokenExpired() {
    if (!process.client) return;
    localStorage.removeItem("valeur_token");
    localStorage.removeItem("valeur_user");
    localStorage.removeItem("valeur_expires_at");
    window.dispatchEvent(new CustomEvent("token-expired"));
  }

  async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: authHeaders(),
      ...options,
    });
    const data = await res.json();

    // ถ้า 401 (token หมดอายุ / ถูก revoke) → ล้าง token และ redirect ไป login
    if (res.status === 401 && process.client) {
      handleTokenExpired();
      return;
    }

    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  }

  async function handleResponse(res) {
    const data = await res.json();
    if (res.status === 401 && process.client) {
      handleTokenExpired();
      return;
    }
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  }

  // ── AUTH ─────────────────────────────────────────────────────
  const auth = {
    async login(email, password) {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (process.client && data.data?.token) {
        localStorage.setItem("valeur_token", data.data.token);
        localStorage.setItem("valeur_user", JSON.stringify(data.data.user));
        // เก็บเวลาหมดอายุ
        localStorage.setItem("valeur_expires_at", data.data.expiresAt);
      }
      return data;
    },
    async logout() {
      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } finally {
        if (process.client) {
          localStorage.removeItem("valeur_token");
          localStorage.removeItem("valeur_user");
          localStorage.removeItem("valeur_expires_at");
        }
      }
    },
    isLoggedIn() {
      if (!process.client) return false;
      const token = localStorage.getItem("valeur_token");
      if (!token) return false;
      // เช็ค expiry
      const expiresAt = localStorage.getItem("valeur_expires_at");
      if (expiresAt && Date.now() > Number(expiresAt)) {
        // token หมดอายุ — ล้างออก
        localStorage.removeItem("valeur_token");
        localStorage.removeItem("valeur_user");
        localStorage.removeItem("valeur_expires_at");
        return false;
      }
      return true;
    },
    async me() {
      return apiFetch("/auth/me");
    },
    getUser() {
      if (!process.client) return null;
      const u = localStorage.getItem("valeur_user");
      return u ? JSON.parse(u) : null;
    },
  };

  // ── POSTS ─────────────────────────────────────────────────────
  const posts = {
    list(section, params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch(`/${section}/posts${q ? `?${q}` : ""}`);
    },
    get(section, id) {
      return apiFetch(`/${section}/posts/${id}`);
    },
    getBySlug(section, slug) {
      return apiFetch(`/${section}/posts/slug/${slug}`);
    },
    search(keyword) {
      return apiFetch(`/posts/search?q=${encodeURIComponent(keyword)}`);
    },
    suggest(keyword) {
      return apiFetch(`/posts/suggest?q=${encodeURIComponent(keyword)}`);
    },
    create(section, payload) {
      return apiFetch(`/${section}/posts`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(section, id, payload) {
      return apiFetch(`/${section}/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    delete(section, id) {
      return apiFetch(`/${section}/posts/${id}`, { method: "DELETE" });
    },
    bulkDelete(section, ids) {
      return apiFetch(`/${section}/posts/bulk`, {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    bulkStatus(section, ids, status) {
      return apiFetch(`/${section}/posts/bulk-status`, {
        method: "PATCH",
        body: JSON.stringify({ ids, status }),
      });
    },
    move(section, id, direction) {
      return apiFetch(`/${section}/posts/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify({ direction }),
      });
    },
    changeSection(section, id, newSection) {
      return apiFetch(`/${section}/posts/${id}/move-section`, {
        method: "PATCH",
        body: JSON.stringify({ newSection }),
      });
    },
    combined(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch(`/posts/combined${q ? `?${q}` : ""}`);
    },
    // อัปโหลดรูปแยก — คืน URL string กลับมา
    async uploadImage(section, file) {
      const form = new FormData();
      form.append("img", file);
      const res = await fetch(`${BASE}/${section}/posts/upload-image`, {
        method: "POST",
        headers: {
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: form,
      });
      const data = await handleResponse(res);
      return data.url; // "/uploads/posts/xxx.jpg"
    },
  };

  // ── BANNERS ───────────────────────────────────────────────────
  const banners = {
    list(section) {
      return apiFetch(`/${section}/banners`);
    },
    async upload(section, file) {
      const form = new FormData();
      form.append("banner", file);
      const res = await fetch(`${BASE}/${section}/banners`, {
        method: "POST",
        headers: {
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: form,
      });
      return handleResponse(res);
    },
    setActive(section, id) {
      return apiFetch(`/${section}/banners/${id}/set-active`, {
        method: "PATCH",
      });
    },
    delete(section, id) {
      return apiFetch(`/${section}/banners/${id}`, { method: "DELETE" });
    },
  };

  // ── DASHBOARD ─────────────────────────────────────────────────
  const dashboard = {
    list(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch(`/dashboard/items${q ? `?${q}` : ""}`);
    },
    get(id) {
      return apiFetch(`/dashboard/items/${id}`);
    },
    create(payload) {
      return apiFetch("/dashboard/items", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return apiFetch(`/dashboard/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    delete(id) {
      return apiFetch(`/dashboard/items/${id}`, { method: "DELETE" });
    },
    reorder(ids) {
      return apiFetch("/dashboard/items/reorder", {
        method: "PATCH",
        body: JSON.stringify({ ids }),
      });
    },
    async uploadImage(file) {
      // ใช้ endpoint เดียวกับ posts (section ใดก็ได้ เพราะ path เดียวกัน)
      const form = new FormData();
      form.append("img", file);
      const res = await fetch(`${BASE}/hotels/posts/upload-image`, {
        method: "POST",
        headers: {
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: form,
      });
      const data = await handleResponse(res);
      return data.url;
    },
    overview() {
      return apiFetch("/dashboard/overview");
    },
  };

  // ── CONTACT ─────────────────────────────────────────────────
  const contact = {
    async get() {
      const res = await fetch(`${BASE}/contact`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    async update(payload) {
      // apiFetch might be returning the parsed data directly
      const data = await apiFetch(`/contact`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if data exists and has the success property
      if (!data || !data.success) {
        throw new Error(data?.message || "An error occurred");
      }

      return data;
    },
  };

  // ── ADS ──────────────────────────────────────────────────────
  const ads = {
    list(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch(`/ads${q ? `?${q}` : ""}`);
    },
    async create({ file, img, link = "", status = "active" }) {
      const form = new FormData();
      if (file) form.append("img", file);
      if (img) form.append("img", img);
      form.append("link", link);
      form.append("status", status);
      const res = await fetch(`${BASE}/ads`, {
        method: "POST",
        headers: {
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: form,
      });
      return handleResponse(res);
    },
    async update(id, { file, link, status, img } = {}) {
      const form = new FormData();
      if (file)
        form.append("img", file); // อัปโหลดรูปใหม่
      else if (img !== undefined) form.append("img", img); // ส่ง URL string หรือ "" เพื่อเคลียร์
      if (link !== undefined) form.append("link", link);
      if (status !== undefined) form.append("status", status);
      const res = await fetch(`${BASE}/ads/${id}`, {
        method: "PUT",
        headers: {
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: form,
      });
      return handleResponse(res);
    },
    delete(id) {
      return apiFetch(`/ads/${id}`, { method: "DELETE" });
    },
    trackAds(id) {
      return apiFetch(`/ads/${id}/click`, { method: "POST" });
    },
  };

  // ── TRACK ──────────────────────────────────────────────────────
  const track = {
    pageView() {
      return apiFetch("/dashboard/pageview", { method: "POST" });
    },
    contentView(section, id) {
      return apiFetch(`/${section}/posts/${id}/view`, { method: "POST" });
    },
  };

  return { auth, posts, banners, dashboard, contact, ads, track };
};
