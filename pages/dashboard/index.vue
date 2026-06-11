<template>
  <div class="dashboard">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo"><span class="logo-text">MENU</span></div>
      </div>
      <SidebarNav
        :current-page="currentPage"
        :active-section="activeSection"
        :nav-items="navItems"
        :section-count="sectionCount"
        @page="handlePage"
        @section="switchSection"
        @logout="handleLogout"
      />
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <ol class="breadcrumb mt-3">
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="handlePage('dashboard')">Dashboard</a>
            </li>
            <li v-if="currentPage === 'content'" class="breadcrumb-item">
              <a href="#" @click.prevent="view = 'list'">{{
                currentNav.label
              }}</a>
            </li>
            <li
              v-if="currentPage === 'content' && view !== 'list'"
              class="breadcrumb-item active show-desktop"
            >
              <a>{{ view === "create" ? "เพิ่มใหม่" : editForm.title }}</a>
            </li>
            <li v-if="currentPage === 'contact'" class="breadcrumb-item active">
              <a>Contact</a>
            </li>
            <li v-if="currentPage === 'ads'" class="breadcrumb-item active">
              <a>Ads Banner</a>
            </li>
          </ol>
        </div>
        <div class="topbar-right">
          <div class="avatar-wrap">
            <div class="avatar">A</div>
            <div class="avatar-info">
              <span class="avatar-name">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <!-- DASHBOARD PAGE -->
      <div v-if="currentPage === 'dashboard'" class="view-wrap">
        <Dashboard
          :banner-api="bannersApi"
          :dashboard-api="dashboardApi"
          :show-toast="showToast"
        />
      </div>

      <!-- CONTENT PAGE -->
      <template v-if="currentPage === 'content'">
        <!-- LIST VIEW -->
        <div v-if="view === 'list'" class="view-wrap">
          <section class="section-card">
            <div class="section-head">
              <div>
                <h3 class="section-title">
                  <i class="bi bi-image me-2" />Banner
                </h3>
                <p class="section-sub">แบนเนอร์หน้า {{ currentNav.label }}</p>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onFileChange"
            />
            <div class="banner-grid">
              <div
                v-if="!currentBanners.length"
                class="banner-dropzone"
                :class="{ dragover: isDragOver }"
                @dragover.prevent="isDragOver = true"
                @dragleave="isDragOver = false"
                @drop.prevent="onDrop"
                @click="triggerUpload"
              >
                <div class="dropzone-inner">
                  <i class="bi bi-cloud-arrow-up" />
                  <p>Drop image or <strong>click to browse</strong></p>
                </div>
              </div>
              <div
                v-for="(banner, i) in currentBanners"
                :key="banner.id || i"
                class="banner-thumb"
              >
                <img :src="resolveBannerUrl(banner.url)" :alt="banner.name" />
                <div class="banner-overlay">
                  <div></div>
                  <div class="banner-actions">
                    <button
                      class="thumb-btn danger"
                      @click="removeBanner(banner)"
                    >
                      <i class="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="section-card">
            <div class="section-head">
              <div>
                <h3 class="section-title">Content List</h3>
                <p class="section-sub">ทั้งหมด {{ meta.total ?? 0 }} รายการ</p>
              </div>
              <div>
                <button class="btn-primary" @click="openCreate">
                  <i class="bi bi-plus-lg me-2" />Add Content
                </button>
                <button class="btn-outline btn-sm ms-2" @click="fetchPosts">
                  <i
                    class="bi bi-arrow-clockwise"
                    :class="{ 'spin-animation': isSpinning }"
                  />
                </button>
              </div>
            </div>
            <div class="list-filters">
              <div class="search-wrap">
                <i class="bi bi-search" />
                <input
                  v-model="search"
                  type="text"
                  placeholder="Search..."
                  @input="onSearchInput"
                />
              </div>
              <select
                v-model="filterStatus"
                class="form-select"
                @change="fetchPosts"
              >
                <option value="">All</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div v-if="listLoading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm" role="status" />
            </div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 44px">
                      <input
                        type="checkbox"
                        v-model="selectAll"
                        @change="toggleAll"
                      />
                    </th>
                    <th style="width: 80px">Image</th>
                    <th>Title</th>
                    <th style="width: 80px">Views</th>
                    <th style="width: 105px">Date</th>
                    <th style="width: 105px">Status</th>
                    <th style="width: 90px">Sort</th>
                    <th style="width: 90px">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="pagedItems.length === 0">
                    <td colspan="8" class="empty-row">
                      <i class="bi bi-inbox" /><br />ยังไม่มีรายการ
                    </td>
                  </tr>
                  <tr
                    v-for="(item, index) in pagedItems"
                    :key="item.id"
                    class="table-row"
                    :class="{ selected: selectedIds.includes(item.id) }"
                  >
                    <td>
                      <input
                        type="checkbox"
                        :checked="selectedIds.includes(item.id)"
                        @change="toggleSelect(item.id)"
                      />
                    </td>
                    <td>
                      <div class="table-img-wrap">
                        <img
                          v-if="item.img"
                          :src="resolveImgUrl(item.img)"
                          :alt="item.title"
                        />
                        <div v-else class="table-img-empty">
                          <i class="bi bi-image" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <router-link
                          :to="`/detail/${item.slug}`"
                          class="item-title"
                          target="_blank"
                        >
                          {{ (page - 1) * perPage + index + 1 }} -
                          {{ item.title }}
                        </router-link>
                      </div>
                      <div class="item-excerpt">
                        {{ stripHtml(item.content) }}
                      </div>
                    </td>
                    <td>
                      <div class="views-cell">
                        <i class="bi bi-eye views-icon" />
                        {{ (item.totalViews ?? 0).toLocaleString() }}
                      </div>
                    </td>
                    <td class="date-cell">{{ item.date }}</td>
                    <td>
                      <span class="status-chip" :class="item.status">{{
                        statusLabel(item.status)
                      }}</span>
                    </td>
                    <td>
                      <div class="action-btns">
                        <button
                          class="act-btn sort-btn"
                          :disabled="index === 0 && page === 1"
                          @click="moveItem(item, 'up')"
                        >
                          <i class="bi bi-chevron-up" />
                        </button>
                        <button
                          class="act-btn sort-btn"
                          :disabled="
                            index === pagedItems.length - 1 &&
                            page === totalPages
                          "
                          @click="moveItem(item, 'down')"
                        >
                          <i class="bi bi-chevron-down" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div class="action-btns">
                        <button class="act-btn edit" @click="openEdit(item)">
                          <i class="bi bi-pencil" />
                        </button>
                        <button
                          class="act-btn delete"
                          @click="confirmDelete(item)"
                        >
                          <i class="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="table-footer">
              <div v-if="selectedIds.length" class="bulk-actions">
                <span>เลือก {{ selectedIds.length }} รายการ</span>
                <button class="bulk-btn" @click="confirmDelete('all')">
                  ลบที่เลือก
                </button>
                <button class="bulk-btn" @click="bulkStatus('published')">
                  Published
                </button>
              </div>
              <div v-else class="pagination">
                <button
                  class="page-btn"
                  :disabled="page <= 1"
                  @click="prevPage"
                >
                  <i class="bi bi-chevron-left" />
                </button>
                <span class="page-info"
                  >หน้า {{ page }} / {{ totalPages }}</span
                >
                <button
                  class="page-btn"
                  :disabled="page >= totalPages"
                  @click="nextPage"
                >
                  <i class="bi bi-chevron-right" />
                </button>
                <select
                  v-model="perPage"
                  class="form-select"
                  style="width: auto"
                  @change="onLimitChange"
                >
                  <option :value="10">10 / หน้า</option>
                  <option :value="20">20 / หน้า</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <!-- CREATE / EDIT VIEW — now a separate component -->
        <ContentEditor
          v-else
          ref="contentEditorRef"
          :view="view"
          :initial-form="editForm"
          :save-loading="saveLoading"
          :upload-image-file="uploadImageFile"
          :resolve-img-url="resolveImgUrl"
          :show-toast="showToast"
          @back="view = 'list'"
          @save="saveItem"
        />
      </template>

      <!-- ADS PAGE -->
      <div v-if="currentPage === 'ads'" class="view-wrap">
        <AdsBannerPage
          :posts-api="postsApi"
          :ads-api="adsApi"
          :show-toast="showToast"
        />
      </div>

      <!-- CONTACT PAGE -->
      <div v-if="currentPage === 'contact'" class="view-wrap">
        <ContactPage :contact-api="contactApi" :show-toast="showToast" />
      </div>
    </main>

    <!-- DELETE MODAL -->
    <DeleteModal
      v-if="deleteTarget"
      :target="deleteTarget"
      @cancel="deleteTarget = null"
      @confirm="checkDelete"
    />

    <!-- TOAST -->
    <Toast :toast="toast" />
  </div>
