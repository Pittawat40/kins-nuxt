<template>
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
</template>

<script setup>
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

// ── Init ─────────────────────────────────────────────
onMounted(async () => {
  await fetchHeroBanners();
});
</script>

<style scoped></style>
