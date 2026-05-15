<template>
  <div>
    <!-- ── NAVBAR ── -->
    <nav
      v-if="
        !route.path.startsWith('/admin') && !route.path.startsWith('/dashboard')
      "
      class="snav"
      :class="{ sc: scrolled }"
      id="snav"
    >
      <div class="container-fluid px-3 px-lg-5">
        <div class="d-flex align-items-center justify-content-between">
          <!-- Desktop nav links -->
          <div class="d-none d-lg-flex align-items-center gap-1">
            <NuxtLink to="/hotels" class="nl">Hotels</NuxtLink>
            <NuxtLink to="/real-estate" class="nl">Real Estate</NuxtLink>
            <NuxtLink to="/travel" class="nl">Travel</NuxtLink>
            <NuxtLink to="/lifestyle" class="nl">Lifestyle</NuxtLink>
          </div>

          <!-- Logo -->
          <!-- <img src="~/assets/images/logo.png" alt="KIN'S" class="logo-img" /> -->
          <h1>
            <NuxtLink to="/" class="logo">KIN'S</NuxtLink>
          </h1>
          <!-- Social + Contact -->
          <div class="d-none d-lg-flex align-items-center gap-3">
            <div class="nsoc">
              <div class="search-box">
                <input
                  v-model="keyword"
                  type="text"
                  class="form-control search-input"
                  :class="{ active: showSearch }"
                  placeholder="Search..."
                  @keydown.enter="onSearch"
                  @blur="showSearch = false"
                />
              </div>
              <a title="search" @click="showSearch = !showSearch"
                ><i class="bi bi-search me-3 search"
              /></a>
              <a
                :href="contactForm?.socials?.facebook"
                target="_blank"
                title="Facebook"
                ><i class="bi bi-facebook"
              /></a>
              <a
                :href="contactForm?.socials?.instagram"
                target="_blank"
                title="Instagram"
                ><i class="bi bi-instagram"
              /></a>
              <a
                :href="contactForm?.socials?.tiktok"
                target="_blank"
                title="TikTok"
                class="nsoc-tiktok"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="14"
                  height="14"
                >
                  <path
                    d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"
                  />
                </svg>
              </a>
              <a
                :href="contactForm?.socials?.youtube"
                target="_blank"
                title="YouTube"
                ><i class="bi bi-youtube"
              /></a>
              <!-- <NuxtLink to="/admin" class="login">login</NuxtLink> -->
            </div>
          </div>

          <!-- Mobile burger -->
          <button
            class="d-lg-none mob-btn"
            @click="mobOpen = true"
            aria-label="Open menu"
          >
            <i class="bi bi-list" />
          </button>
        </div>
      </div>
    </nav>

    <!-- ── MOBILE PANEL ── -->
    <Transition name="mob">
      <div v-if="mobOpen" class="mob-panel">
        <button
          class="mob-close"
          @click="mobOpen = false"
          aria-label="Close menu"
        >
          <i class="bi bi-x-lg" />
        </button>
        <div class="mob-brand">KIN'S</div>
        <NuxtLink to="/hotels" class="mob-link" @click="mobOpen = false"
          >Hotels</NuxtLink
        >
        <NuxtLink to="/real-estate" class="mob-link" @click="mobOpen = false"
          >Real Estate</NuxtLink
        >
        <NuxtLink to="/travel" class="mob-link" @click="mobOpen = false"
          >Travel</NuxtLink
        >
        <NuxtLink to="/lifestyle" class="mob-link" @click="mobOpen = false"
          >Lifestyle</NuxtLink
        >
      </div>
    </Transition>

    <!-- ── PAGE CONTENT ── -->
    <main>
      <slot />
    </main>

    <!-- ── FOOTER ── -->
    <AppFooter
      v-if="
        !route.path.startsWith('/admin') && !route.path.startsWith('/dashboard')
      "
      :contactForm="contactForm"
    />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const scrolled = ref(false);
const mobOpen = ref(false);
const showSearch = ref(false);
const keyword = ref("");

const { posts: postsApi, contact: contactApi, track: trackApi } = useApi();

const contactForm = reactive({
  email: "",
  phones: [{ name: "", number: "" }],
  socials: {},
});

