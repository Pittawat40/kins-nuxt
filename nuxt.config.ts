// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/sitemap"],

  site: {
    url: "https://www.kinsofficialth.com",
    name: "KIN'S | Travel & Lifestyle",
  },

  sitemap: {
    exclude: ["/dashboard", "/dashboard/**"],
    urls: async () => {
      const apiBase =
        process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3002/api";

      try {
        const response = await fetch(`${apiBase}/posts`);
        const resData = await response.json();

        const slugify = (text) => {
          return text
            ? text
                .toLowerCase()
                .trim()
                .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
            : "";
        };

        let posts = [];
        if (Array.isArray(resData)) {
          posts = resData;
        } else if (resData && Array.isArray(resData.data)) {
          posts = resData.data;
        }

        return posts.map((post) => ({
          loc: `/detail/${slugify(post.title)}`,
          changefreq: "weekly",
          priority: 0.7,
        }));
      } catch (error) {
        console.error("Failed to fetch posts for sitemap:", error);
        return [];
      }
    },
  },

  // Static Site Generation
  ssr: true,

  // SSG — generates static HTML for every page
  nitro: {
    preset: "static",
  },

  // 🛠️ เพิ่มตรงนี้: เพื่อสั่งข้ามการทำ Pre-render หน้า Dashboard ไม่ให้การ Build พัง
  routeRules: {
    "/dashboard": { prerender: false },
    "/dashboard/**": { prerender: false },
  },

  // CSS — Bootstrap + custom styles
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "bootstrap-icons/font/bootstrap-icons.css",
    "~/assets/css/main.css",
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3002/api",
    },
  },

  router: {
    options: {
      encodePaths: false,
    },
  },

  // Auto-import components
  components: true,

  // App head meta
  app: {
    head: {
      title: "KIN'S | Travel & Lifestyle",
      htmlAttrs: {
        lang: "th", // บอก Google ว่านี่คือเว็บภาษาไทย
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "KIN'S | Travel & Lifestyle",
        },
        {
          name: "keywords",
          content: "KIN'S, kins, kinsofficialth, Travel Lifestyle, รีวิวที่พัก",
        },
        { property: "og:title", content: "KIN'S | Travel & Lifestyle" },
        {
          property: "og:description",
          content: "KIN'S | Travel & Lifestyle",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://www.kinsofficialth.com" },
      ],
      link: [
        { rel: "canonical", href: "https://www.kinsofficialth.com" },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-tab.png",
          sizes: "48x48",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/favicon-google.png",
        },
        { rel: "apple-touch-icon", href: "/favicon-tab.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/@fontsource/libertinus-serif/index.css",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500&display=swap",
        },
      ],
      script: [
        // Bootstrap JS bundle (popper included)
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
          defer: true,
        },
      ],
    },
  },
});