</template>

<script setup>
useHead({ title: "Dashboard - KIN'S" });

import { ref, reactive, computed, watch, nextTick } from "vue";
import Dashboard from "../../components/Dashboard.vue";
import ContentEditor from "../../components/ContentEditor.vue";

definePageMeta({ middleware: "bo-auth" });

const router = useRouter();
const {
  auth,
  posts: postsApi,
  banners: bannersApi,
  dashboard: dashboardApi,
  contact: contactApi,
  ads: adsApi,
} = useApi();

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, "");

// ── Nav ──────────────────────────────────────────────
const sidebarCollapsed = ref(false);
const activeSection = ref("hotels");
const navItems = [
  { key: "hotels", label: "Hotels", icon: "bi-building" },
  { key: "realestate", label: "Real Estate", icon: "bi-house-door" },
  { key: "travel", label: "Travel", icon: "bi-airplane" },
  { key: "lifestyle", label: "Lifestyle", icon: "bi-stars" },
];
const currentNav = computed(() =>
  navItems.find((n) => n.key === activeSection.value),
);
const sectionCount = reactive({
  hotels: 0,
  realestate: 0,
  travel: 0,
  lifestyle: 0,
});
const currentPage = ref("dashboard");

function handlePage(page) {
  currentPage.value = page;
}

