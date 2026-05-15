<template>
  <section class="hero" id="home">
    <div
      v-for="(slide, i) in slides"
      :key="slide.id"
      class="hero-slide"
      :class="{ active: current === i }"
      :aria-label="slide.alt"
      role="img"
    >
      <div v-if="slide.type === 'video'" class="video-container">
        <video
          :ref="
            (el) => {
              if (el) videoRefs[i] = el;
            }
          "
          :src="resolveBannerUrl(slide.url)"
          :poster="resolveBannerUrl(slide.posterUrl || slide.thumbnail)"
          muted
          playsinline
          webkit-playsinline
          autoplay
          loop
          class="media"
        />

        <button
          v-if="isVideoBlocked[i] && current === i"
          class="play-btn-fallback"
          @click="manualPlay(i)"
          aria-label="Play video"
        >
          <i class="bi bi-play-fill" />
          <span>Play Video</span>
        </button>
      </div>

      <img v-else :src="resolveBannerUrl(slide.url)" class="media" />
    </div>

    <div class="hero-ov" />

    <button
      class="hero-arr prev"
      @click="prevReset"
      aria-label="Previous slide"
    >
      <i class="bi bi-chevron-left" />
    </button>
    <button class="hero-arr next" @click="nextReset" aria-label="Next slide">
      <i class="bi bi-chevron-right" />
    </button>

    <div class="hero-dots" role="tablist" aria-label="Slide navigation">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="hdot"
        :class="{ on: current === i }"
        @click="goToReset(i)"
        :aria-label="`Slide ${i + 1}`"
        :aria-selected="current === i"
        role="tab"
      />
    </div>

    <div class="hero-si d-none d-md-flex">
      <div class="sline" />
      <span>Scroll</span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, "");

function resolveBannerUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

const props = defineProps({
  slides: {
    type: Array,
    required: true,
  },
  interval: {
    type: Number,
    default: 6000,
  },
});

const current = ref(0);
const videoRefs = ref({});
const isVideoBlocked = ref({}); // เก็บสถานะการโดนบล็อกของวิดีโอแต่ละตัว
let timer = null;

function goTo(index) {
  current.value = (index + props.slides.length) % props.slides.length;
}
function next() {
  goTo(current.value + 1);
}
function prev() {
  goTo(current.value - 1);
}

function startAuto() {
  timer = setInterval(next, props.interval);
}
function resetAuto() {
  clearInterval(timer);
  startAuto();
}

function goToReset(index) {
  goTo(index);
  resetAuto();
}
function nextReset() {
  next();
  resetAuto();
}
function prevReset() {
  prev();
  resetAuto();
}

// Touch swipe
let touchX = 0;
function onTouchStart(e) {
  touchX = e.touches[0].clientX;
}
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) {
    dx < 0 ? nextReset() : prevReset();
  }
}

// ── ฟังก์ชันสั่งเล่นวิดีโอและแก้ปัญหา LINE Browser ──

// สั่งเล่นวิดีโอตัวปัจจุบันอย่างปลอดภัย
function playCurrentVideo() {
  nextTick(() => {
    const activeVideo = videoRefs.value[current.value];
    if (activeVideo) {
      activeVideo.muted = true;
      activeVideo
        .play()
        .then(() => {
          // ถ้าเล่นสำเร็จ ให้ปิดปุ่มสำรอง
          isVideoBlocked.value[current.value] = false;
        })
        .catch((err) => {
          console.warn("Autoplay blocked. Showing manual play button.", err);
          // หากโดนบล็อก (เช่น ติด Low Power Mode หรือเปิดบน LINE ครั้งแรก) ให้โชว์ปุ่มสำรอง
          isVideoBlocked.value[current.value] = true;
        });
    }
  });
}

// ฟังก์ชันแตะหน้าจอครั้งแรกเพื่อบังคับเล่น (แก้ปัญหา LINE เจาะจง)
function unlockAutoplay() {
  const activeVideo = videoRefs.value[current.value];
  if (activeVideo) {
    activeVideo.muted = true;
    activeVideo
      .play()
      .then(() => {
        isVideoBlocked.value[current.value] = false;
        cleanupUnlockListeners();
      })
      .catch((err) => {
        console.error("Failed to unlock video:", err);
      });
  }
}

// เล่นแบบแมนนวลเมื่อผู้ใช้จิ้มปุ่ม Play เอง
function manualPlay(index) {
  const video = videoRefs.value[index];
  if (video) {
    video
      .play()
      .then(() => {
        isVideoBlocked.value[index] = false;
      })
      .catch((err) => {
        console.error("Manual play failed:", err);
      });
  }
}

function cleanupUnlockListeners() {
  document.removeEventListener("touchstart", unlockAutoplay);
  document.removeEventListener("click", unlockAutoplay);
}

