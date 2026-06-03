<template>
  <section
    class="coll-sec"
    id="collections"
    ref="sectionRef"
    :class="{ 'is-visible': isVisible }"
  >
    <div class="container-fluid px-3 px-lg-5">
      <div class="d-flex align-items-end justify-content-between">
        <div class="animate-text">
          <span class="sec-rule" />
          <h2 class="t-h2" style="color: var(--ink-muted)">
            Explore Our Lastest Stories
          </h2>
        </div>
      </div>
    </div>

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
        class="citem animate-card"
        :style="{ '--delay': i }"
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
import { ref, onMounted, onUnmounted } from "vue";

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

// ── Scroll Animation Logic ───────────────────────────
const sectionRef = ref(null);
const isVisible = ref(false);
let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          if (sectionRef.value) observer.unobserve(sectionRef.value);
        }
      });
    },
    {
      threshold: 0.15,
    },
  );

  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

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

.animate-text {
  opacity: 0;
  transform: translateX(-50px);
  transition:
    transform 1s cubic-bezier(0.215, 0.61, 0.355, 1),
    opacity 1s ease;
}

.animate-card {
  opacity: 0;
  transition: opacity 0.8s ease;
  transition-delay: calc(var(--delay) * 100ms);
}

.coll-sec.is-visible .animate-text {
  opacity: 1;
  transform: translateX(0);
}

.coll-sec.is-visible .animate-card {
  opacity: 1;
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
  flex: 0 0 auto;
  width: auto;
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
  width: auto;
  height: 100%;
  max-width: 100vw;
  min-width: 100%;
  object-fit: cover;
  display: block;
  transition:
    transform 0.7s ease,
    filter 0.5s ease;
}

.citem:hover .cimg {
  transform: scale(1.05);
  /* filter: brightness(0.48) saturate(0.62); */
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

  .cname {
    font-size: 1rem;
  }

  .ccnt {
    font-size: 0.8rem;
  }
}
</style>