async function switchSection(key) {
  currentPage.value = "content";
  activeSection.value = key;
  view.value = "list";
  search.value = "";
  filterStatus.value = "";
  selectedIds.value = [];
  selectAll.value = false;
  page.value = 1;
  await Promise.all([fetchPosts(), fetchBanners()]);
}

// ── Image URL helpers ────────────────────────────────
function resolveImgUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
function resolveBannerUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
async function uploadImageFile(file) {
  return postsApi.uploadImage(activeSection.value, file);
}

// ── Posts ────────────────────────────────────────────
const pagedItems = ref([]);
const meta = ref({ total: 0, page: 1, limit: 8, totalPages: 1 });
const listLoading = ref(false);
const saveLoading = ref(false);
const search = ref("");
const filterStatus = ref("");
const page = ref(1);
const perPage = ref(10);
const isSpinning = ref(false);
const totalPages = computed(() => meta.value.totalPages ?? 1);

let searchTimer = null;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    fetchPosts();
  }, 400);
}

function onLimitChange() {
  page.value = 1;
  fetchPosts();
}

async function moveItem(item, direction) {
  try {
    await postsApi.move(activeSection.value, item.id, direction);
    await fetchPosts();
  } catch (e) {
    showToast(e.message || "เรียงลำดับไม่สำเร็จ", "error");
  }
}

async function fetchPosts() {
  listLoading.value = true;
  isSpinning.value = true;
  try {
    const params = { page: page.value, limit: perPage.value };
    if (search.value) params.search = search.value;
    if (filterStatus.value) params.status = filterStatus.value;
    const res = await postsApi.list(activeSection.value, params);
    pagedItems.value = res.data;
    pagedItems.value = res.data.map((p) => ({
      ...p,
      slug: slugify(p.title),
    }));
    meta.value = res.meta;
    // sectionCount[activeSection.value] = res.meta.total;
  } catch (e) {
    showToast(e.message || "โหลดข้อมูลไม่ได้", "error");
  } finally {
    listLoading.value = false;
    setTimeout(() => {
      isSpinning.value = false;
    }, 500);
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchPosts();
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    fetchPosts();
  }
}

async function fetchAllSectionCounts() {
  for (const item of navItems) {
    try {
      const res = await postsApi.list(item.key, { page: 1, limit: 1 });
      sectionCount[item.key] = res.meta.total;
    } catch {}
  }
}