watch(current, () => {
  playCurrentVideo();
});

onMounted(() => {
  startAuto();

  const el = document.querySelector(".hero");
  el?.addEventListener("touchstart", onTouchStart, { passive: true });
  el?.addEventListener("touchend", onTouchEnd, { passive: true });

  playCurrentVideo();

  // ดักจับการมีปฏิสัมพันธ์ของนิ้วผู้ใช้ครั้งแรก เพื่อปลดล็อกวิดีโอบน LINE
  document.addEventListener("touchstart", unlockAutoplay, { passive: true });
  document.addEventListener("click", unlockAutoplay);
});

onUnmounted(() => {
  clearInterval(timer);
  cleanupUnlockListeners();
});
</script>

<style scoped>
img {
  height: 100%;
  object-fit: cover;
}
/* ── HERO ── */
.hero {
  position: relative;
  height: 100dvh;
  /* min-height: 680px; */
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding-bottom: clamp(3rem, 6vw, 5rem);
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.04);
  transition:
    opacity 1.2s ease,
    transform 8s ease-out;
}
.hero-slide.active {
  opacity: 1;
  transform: scale(1);
}

/* ── ป้องกันการสั่นของสไลด์ที่เป็นวิดีโอ ── */
/* ปิดเอฟเฟกต์การซูม (Scale) บนสไลด์วิดีโอ เพื่อป้องกันภาพสั่นสะท้อนจาก GPU */
.hero-slide:has(video) {
  transform: none !important;
  transition: opacity 1.2s ease !important;
}
.hero-slide:has(video).active {
  transform: none !important;
}

/* ครอบสไลด์วิดีโอให้อยู่ในกรอบ และเปิดการเร่งความเร็วการ์ดจอ */
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.hero-slide video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* บังคับรีดประสิทธิภาพจากชิปกราฟิกของมือถือช่วยประมวลผลวิดีโอ */
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* ── ปุ่ม Play สำรองเมื่อติด Low Power Mode ── */
.play-btn-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.6rem;
  background: rgba(10, 10, 8, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50px;
  color: var(--white, #fff);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}
.play-btn-fallback:hover {
  background: rgba(10, 10, 8, 0.85);
  border-color: rgba(255, 255, 255, 0.7);
}
.play-btn-fallback i {
  font-size: 1.2rem;
}

.hero-ov {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to top,
    rgba(10, 10, 8, 0.72) 0%,
    rgba(10, 10, 8, 0.25) 50%,
    rgba(10, 10, 8, 0.1) 100%
  );
}

/* arrows */
.hero-arr {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(10, 10, 8, 0.18);
  backdrop-filter: blur(8px);
  color: var(--white);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}
.hero-arr:hover {
  background: rgba(10, 10, 8, 0.55);
  border-color: rgba(255, 255, 255, 0.6);
}
.hero-arr.prev {
  left: 1.5rem;
}
.hero-arr.next {
  right: 1.5rem;
}

/* dots */
.hero-dots {
  position: absolute;
  bottom: 2.2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.6rem;
  z-index: 5;
}
.hdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.35s;
}
.hdot.on {
  width: 22px;
  border-radius: 3px;
  background: var(--white);
}

/* counter */
.hero-counter {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  z-index: 5;
}
.hero-counter-cur {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 300;
  color: var(--white);
}
.hero-counter-sep {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.25);
}
.hero-counter-tot {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.35);
}

/* scroll indicator */
.hero-si {
  position: absolute;
  bottom: 2rem;
  right: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}
.hero-si span {
  font-size: 0.56rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  writing-mode: vertical-rl;
}
.sline {
  width: 1px;
  height: 46px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45),
    transparent
  );
  animation: sp 2s ease-in-out infinite;
}
@keyframes sp {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

/* content */
.hero-c {
  position: relative;
  z-index: 2;
  width: 100%;
}

@keyframes fup {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.h-eyebrow {
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-light);
  margin-bottom: 1.5rem;
  opacity: 0;
  animation: fup 1s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.h-title {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 300;
  line-height: 1;
  color: var(--white);
  margin-bottom: 1.4rem;
  opacity: 0;
  animation: fup 1s 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.h-title em {
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
}
.h-sub {
  font-size: 0.88rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.65);
  max-width: 440px;
  line-height: 1.85;
  margin-bottom: 2.5rem;
  opacity: 0;
  animation: fup 1s 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.h-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  opacity: 0;
  animation: fup 1s 0.9s ease forwards;
}

@media (max-width: 767px) {
  .hero {
    margin-top: 50px;
    height: 300px;
  }
  .hero-si,
  .hero-counter {
    display: none !important;
  }
  .hero-arr.prev {
    left: 0.75rem;
  }
  .hero-arr.next {
    right: 0.75rem;
  }
}
</style>
