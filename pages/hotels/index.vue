<template>
  <div class="page">
    <!-- Loading -->
    <div v-if="pending" class="loading text-center py-5">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Loaded -->
    <template v-else>
      <!-- HERO BANNER -->
      <Banner :bannerImage="resolveBannerUrl(activeBanner?.url)" />

      <!-- GRID -->
      <div class="container-fluid px-3 px-lg-5 mt-5">
        <div class="d-flex align-items-end justify-content-between">
          <div>
            <span class="sec-rule" />
            <p class="t-label mb-2">Collections</p>
            <h2 class="t-h2" style="color: var(--ink-muted)">Hotels</h2>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="container-fluid px-3 px-lg-5 py-4">
        <div class="alert alert-warning">
          ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่
        </div>
      </div>

      <!-- List -->
      <listCollections
        v-else
        :posts="postList"
        :meta="meta"
        :page="page"
        :goToPage="goToPage"
        :nextPage="nextPage"
        :prevPage="prevPage"
      />
    </template>
  </div>
</template>

<script setup>
useHead({ title: "Hotel - KIN'S" });

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, "");

function resolveBannerUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

const { posts: postsApi, banners: bannersApi } = useApi();

const pending = ref(true);
const error = ref(false);
const postList = ref([]);
const activeBanner = ref(null);
const page = ref(1);
const perPage = 6;
const meta = ref({});

onMounted(() => {
  fetchData();
});

async function fetchData() {
  pending.value = true;
  try {
    const [postsRes, bannersRes] = await Promise.all([
      postsApi.list("hotels", {
        status: "published",
        page: page.value,
        limit: perPage,
      }),
      bannersApi.list("hotels"),
    ]);

    postList.value = postsRes.data.map((p) => ({
      id: p.id,
      slug: slugify(p.title),
      img: p.img || "",
      title: p.title,
      date: p.date,
      categories: p.category ? [p.category] : [],
      description: p.description?.replace(/<[^>]*>/g, "").slice(0, 80) || "",
    }));

    meta.value = postsRes.meta;

    activeBanner.value =
      bannersRes.data.find((b) => b.active) || bannersRes.data[0] || null;
    window.scrollTo(0, 0);
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    pending.value = false;
  }
}

function goToPage(p) {
  if (p < 1 || p > meta.value.totalPages) return;
  page.value = p;
  fetchData();
}

function nextPage() {
  if (page.value < meta.value.totalPages) {
    page.value++;
    fetchData();
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchData();
  }
}

const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // ลบอักขระพิเศษ
    .replace(/\s+/g, "-") // เว้นวรรค -> -
    .replace(/-+/g, "-"); // ลด - ซ้ำ
};
</script>
