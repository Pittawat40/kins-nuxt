// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Static Site Generation
  ssr: true,

  // SSG — generates static HTML for every page
  nitro: {
    preset: "vercel-static",
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

  // Auto-import components
  components: true,

  // App head meta
  app: {
    head: {
      title: "KIN'S",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Travel & Lifestyle",
        },
        { property: "og:title", content: "KIN'S" },
        {
          property: "og:description",
          content: "Travel & Lifestyle",
        },
        { property: "og:type", content: "website" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
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
