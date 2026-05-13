<template>
  <div>
    <!-- ───── OVERVIEW ───── -->
    <section class="section-card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Page Views</h3>
          <p class="section-sub">ยอดผู้เข้าชมเว็บไซต์ทั้งหมด</p>
        </div>
        <button class="btn-outline btn-sm" @click="loadOverview">
          <i
            class="bi bi-arrow-clockwise"
            :class="{ 'spin-animation': isSpinning }"
          />
        </button>
      </div>
      <div class="ov-section mt-2">
        <div class="ov-cards">
          <div class="ov-card">
            <div class="d-flex">
              <div class="ov-card-icon ov-blue">
                <i class="bi bi-eye-fill" />
              </div>
              <div class="ov-card-body ms-3">
                <span class="ov-card-label">ยอดเข้าชมวันนี้</span>
              </div>
            </div>
            <span class="ov-card-value">
              <template v-if="ovLoading">0</template>
              <template v-else>
                <count-up
                  :end-val="overview.today"
                  :duration="2"
                  :options="{ useGrouping: true, separator: ',' }"
                />
              </template>
            </span>
          </div>

          <div class="ov-card">
            <div class="d-flex">
              <div class="ov-card-icon ov-purple">
                <i class="bi bi-graph-up-arrow" />
              </div>
              <div class="ov-card-body ms-3">
                <span class="ov-card-label">ยอดเข้าชมเดือนนี้</span>
              </div>
            </div>
            <span class="ov-card-value">
              <template v-if="ovLoading">0</template>
              <template v-else>
                <count-up
                  :end-val="overview.month"
                  :duration="2"
                  :options="{ useGrouping: true, separator: ',' }"
                />
              </template>
            </span>
          </div>

          <div class="ov-card">
            <div class="d-flex">
              <div class="ov-card-icon ov-green">
                <i class="bi bi-house-dash" />
              </div>
              <div class="ov-card-body ms-3">
                <span class="ov-card-label">ยอดเข้าชมทั้งหมด</span>
              </div>
            </div>
            <span class="ov-card-value">
              <template v-if="ovLoading">0</template>
              <template v-else>
                <count-up
                  :end-val="overview.total"
                  :duration="2"
                  :options="{ useGrouping: true, separator: ',' }"
                />
              </template>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── HERO BANNER ───── -->
    <section class="section-card">
      <div class="section-head">
        <div>
          <h3 class="section-title"><i class="bi bi-images me-2" />Banner</h3>
          <span class="section-sub"
            >อัปโหลดได้สูงสุด 5 รายการ (รูปภาพหรือวิดีโอ)</span
          >
        </div>
        <span
          class="status-chip"
          :class="heroBanners.length >= 5 ? 'published' : 'unpublished'"
        >
          {{ heroBanners.length }} / 5
        </span>
      </div>

      <input
        ref="heroBannerInput"
        type="file"
        accept="image/*,video/*"
        multiple
        class="d-none"
        @change="onHeroBannerChange"
      />

      <div
        v-if="heroBanners.length < 5"
        class="banner-dropzone"
        :class="{ dragover: heroDragOver }"
        style="margin-top: 16px; aspect-ratio: 21/6"
        @dragover.prevent="heroDragOver = true"
        @dragleave="heroDragOver = false"
        @drop.prevent="onHeroDrop"
        @click="triggerHeroUpload"
      >
        <div class="dropzone-inner">
          <i class="bi bi-cloud-arrow-up" />
          <p>ลากไฟล์มาวางหรือ <strong>คลิกเพื่อเลือกไฟล์</strong></p>
          <p style="font-size: 11px; color: var(--muted)">
            รองรับ JPG, PNG — 2560 × 1200 px &nbsp;|&nbsp; MP4, MOV — ไม่เกิน 50
            MB
          </p>
        </div>
      </div>

      <draggable
        v-model="heroBanners"
        item-key="id"
        class="banner-grid"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
          <div class="banner-thumb">
            <video
              v-if="element.type === 'video'"
              :src="resolveBannerUrl(element.url)"
              muted
              loop
              playsinline
              autoplay
            />
            <img
              v-else
              :src="resolveBannerUrl(element.url)"
              :alt="`Banner ${index + 1}`"
            />
            <div class="banner-overlay">
              <div
                style="
                  font-size: 11px;
                  font-weight: 700;
                  color: rgba(255, 255, 255, 0.8);
                  background: rgba(0, 0, 0, 0.3);
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                {{ index + 1 }}
              </div>
              <div class="banner-actions">
                <button
                  class="thumb-btn danger"
                  @click="removeHeroBanner(element)"
                >
                  <i class="bi bi-trash3" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </section>
  </div>
