<template>
  <section class="coll-sec" id="collections">
    <div class="container-fluid px-3 px-lg-5">
      <div class="d-flex align-items-end justify-content-between">
        <div>
          <span class="sec-rule" />
          <h2 class="t-h2" style="color: var(--ink-muted)">
            Explore Our Lastest Stories
          </h2>
        </div>
      </div>
    </div>

    <!-- Horizontal scroll track -->
    <div
      class="ctrack"
      ref="trackRef"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <div
        v-for="(item, i) in collections"
        :key="item.id"
        class="citem"
        @click="$router.push(`/detail/${item.slug}`)"
      >
        <div class="cimg-wrap">
          <img :src="resolveImgUrl(item.img)" :alt="item.title" class="cimg" />
        </div>
        <div class="cbody">
          <div class="cname">{{ item.title }}</div>
          <div class="ccnt">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  collections: {
    type: Array,
    required: true,
  },
});

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, ""); // "http://localhost:3002"

// ── Image URL helper ─────────────────────────────────
function resolveImgUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

// ── Drag-to-scroll ────────────────────────────────────────────────────────
const trackRef = ref(null);
let isDown = false;
let startX = 0;
let scrollLeft = 0;

function onMouseDown(e) {
  isDown = true;
  startX = e.pageX - trackRef.value.offsetLeft;
  scrollLeft = trackRef.value.scrollLeft;
  trackRef.value.classList.add("drag");
}
function onMouseUp() {
  isDown = false;
  trackRef.value?.classList.remove("drag");
}
function onMouseMove(e) {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - trackRef.value.offsetLeft;
  const walk = (x - startX) * 1.5;
  trackRef.value.scrollLeft = scrollLeft - walk;
}
</script>

<style scoped>
.coll-sec {
  padding: 4rem 0 0;
  background: var(--white);
  overflow: hidden;
  margin-bottom: 60px;
}

.drag-hint {
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.drag-rule {
  display: inline-block;
  width: 36px;
  height: 1px;
  background: var(--paper-deep);
  vertical-align: middle;
}

/* track */
.ctrack {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  cursor: grab;
  -webkit-user-select: none;
  user-select: none;
  margin-top: 2.5rem;
}

.ctrack::-webkit-scrollbar {
  display: none;
}

.ctrack.drag {
  cursor: grabbing;
}

/* card */
.citem {
  flex: 0 0 auto; /* ยอมให้การ์ดกว้างตามเนื้อหาข้างใน */
  width: auto; /* ให้กว้างตามรูป */

  position: relative;
  overflow: hidden;
  scroll-snap-align: start;
  cursor: pointer;
}

.citem:last-child {
  border-right: none;
}

.cimg-wrap {
  overflow: hidden;
  height: 460px;
  width: auto;
}

.cimg {
  width: auto; /* ⚠️ ห้ามใส่ 100% เพราะจะทำให้ Safari ดึงขนาดจริงของไฟล์ภาพมา */
  height: 100%; /* บังคับให้รูปสูงเท่าตัว wrap (460px) */
  max-width: 100vw; /* ป้องกันไม่ให้รูปเดี่ยว ๆ กว้างเกินขนาดหน้าจอ */
  min-width: 100%;

  object-fit: cover; /* หรือใช้ cover ก็ได้ตามความชอบ แต่ contain จะโชว์สัดส่วนรูปเต็ม ๆ */
  display: block;

  transition:
    transform 0.7s ease,
    filter 0.5s ease;
}

.citem:hover .cimg {
  transform: scale(1.05);
  filter: brightness(0.48) saturate(0.62);
}

.cbody {
  padding: 12px;
}

.cname {
  width: 100%;
  max-width: 500px;
  text-transform: uppercase;
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.ccnt {
  width: 100%;
  max-width: 400px;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

@media (max-width: 767px) {
  .coll-sec {
    padding: 2rem 0 0;
    margin-bottom: 20px;
  }

  .ctrack {
    margin-top: 1rem;
    scroll-padding: 0 1.5rem;
  }

  .citem {
    flex: 0 0 82vw !important;
    width: 82vw !important;
  }

  .cimg-wrap {
    height: 220px !important;
    width: 100% !important;
  }

  .cimg {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  .ccnt {
    width: 100%;
  }
}
</style>