// ── Banners ──────────────────────────────────────────
const bannersBySection = reactive({
  hotels: [],
  realestate: [],
  travel: [],
  lifestyle: [],
});
const currentBanners = computed(() => bannersBySection[activeSection.value]);
const isDragOver = ref(false);
const fileInput = ref(null);

async function fetchBanners() {
  try {
    const res = await bannersApi.list(activeSection.value);
    bannersBySection[activeSection.value] = res.data;
  } catch (e) {
    console.error("banner fetch error", e);
  }
}
function triggerUpload() {
  fileInput.value?.click();
}
async function onFileChange(e) {
  const f = e.target.files[0];
  if (f) await uploadBanner(f);
  e.target.value = "";
}
async function onDrop(e) {
  isDragOver.value = false;
  const f = e.dataTransfer.files[0];
  if (f) await uploadBanner(f);
}
async function uploadBanner(file) {
  try {
    await bannersApi.upload(activeSection.value, file);
    await fetchBanners();
    showToast("อัพโหลด banner แล้ว");
  } catch (e) {
    showToast(e.message || "อัพโหลดไม่ได้", "error");
  }
}
async function removeBanner(banner) {
  try {
    await bannersApi.delete(activeSection.value, banner.id);
    await fetchBanners();
    showToast("ลบ banner แล้ว");
  } catch (e) {
    showToast(e.message || "ลบไม่ได้", "error");
  }
}

// ── Selection ────────────────────────────────────────
const selectedIds = ref([]);
const selectAll = ref(false);
function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id);
  idx === -1 ? selectedIds.value.push(id) : selectedIds.value.splice(idx, 1);
}
function toggleAll(e) {
  selectedIds.value = e.target.checked ? pagedItems.value.map((i) => i.id) : [];
}
async function bulkDelete() {
  try {
    await postsApi.bulkDelete(activeSection.value, selectedIds.value);
    selectedIds.value = [];
    selectAll.value = false;
    deleteTarget.value = null;
    showToast("ลบรายการที่เลือกแล้ว");
    await fetchPosts();
  } catch (e) {
    showToast(e.message, "error");
  }
}
async function bulkStatus(status) {
  try {
    await postsApi.bulkStatus(activeSection.value, selectedIds.value, status);
    selectedIds.value = [];
    selectAll.value = false;
    showToast("อัพเดทสถานะแล้ว");
    await fetchPosts();
  } catch (e) {
    showToast(e.message, "error");
  }
}

// ── View & Form ──────────────────────────────────────
const view = ref("list");
const contentEditorRef = ref(null);

const blankForm = () => ({
  id: null,
  title: "",
  description: "",
  content: "",
  img: null,
  bannerImg: null,
  status: "published",
  date: new Date().toISOString().slice(0, 10),
});
const editForm = reactive(blankForm());

function openCreate() {
  Object.assign(editForm, blankForm());
  view.value = "create";
  nextTick(() => contentEditorRef.value?.initBlocks(""));
}

function openEdit(item) {
  Object.assign(editForm, JSON.parse(JSON.stringify(item)));
  view.value = "edit";
  nextTick(() => contentEditorRef.value?.initBlocks(item.content));
}

async function saveItem(formData) {
  if (!formData.title.trim()) {
    showToast("กรุณากรอกข้อมูล", "error");
    return;
  }
  if (!formData.img) {
    showToast("กรุณาอัปโหลดรูปภาพ", "error");
    return;
  }
  saveLoading.value = true;
  try {
    const content = (formData.content || "").replace(
      /<img\b(?![^>]*\bloading=)([^>]*)>/gi,
      '<img$1 loading="lazy" decoding="async">',
    );

    const payload = {
      title: formData.title,
      description: formData.description,
      content: content,
      img: formData.img,
      bannerImg: formData.bannerImg,
      status: formData.status,
      date: formData.date,
    };
    if (view.value === "create") {
      await postsApi.create(activeSection.value, payload);
      showToast("เพิ่มรายการใหม่แล้ว");
    } else {
      await postsApi.update(activeSection.value, formData.id, payload);
      showToast("อัพเดทเรียบร้อยแล้ว");
    }
    view.value = "list";
    await fetchPosts();
  } catch (e) {
    showToast(e.message || "บันทึกไม่ได้", "error");
  } finally {
    saveLoading.value = false;
  }
}