</template>

<script setup>
import CountUp from "vue-countup-v3";
import draggable from "vuedraggable";

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, "");

const props = defineProps({
  bannerApi: { type: Object, required: true },
  dashboardApi: { type: Object, required: true },
  showToast: { type: Function, required: true },
});

// ─────────────────────────────────────────
// Overview
// ─────────────────────────────────────────
const ovLoading = ref(true);
const isSpinning = ref(false);

const overview = reactive({
  today: 0,
  month: 0,
  total: 0,
});

async function loadOverview() {
  if (isSpinning.value) return;
  ovLoading.value = true;
  isSpinning.value = true;
  try {
    const res = await props.dashboardApi.overview();
    if (res.data) {
      overview.today = res.data.today ?? 0;
      overview.month = res.data.month ?? 0;
      overview.total = res.data.total ?? 0;
    }
  } catch (e) {
    props.showToast(e.message || "โหลด overview ไม่ได้", "error");
  } finally {
    ovLoading.value = false;
    setTimeout(() => {
      isSpinning.value = false;
    }, 500);
  }
}

// ─────────────────────────────────────────
// Hero Banners
// ─────────────────────────────────────────
const heroBanners = ref([]);
const heroBannerUploading = ref(false);
const heroBannerInput = ref(null);
const heroDragOver = ref(false);
const HERO_SECTION = "dashboard";

function onDragEnd() {
  const ids = heroBanners.value.map((b) => b.id);
  props.dashboardApi.reorder(ids);
}

async function fetchHeroBanners() {
  try {
    const res = await props.bannerApi.list(HERO_SECTION);
    heroBanners.value = res.data || [];
  } catch (e) {
    console.error("hero banner fetch error", e);
  }
}

function triggerHeroUpload() {
  heroBannerInput.value?.click();
}

async function onHeroBannerChange(e) {
  const files = Array.from(e.target.files);
  e.target.value = "";
  if (files.length) await uploadHeroBanners(files);
}

async function onHeroDrop(e) {
  heroDragOver.value = false;
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
  );
  if (files.length) await uploadHeroBanners(files);
}

function resolveBannerUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

async function uploadHeroBanners(files) {
  const slots = 5 - heroBanners.value.length;
  if (slots <= 0) {
    props.showToast("ครบ 5 รายการแล้ว กรุณาลบก่อน", "error");
    return;
  }
  const toUpload = files.slice(0, slots);
  if (files.length > slots)
    props.showToast(`อัปโหลดได้อีก ${slots} รายการ`, "error");
  heroBannerUploading.value = true;
  let uploaded = 0;
  for (const file of toUpload) {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      props.showToast(`ไม่รองรับไฟล์ ${file.name}`, "error");
      continue;
    }
    try {
      await props.bannerApi.upload(
        HERO_SECTION,
        file,
        isVideo ? "video" : "image",
      );
      uploaded++;
    } catch (err) {
      props.showToast(err.message || "อัปโหลดไม่สำเร็จ", "error");
    }
  }
  await fetchHeroBanners();
  heroBannerUploading.value = false;
  if (uploaded > 0) props.showToast(`อัปโหลด ${uploaded} รายการแล้ว`);
}

async function removeHeroBanner(banner) {
  try {
    await props.bannerApi.delete(HERO_SECTION, banner.id);
    await fetchHeroBanners();
    props.showToast("ลบรูปแล้ว");
  } catch (e) {
    props.showToast(e.message || "ลบไม่ได้", "error");
  }
}

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchHeroBanners(), loadOverview()]);
});
</script>

<style scoped>
.ov-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ov-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
}

.ov-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #e8e8f0);
  border-radius: 14px;
  padding: 1.1rem 1.3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.ov-card-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}
.ov-blue {
  background: #e8f0fe;
  color: #3b6af5;
}
.ov-purple {
  background: #f0eaff;
  color: #6c63ff;
}
.ov-green {
  background: #e6f9f0;
  color: #1db97a;
}
.ov-orange {
  background: #fff3e8;
  color: #f07d2a;
}

.ov-card-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-width: 0;
}
.ov-card-label {
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}
.ov-card-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #1a1a2e);
  line-height: 1.1;
}

@keyframes ov-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
