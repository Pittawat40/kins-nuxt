# KIN'S — Nuxt 3 SSG Project

Premium estate platform built with **Nuxt 3** + **Bootstrap 5** + **SSG**.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Development server  →  http://localhost:3000
npm run dev

# 3. Build static site  →  /dist
npm run generate

# 4. Preview static build
npm run preview
```

---

## 📁 Project Structure

```
kins-nuxt/
│
├── app.vue                        ← Root app wrapper
├── nuxt.config.ts                 ← Nuxt config (SSG, CSS, head)
├── package.json
│
├── pages/
│   └── index.vue                  ← Home page  ( / )
│
├── layouts/
│   └── default.vue                ← Navbar + Footer wrapper
│
├── components/
│   ├── HeroSlideshow.vue          ← Hero with 5 slides + dots + arrows
│   ├── CuratedCollections.vue     ← Horizontal drag-scroll gallery
│   └── AppFooter.vue              ← Dark footer + newsletter
│
├── composables/
│   ├── useSiteData.js             ← ✏️ แก้ content ที่นี่ที่เดียว
│   └── useScrollReveal.js         ← Intersection Observer reveal
│
└── assets/
    └── css/
        └── main.css               ← Global styles + CSS variables
```

---

## ✏️ แก้ Content

**เปลี่ยนรูป / ชื่อ / จำนวน** → แก้ที่ `composables/useSiteData.js`

```js
// Hero slides — เปลี่ยน image URL
const heroSlides = [
  { id: 1, image: '/images/hero-01.jpg', alt: 'Villa' },
  ...
]

// Collections
const collections = [
  { id: 1, category: 'Beachfront', name: 'Ocean Villas', count: 18, image: '...' },
  ...
]
```

**เปลี่ยนสี** → แก้ที่ `assets/css/main.css` ส่วน `:root {}`

```css
:root {
  --ink:   #0F0F0D;   /* สีหลัก */
  --gold:  #B8976A;   /* accent */
  --white: #FAFAF8;   /* พื้นหลัง */
}
```

**เปลี่ยน Social URLs** → แก้ที่ `components/AppFooter.vue` และ `layouts/default.vue`

---

## 🎨 CSS Classes Reference

| Class | ใช้งาน |
|---|---|
| `.btn-a` | ปุ่ม dark |
| `.btn-a.ghost` | ปุ่ม outline dark |
| `.btn-a.light` | ปุ่ม white (บน hero) |
| `.btn-a.ghost-light` | ปุ่ม outline white |
| `.rv` | fade-up reveal on scroll |
| `.rvl` | fade-left reveal |
| `.rvs` | scale reveal |
| `.t-label` | label เล็ก uppercase |
| `.t-h2` | heading section |
| `.sec-rule` | เส้น gold สั้น |

---

## 📦 Dependencies

| Package | Version | ใช้ทำ |
|---|---|---|
| `nuxt` | ^3.11 | Framework + SSG |
| `bootstrap` | ^5.3.3 | Grid + Utilities |
| `bootstrap-icons` | ^1.11.3 | Icons |

Font: **Playfair Display** + **Inter** (Google Fonts CDN)

---

## 🌐 Deploy (Static)

```bash
npm run generate
# Upload /dist folder to any static host:
# Netlify / Vercel / Cloudflare Pages / GitHub Pages
```

### Netlify (แนะนำ)
```toml
# netlify.toml
[build]
  command   = "npm run generate"
  publish   = "dist"
```

### Vercel
```json
// vercel.json
{
  "buildCommand": "npm run generate",
  "outputDirectory": "dist"
}
```