// ── Delete ───────────────────────────────────────────
const deleteTarget = ref(null);
function confirmDelete(item) {
  deleteTarget.value = item;
}
function checkDelete() {
  deleteTarget.value === "all" ? bulkDelete() : doDelete();
}
async function doDelete() {
  try {
    await postsApi.delete(activeSection.value, deleteTarget.value.id);
    deleteTarget.value = null;
    selectedIds.value = [];
    showToast("ลบรายการแล้ว");
    await fetchPosts();
  } catch (e) {
    showToast(e.message, "error");
  }
}

function stripHtml(html) {
  const t = (html || "").replace(/<[^>]*>/g, "");
  return t.length > 75 ? t.slice(0, 75) + "..." : t;
}
function statusLabel(s) {
  return { published: "Published", unpublished: "Unpublished" }[s] || s;
}

// ── Toast ────────────────────────────────────────────
const toast = reactive({ show: false, msg: "", type: "success" });
function showToast(msg, type = "success") {
  Object.assign(toast, { msg, type, show: true });
  setTimeout(() => {
    toast.show = false;
  }, 3000);
}

async function handleLogout() {
  await auth.logout();
  router.push("/admin");
}

// ── Init ─────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchPosts()]);
  fetchAllSectionCounts();
});
</script>

<style scoped>
/* all original styles — mg-* removed since they now live in ContentEditor.vue */
.dashboard {
  background: #f0f0ec;
  color: #1c1b18;
  display: flex;
  min-height: 100vh;
}
.views-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}
.views-icon {
  font-size: 12px;
  color: var(--muted);
}
.sidebar {
  width: var(--sw);
  background: var(--ink);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 50;
  transition: width 0.25s ease;
  overflow: hidden;
}
.sidebar.collapsed {
  width: var(--sc);
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 64px;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  white-space: nowrap;
}
.logo-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
.main-content {
  flex: 1;
  margin-left: var(--sw);
  transition: margin-left 0.25s;
  min-height: 100vh;
  padding-bottom: 56px;
  display: flex;
  flex-direction: column;
}
.topbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 26px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
}
.breadcrumb {
  display: flex;
  list-style: none;
  gap: 0;
  font-size: 12px;
  padding: 0;
}
.breadcrumb-item a {
  color: var(--muted);
  text-decoration: none;
}
.breadcrumb-item a:hover {
  color: var(--accent);
}
.breadcrumb-item.active {
  color: var(--accent);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}
.avatar {
  width: 34px;
  height: 34px;
  background: var(--accent);
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  display: block;
}
.d-none {
  display: none;
}
.list-filters {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 7px 12px;
  background: #fff;
  flex: 1;
  min-width: 80%;
}
.search-wrap .bi {
  color: var(--muted);
  font-size: 13px;
}
.search-wrap input {
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  width: 100%;
  background: transparent;
}
.item-title {
  font-weight: 500;
  color: var(--accent);
  margin-bottom: 3px;
  line-height: 1.3;
}
.item-excerpt {
  font-size: 12px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.date-cell {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}
.table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 0 0;
}
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.bulk-btn {
  border: 1px solid var(--border);
  background: #fff;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.bulk-btn:hover {
  border-color: var(--ink);
}
.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-info {
  font-size: 12.5px;
  color: var(--muted);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .sidebar {
    width: var(--sc) !important;
  }
  .sidebar .logo-text,
  .sidebar .nav-label,
  .sidebar .nav-badge,
  .sidebar .nav-group-label {
    display: none;
  }
  .main-content {
    margin-left: var(--sc) !important;
    width: calc(100% - var(--sc));
    padding-bottom: 14px;
  }
  .list-filters {
    margin-top: 10px;
    flex-direction: column;
  }
  .item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .search-wrap {
    min-width: 100%;
  }
  .topbar {
    padding: 0 12px;
  }
  .item-excerpt {
    display: none;
  }
}
</style>
