<template>
  <div class="page">
    <!-- Loading -->
    <div v-if="pending" class="loading text-center py-5">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Loaded -->
    <template v-else>
      <Banner :bannerImage="`${resolveImgUrl(detail.img)}`" />
      <div class="container-fluid px-3 px-lg-5 mt-4">
        <div class="title">{{ detail.title }}</div>
        <div class="html-desc" v-html="detail.content"></div>
      </div>

      <!-- ADS BANNER ใต้ content detail -->
      <div
        v-if="detailAds.length > 0"
        class="container-fluid px-3 px-lg-5 mt-4"
      >
        <div
          class="ad-placeholder"
          v-for="(ads, index) in detailAds"
          :key="ads.id"
        >
          <a @click="handleAdClick(ads)" rel="noopener noreferrer">
            <img :src="resolveImgUrl(ads.img)" alt="Advertisement" />
          </a>
        </div>
      </div>

      <!-- GRID -->
      <div class="container-fluid px-3 px-lg-5 mt-4 mt-lg-5">
        <div class="d-flex align-items-end justify-content-between">
          <div>
            <span class="sec-rule" />
            <p class="t-label mb-2">{{ detail.section }}</p>
            <h2 class="t-h2" style="color: var(--ink-muted)">
              Latest Collections
            </h2>
          </div>
        </div>
      </div>

      <listCollections :posts="postList" />
    </template>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const { posts: postsApi, ads: adsApi } = useApi();

const pending = ref(true);
const detail = ref({});
const postList = ref([]);
const detailAds = ref([]);

// ── ADS_PER_VIEW สำหรับหน้า detail ──────────────────────────────
const DETAIL_ADS_PER_VIEW = 1;

async function fetchDetailAds() {
  try {
    const res = await adsApi.list({ status: "published" });
    const all = res.data || [];
    if (all.length === 0) return;
    if (all.length <= DETAIL_ADS_PER_VIEW) {
      detailAds.value = all;
      return;
    }
    // ใช้ offset คนละตัวกับ list page เพื่อให้ detail แสดง ads ชุดถัดไป
    const stored = process.client
      ? parseInt(sessionStorage.getItem("ads_detail_offset") || "0", 10)
      : 0;
    const picked = [];
    for (let i = 0; i < DETAIL_ADS_PER_VIEW; i++) {
      picked.push(all[(stored + i) % all.length]);
    }
    detailAds.value = picked;
    // เลื่อน offset ไปข้างหน้า
    if (process.client) {
      const next = (stored + DETAIL_ADS_PER_VIEW) % all.length;
      sessionStorage.setItem("ads_detail_offset", String(next));
    }
  } catch (e) {
    console.error("detail ads fetch error:", e);
  }
}

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, ""); // "http://localhost:3002"

// ── Image URL helper ─────────────────────────────────
function resolveImgUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

// ── Image URL helper ─────────────────────────────────
function resolveContentImages(html) {
  if (!html) return "";

  return html.replace(/<img[^>]+src="([^">]+)"/g, (match, src) => {
    const newSrc = src.startsWith("http") ? src : `${API_BASE}${src}`;
    return match.replace(src, newSrc);
  });
}

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

const fetchDetail = async () => {
  try {
    const res = await postsApi.getBySlug("hotels", route.params.slug);
    detail.value = res.data;
    detail.value.content = resolveContentImages(res.data.content);
  } catch (e) {
    return navigateTo("/");
  }
};

const fetchPostList = async () => {
  try {
    const postsRes = await postsApi.list(detail.value.section, {
      status: "published",
      limit: 10,
    });

    postList.value = postsRes.data
      .filter((p) => p.id !== detail.value.id)
      .slice(0, 2)
      .map((p) => ({
        id: p.id,
        slug: slugify(p.title),
        img: p.img || "",
        title: p.title,
        date: p.date,
        categories: p.category ? [p.category] : [],
        description: p.description?.replace(/<[^>]*>/g, "").slice(0, 80) || "",
      }));
  } catch (e) {
    console.error("fetchPostList error:", e);
    error.value = true;
  }
};

const initPage = async () => {
  try {
    await fetchDetail();
    await Promise.all([fetchPostList(), fetchDetailAds()]);
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  initPage();
});

const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // ลบอักขระพิเศษ
    .replace(/\s+/g, "-") // เว้นวรรค -> -
    .replace(/-+/g, "-"); // ลด - ซ้ำ
};
</script>

<style scoped>
.html-desc {
  overflow: hidden;
  width: 100%;
  word-break: break-word;
}

::v-deep(.html-desc),
::v-deep(.html-desc *) {
  font-family: var(--font-mixed) !important;
}

.container-fluid {
  max-width: 960px;
}

.title {
  font-size: 24px;
  font-weight: 400;
  border-bottom: 1px solid var(--gold);
  padding-bottom: 20px;
  padding-top: 20px;
  margin-bottom: 20px;
  color: var(--ink-muted);
  text-align: end;
}

::v-deep .grid-container {
  grid-template-columns: repeat(2, 1fr);
}

::v-deep .mg-img-full {
  margin: 20px 0;
}

::v-deep .mg-img-right,
::v-deep .mg-img-left {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

::v-deep .mg-side-text,
::v-deep .mg-side-img {
  width: 50%;
}

::v-deep .mg-caption-block {
  white-space: pre-line;
  font-size: 12px;
  color: var(--muted);
  font-style: italic;
  margin: 10px 0 20px;
}

::v-deep .mg-caption {
  margin: 10px 0 20px;
}

/* 2 Images Side by Side */
::v-deep .mg-img-pair,
::v-deep .mg-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
}

::v-deep .mg-pair-img {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

::v-deep .mg-pair-img img {
  width: 100%;
  display: block;
  border-radius: 4px;
  object-fit: cover;
}

::v-deep .mg-pair-img .mg-caption {
  font-size: 12px;
  color: #888;
  font-style: italic;
  text-align: center;
  margin: 0;
}

@media (max-width: 767px) {
  ::v-deep .mg-img-full {
    margin: 10px 0;
  }

  ::v-deep .mg-img-pair,
  ::v-deep .mg-two-col {
    grid-template-columns: 1fr;
  }

  ::v-deep .mg-img-right,
  ::v-deep .mg-two-col,
  ::v-deep .mg-img-left {
    flex-direction: column;
    gap: 10px;
    margin: 10px 0;
  }

  ::v-deep .mg-side-text,
  ::v-deep .mg-side-img {
    width: 100%;
  }
}
</style>
