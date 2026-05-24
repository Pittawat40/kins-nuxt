<template>
  <div
    class="container-fluid px-3 px-lg-5 mb-3 section"
    :class="route.path.startsWith('/detail') ? 'section-detail' : ''"
  >
    <div class="grid-container">
      <template v-for="(post, index) in posts" :key="post.id">
        <div
          class="post-card"
          @click="
            route.path.startsWith('/detail')
              ? $router.push(`${post.slug}`)
              : $router.push(`detail/${post.slug}`)
          "
        >
          <div class="card-img-wrap">
            <img :src="resolveImgUrl(post.img)" :alt="post.title" />
          </div>
          <div class="card-body">
            <h2 class="card-title">{{ post.title }}</h2>
            <p class="card-excerpt">{{ post.description }}</p>
            <div class="card-meta">
              <span class="date">{{ post.date }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div
      v-if="meta.totalPages > 1"
      class="pagination container-fluid px-3 px-lg-5"
    >
      <button class="page-btn" :disabled="page === 1" @click="prevPage">
        ‹
      </button>
      <button
        v-for="p in meta.totalPages"
        :key="p"
        class="page-btn"
        :class="{ active: page === p }"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>
      <button
        class="page-btn"
        :disabled="page === meta.totalPages"
        @click="nextPage"
      >
        ›
      </button>
    </div>
    <div
      v-if="!route.path.startsWith('/detail') && displayedAds.length > 0"
      class="ad-banner"
    >
      <div
        class="ad-placeholder"
        v-for="(ads, index) in displayedAds"
        :key="ads.id"
      >
        <a @click="handleAdClick(ads)" rel="noopener noreferrer">
          <img :src="resolveImgUrl(ads.img)" alt="Advertisement" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const { ads: adsApi } = useApi();

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, ""); // "http://localhost:3002"

// ── Image URL helper ─────────────────────────────────
function resolveImgUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
const adsList = ref([]);

// ── ระบบ Rotation: แสดงทีละ 2 อัน หมุนเวียนให้ครบทุกอัน ──────────────────
const ADS_PER_VIEW = 2;

const displayedAds = computed(() => {
  if (adsList.value.length === 0) return [];
  if (adsList.value.length <= ADS_PER_VIEW) return adsList.value;

  // ดึง offset จาก sessionStorage เพื่อให้หมุนต่อเนื่องข้ามหน้า
  const stored = process.client
    ? parseInt(sessionStorage.getItem("ads_rotation_offset") || "0", 10)
    : 0;
  const result = [];
  for (let i = 0; i < ADS_PER_VIEW; i++) {
    result.push(adsList.value[(stored + i) % adsList.value.length]);
  }
  return result;
});

defineProps({
  posts: {
    type: Array,
    required: true,
  },
  meta: {
    type: Object,
    default: () => ({ totalPages: 0 }),
  },
  page: {
    type: Number,
    default: 1,
  },
  goToPage: {
    type: Function,
    required: false,
  },
  nextPage: {
    type: Function,
    required: false,
  },
  prevPage: {
    type: Function,
    required: false,
  },
});

onMounted(() => {
  if (!route.path.startsWith("/detail")) {
    fetchAds();
  }
});

async function handleAdClick(ad) {
  try {
    const res = await adsApi.trackAds(ad.id);
    if (res.success) {
      window.open(ad.link, "_blank");
    }
  } catch (e) {
    console.log(e);
  }
}

async function fetchAds() {
  try {
    const res = await adsApi.list({ status: "published" });
    adsList.value = res.data;

    // เลื่อน offset ไปข้างหน้า ADS_PER_VIEW ทุกครั้งที่โหลด ให้ครบทุกอัน
    if (process.client && adsList.value.length > ADS_PER_VIEW) {
      const current = parseInt(
        sessionStorage.getItem("ads_rotation_offset") || "0",
        10,
      );
      const next = (current + ADS_PER_VIEW) % adsList.value.length;
      sessionStorage.setItem("ads_rotation_offset", String(next));
    }
  } catch (e) {
    console.error("banner fetch error", e);
  }
}
</script>

<style scoped>
/* ── GRID ───────────────────────────────── */
.grid-container {
  margin-top: 20px;
  margin-bottom: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.container-fluid {
  max-width: 1400px;
}

/* ── CARD ───────────────────────────────── */
.post-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
}
.card-img-wrap {
  overflow: hidden;
  aspect-ratio: 3 / 2;
}
.card-img-wrap img {
  border-radius: 2px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.65) saturate(0.75);
  transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.post-card:hover .card-img-wrap img {
  transform: scale(1.05);
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--ink);
  letter-spacing: 0.2px;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.card-body {
  padding-top: 12px;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.card-excerpt {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--ink-muted);
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

/* ── RESPONSIVE ─────────────────────────── */
@media (max-width: 860px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .ad-banner {
    grid-template-columns: auto;
    gap: 10px;
    padding-top: 20px;
    margin-top: 10px;
  }
  /* .card-img-wrap {
    aspect-ratio: 16 / 9;
  } */
  .grid-container {
    margin: 0;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .section-detail {
    min-height: 0 !important;
  }

  .section {
    min-height: 600px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-title {
    font-size: 16px;
  }
}

@media (max-width: 540px) {
  .hero-banner {
    padding: 32px 24px 48px;
  }
}
</style>
