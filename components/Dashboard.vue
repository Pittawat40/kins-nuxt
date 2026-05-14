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

      <!-- Cards -->
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

      <!-- Monthly Chart -->
      <div class="ov-chart-wrap mt-3">
        <div class="ov-chart-header">
          <span class="ov-chart-title">รายเดือน {{ currentYear }}</span>
        </div>
        <div v-if="ovLoading" class="ov-chart-loading">
          <div class="spinner-border spinner-border-sm" role="status" />
        </div>
        <canvas v-else ref="chartCanvas" class="ov-chart-canvas" />
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
import { ref, reactive, onMounted, nextTick } from "vue";

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
// Overview + Chart
// ─────────────────────────────────────────
const ovLoading = ref(true);
const isSpinning = ref(false);
const chartCanvas = ref(null);
const currentYear = new Date().getFullYear();
let chartInstance = null;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const overview = reactive({ today: 0, month: 0, total: 0 });

// แปลง monthly array จาก backend → 12 ช่อง (เดือนที่ไม่มีข้อมูล = 0)
function buildMonthlyData(monthly = []) {
  const data = Array(12).fill(0);
  monthly.forEach((row) => {
    const idx = parseInt(row.month, 10) - 1; // '01' → 0
    if (idx >= 0 && idx < 12) data[idx] = Number(row.views) || 0;
  });
  return data;
}

function loadChartJs() {
  return new Promise((resolve) => {
    if (window.Chart) return resolve(window.Chart);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
    s.onload = () => resolve(window.Chart);
    document.head.appendChild(s);
  });
}

async function renderChart(monthly) {
  if (!chartCanvas.value) return;
  const Chart = await loadChartJs();
  if (chartInstance) chartInstance.destroy();

  const data = buildMonthlyData(monthly);

  const maxVal = Math.max(...data, 1);
  const stepSize =
    maxVal <= 10
      ? 1
      : maxVal <= 50
        ? 5
        : maxVal <= 100
          ? 10
          : maxVal <= 500
            ? 50
            : maxVal <= 1000
              ? 100
              : maxVal <= 5000
                ? 500
                : 1000;

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: "Page Views",
          data,
          barThickness: 20,
          backgroundColor: data.map((_, i) => {
            // highlight เดือนปัจจุบัน
            return i === new Date().getMonth()
              ? "rgba(108,99,255,0.85)"
              : "rgba(108,99,255,0.25)";
          }),
          borderColor: "rgba(108,99,255,1)",
          borderWidth: 1,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a1a2e",
          titleColor: "#fff",
          bodyColor: "rgba(255,255,255,0.75)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} views`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#aaa", font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          suggestedMax: 5,
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            color: "#aaa",
            font: { size: 11 },
            stepSize,
            callback: (v) => {
              if (!Number.isInteger(v)) return;
              return v >= 1000 ? `${v / 1000}k` : v;
            },
          },
        },
      },
    },
  });
}

async function loadOverview() {
  if (isSpinning.value) return;
  ovLoading.value = true;
  isSpinning.value = true;
  try {
    const res = await props.dashboardApi.overview();
    if (res?.data) {
      overview.today = res.data.today ?? 0;
      overview.month = res.data.month ?? 0;
      overview.total = res.data.total ?? 0;
      ovLoading.value = false;
      await nextTick();
      await nextTick();
      await renderChart(res.data.monthly ?? []);
    }
  } catch (e) {
    props.showToast(e.message || "โหลด overview ไม่ได้", "error");
  } finally {
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

/* ── Chart ── */
.ov-chart-wrap {
  border-top: 1px solid var(--border, #e8e8f0);
  padding-top: 1rem;
}
.ov-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.ov-chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted, #888);
}
.ov-chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  color: var(--muted, #aaa);
}
.ov-chart-canvas {
  width: 100% !important;
  height: 200px !important;
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