const onSearch = async () => {
  const q = keyword.value?.trim();
  if (!q) return;

  try {
    const res = await postsApi.search(q);
    if (res?.data) {
      const slug = toSlug(res.data.title);
      navigateTo(`/detail/${slug}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    showSearch.value = false;
    keyword.value = "";
  }
};

onMounted(async () => {
  window.addEventListener(
    "scroll",
    () => {
      scrolled.value = window.scrollY > 60;
    },
    { passive: true },
  );
  await fetchContact();
  if (
    !route.path.startsWith("/admin") &&
    !route.path.startsWith("/dashboard")
  ) {
    await trackPageView();
  }
});

async function fetchContact() {
  try {
    const res = await contactApi.get();
    if (res?.data) {
      contactForm.email = res.data.email ?? "";
      contactForm.phones = res.data.phones?.length
        ? res.data.phones
        : [{ name: "", number: "" }];
      contactForm.socials =
        res.data.socials &&
        typeof res.data.socials === "object" &&
        !Array.isArray(res.data.socials)
          ? res.data.socials
          : {};
    }
  } catch (e) {
  } finally {
  }
}

async function trackPageView() {
  try {
    await trackApi.pageView();
  } catch (e) {
    console.log(e);
  }
}

// Lock body scroll when mobile menu open
watch(mobOpen, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
});

function toSlug(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD") // แยก accent (รองรับภาษาอื่น)
    .replace(/[\u0300-\u036f]/g, "") // ลบ accent
    .replace(/[–—]/g, "-") // แปลง dash พิเศษเป็น -
    .replace(/[^\w\s-]/g, "") // ลบอักขระพิเศษ
    .trim()
    .replace(/\s+/g, "-") // space → -
    .replace(/-+/g, "-"); // ลด -- เหลือ -
}
</script>

<style scoped>
/* ── NAVBAR ── */
.login {
  font-size: 0.65rem !important;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted) !important;
  margin-left: 10px;
  padding: 0.3rem 1rem;
}
.search-input {
  font-size: 13px;
  width: 0;
  opacity: 0;
  pointer-events: none;
  transition: all 0.5s ease;
}
.search-input.active {
  width: 180px;
  opacity: 1;
  pointer-events: auto;
}
.snav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 1.4rem 0;
  background: var(--white);
  border-bottom: 1px solid var(--paper-deep);
  transition:
    padding 0.4s,
    box-shadow 0.4s;
}
.snav.sc {
  padding: 1rem 0;
  box-shadow: 0 1px 16px rgba(15, 15, 13, 0.06);
}
.snav a {
  cursor: pointer;
}
.snav .logo {
  /* font-family: var(--font-serif); */
  text-decoration: none;
  font-size: 1.3rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  color: var(--ink);
}
.snav .nl {
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
  padding: 0.3rem 0.8rem;
  transition: color 0.3s;
}
.snav .nl:hover {
  color: var(--ink);
}
.snav .nsoc {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.1rem;
  min-width: 380px;
}
.search {
  border-right: 1px solid;
  margin-right: 20px;
  padding-right: 20px;
}
.snav .nsoc a {
  color: var(--ink-muted);
  font-size: 0.92rem;
  line-height: 1;
  transition: color 0.3s;
}
.snav .nsoc a:hover {
  color: var(--ink);
}
.snav .nsoc-tiktok {
  display: inline-flex;
  align-items: center;
}
.snav .nc {
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
  border: 1px solid rgba(15, 15, 13, 0.3);
  padding: 0.5rem 1.4rem;
  transition: all 0.3s;
}
.snav .nc:hover {
  background: var(--ink);
  color: var(--white);
}
.mob-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--ink);
  padding: 0.3rem;
  display: flex;
  align-items: center;
}

/* ── MOBILE PANEL ── */
.mob-panel {
  position: fixed;
  inset: 0;
  z-index: 1001;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
}
.mob-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--ink-muted);
}
.mob-brand {
  /* font-family: var(--font-serif); */
  font-size: 1.4rem;
  letter-spacing: 0.12em;
  color: var(--ink);
  margin-bottom: 1.5rem;
}
.mob-link {
  /* font-family: var(--font-serif); */
  font-size: 2.4rem;
  font-weight: 300;
  color: var(--ink);
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--paper-deep);
  display: block;
  transition: color 0.3s;
}
.mob-link:hover {
  color: var(--gold);
}

/* ── Transition ── */
.mob-enter-active,
.mob-leave-active {
  transition: opacity 0.3s ease;
}
.mob-enter-from,
.mob-leave-to {
  opacity: 0;
}
</style>
