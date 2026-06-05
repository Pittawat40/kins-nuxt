<template>
  <div class="page">
    <div v-if="pending" class="loading text-center py-5">
      <div class="spinner-border" role="status" />
    </div>

    <template v-else>
      <Banner :bannerImage="resolveBannerUrl(activeBanner?.url)" />

      <section
        ref="sectionRef"
        class="content-section"
        :class="{ 'is-visible': isVisible }"
      >
        <div class="container-fluid px-3 px-lg-5 mt-5">
          <div class="d-flex align-items-end justify-content-between">
            <div class="animate-text">
              <span class="sec-rule" />
              <p class="t-label mb-2">Collections</p>
              <h2 class="t-h2" style="color: var(--ink-muted)">Lifestyle</h2>
            </div>
          </div>
        </div>

        <div v-if="error" class="container-fluid px-3 px-lg-5 py-4">
          <div class="alert alert-warning">
            ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่
          </div>
        </div>

        <div v-else class="animate-list">
          <listCollections
            :posts="postList"
            :meta="meta"
            :page="page"
            :goToPage="goToPage"
            :nextPage="nextPage"
            :prevPage="prevPage"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

useHead({ title: "Lifestyle - KIN'S" });

const route = useRoute();
const router = useRouter();

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
const page = ref(Number(route.query.page) || 1);
const perPage = 6;
const meta = ref({});

const sectionRef = ref(null);
const isVisible = ref(false);
let observer = null;

watch(
  pending,
  async (isPending) => {
    if (!isPending) {
      await nextTick();
      if (sectionRef.value) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                isVisible.value = true;
                if (sectionRef.value) observer.unobserve(sectionRef.value);
              }
            });
          },
          { threshold: 0.1 },
        );
        observer.observe(sectionRef.value);
      }
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (observer) observer.disconnect();
});

watch(
  () => route.query.page,
  (newPage) => {
    const pageNum = Number(newPage) || 1;
    if (page.value !== pageNum) {
      page.value = pageNum;
      fetchData();
    }
  },
);

onMounted(() => {
  fetchData();
});

async function fetchData() {
  pending.value = true;
  try {
    const [postsRes, bannersRes] = await Promise.all([
      postsApi.list("lifestyle", {
        status: "published",
        page: page.value,
        limit: perPage,
      }),
      bannersApi.list("lifestyle"),
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

function updateRouteQuery(p) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      page: p,
    },
  });
}

function goToPage(p) {
  if (p < 1 || p > meta.value.totalPages) return;
  page.value = p;
  updateRouteQuery(p);
  fetchData();
}

function nextPage() {
  if (page.value < meta.value.totalPages) {
    page.value++;
    updateRouteQuery(page.value);
    fetchData();
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    updateRouteQuery(page.value);
    fetchData();
  }
}
</script>

<style scoped>
.container-fluid {
  max-width: 1400px;
}

.animate-text {
  opacity: 0;
  transform: translateX(-50px);
  transition:
    transform 1s cubic-bezier(0.215, 0.61, 0.355, 1),
    opacity 1s ease;
}

.animate-list {
  opacity: 0;
  transition: opacity 1.2s ease;
}

.content-section.is-visible .animate-text {
  opacity: 1;
  transform: translateX(0);
}

.content-section.is-visible .animate-list {
  opacity: 1;
}

@media (max-width: 767px) {
  .container-fluid {
    margin-top: 1.5rem !important;
  }
}
</style>
