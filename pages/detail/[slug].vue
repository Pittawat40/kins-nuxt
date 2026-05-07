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

      <!-- GRID -->
      <div class="container-fluid px-3 px-lg-5 mt-5">
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

const { posts: postsApi } = useApi();

const pending = ref(true);
const detail = ref({});
const postList = ref([]);

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
      .slice(0, 3)
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
    await fetchPostList();
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
  max-width: 1360px;
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
