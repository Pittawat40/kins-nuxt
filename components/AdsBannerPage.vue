<template>
  <div class="ads">
    <div v-if="view === 'list'">
      <section class="section-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">
              <i class="bi bi-badge-ad me-2" />Ads Banner List
            </h3>
            <p class="section-sub">จัดการโฆษณาบนเว็บไซต์ (สูงสุด 5 รูป)</p>
          </div>
          <div>
            <button
              v-if="adsList.length < 5"
              class="btn-primary"
              @click="openCreateAd"
            >
              <i class="bi bi-plus-lg me-2" />Add Ads
            </button>
            <button class="btn-outline btn-sm ms-2" @click="fetchAds">
              <i
                class="bi bi-arrow-clockwise"
                :class="{ 'spin-animation': isSpinning }"
              />
            </button>
          </div>
        </div>

        <div v-if="adsLoading" class="text-center py-4">
          <div class="spinner-border spinner-border-sm" role="status" />
        </div>

        <div v-else class="table-wrap mt-3">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 80px">No</th>
                <th style="width: 150px">Image</th>
                <th>URL Target</th>
                <th style="width: 120px">Clicks</th>
                <th style="width: 120px">Status</th>
                <th style="width: 120px">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="adsList.length === 0">
                <td colspan="6" class="empty-row">
                  <i class="bi bi-inbox" /><br />ยังไม่มีรายการโฆษณา
                </td>
              </tr>
              <tr
                v-for="(ad, index) in adsList"
                :key="ad.id || index"
                class="table-row"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <div
                    class="table-img-wrap"
                    style="width: 200px; height: 80px"
                  >
                    <img
                      v-if="ad.img"
                      :src="resolveImgUrl(ad.img)"
                      :alt="ad.link"
                      style="object-fit: cover"
                    />
                    <div v-else class="table-img-empty">
                      <i class="bi bi-image" />
                    </div>
                  </div>
                </td>
                <td>
                  <a
                    :href="ad.link"
                    target="_blank"
                    class="text-primary text-decoration-none"
                  >
                    {{ ad.link || "ไม่ได้ระบุลิงก์" }}
                  </a>
                </td>
                <td>
                  <div class="clicks-wrap">
                    <i class="bi bi-cursor-fill clicks-icon" />
                    <span class="clicks-count">
                      {{ (ad.total_clicks ?? 0).toLocaleString() }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="status-chip" :class="ad.status || 'published'">
                    {{
                      ad.status === "published" ? "Published" : "Unpublished"
                    }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="act-btn edit" @click="openEditAd(ad)">
                      <i class="bi bi-pencil" />
                    </button>
                    <button class="act-btn delete" @click="confirmDelete(ad)">
                      <i class="bi bi-trash3" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div v-else>
      <section class="section-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">
              {{ view === "create" ? "Add Banner Ads" : "Update Banner Ads" }}
            </h3>
          </div>
          <button class="btn-outline" @click="view = 'list'">
            <i class="bi bi-arrow-left-short me-1" />Back
          </button>
        </div>
        <div class="form-flex gap-3 mt-3">
          <div class="form-side">
            <div class="side-box mt-0">
              <div class="side-box-title">
                รูปภาพโฆษณา
                <span v-if="adImgUploading" class="upload-badge"
                  >กำลังอัปโหลด...</span
                >
              </div>
              <div
                class="img-dropzone"
                style="aspect-ratio: 16/9; height: auto"
                @click="triggerAdImg"
                @dragover.prevent
                @drop.prevent="onAdImgDrop"
              >
                <img
                  v-if="adForm.img"
                  :src="resolveImgUrl(adForm.img)"
                  class="img-preview"
                />
                <div v-else class="img-placeholder">
                  <i class="bi bi-image" />
                  <span>คลิกหรือลากไฟล์ภาพโฆษณามาที่นี่</span>
                  <span>800 × 240 px</span>
                </div>
              </div>
              <input
                ref="adImgInput"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onAdImgChange"
              />
              <button
                v-if="adForm.img"
                class="remove-img-btn"
                @click="adForm.img = null"
              >
                <i class="bi bi-trash3" />
              </button>
            </div>
          </div>
          <div class="form-main">
            <div class="form-field">
              <label>ลิงก์ปลายทาง</label>
              <input
                v-model="adForm.link"
                type="url"
                placeholder="กรอกข้อมูล"
                class="field-input"
              />
            </div>

            <div class="form-field">
              <label>สถานะการแสดงผล</label>
              <select v-model="adForm.status" class="form-select">
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>

            <div class="side-actions mt-3">
              <button
                class="btn-primary btn w-100 py-2"
                :disabled="adSaving"
                @click="saveAd"
              >
                <span
                  v-if="adSaving"
                  class="spinner-border spinner-border-sm me-1"
                />
                {{ view === "create" ? "Create" : "Update" }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- DELETE MODAL -->
    <DeleteModal
      v-if="deleteTarget"
      :target="deleteTarget"
      @cancel="deleteTarget = null"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, "");

const props = defineProps({
  postsApi: { type: Object, required: true },
  adsApi: { type: Object, required: true },
  showToast: { type: Function, required: true },
});

onMounted(() => {
  fetchAds();
});

// ───── NAVIGATION & VIEW STATE ─────
const view = ref("list");

// ───── ADS STATE ─────
const adsList = ref([]);
const adImgUploading = ref(false);
const adSaving = ref(false);
const adsLoading = ref(false);

const adForm = ref({
  img: null,
  link: "",
  status: "published",
});

const adImgInput = ref(null);
const deleteTarget = ref(null);
const isSpinning = ref(false);

function resolveImgUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

// ───── ADS METHODS ─────
function openCreateAd() {
  if (adsList.value.length >= 5) {
    props.showToast("สามารถเพิ่มโฆษณาได้สูงสุด 5 รูป", "error");
    return;
  }
  adForm.value = { img: null, link: "", status: "published" };
  view.value = "create";
}

function openEditAd(ad) {
  adForm.value = { ...ad };
  view.value = "edit";
}

function triggerAdImg() {
  adImgInput.value?.click();
}

async function onAdImgDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file?.type.startsWith("image/")) return;
  adImgUploading.value = true;
  try {
    adForm.value.img = await uploadImageFile(file);
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    adImgUploading.value = false;
  }
}

async function onAdImgChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";
  adImgUploading.value = true;
  try {
    adForm.value.img = await uploadImageFile(file);
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    adImgUploading.value = false;
  }
}

function uploadImageFile(file) {
  return props.postsApi.uploadImage("ads", file);
}

async function saveAd() {
  if (!adForm.value.img || !adForm.value.link) {
    props.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
    return;
  }
  adSaving.value = true;
  try {
    const isFile = adForm.value.img instanceof File;
    if (view.value === "create") {
      if (adsList.value.length >= 5) {
        props.showToast(
          "ไม่สามารถบันทึกได้ เนื่องจากมีโฆษณาครบ 5 รูปแล้ว",
          "error",
        );
        return;
      }
      await props.adsApi.create({
        file: isFile ? adForm.value.img : undefined,
        img: isFile ? undefined : adForm.value.img,
        link: adForm.value.link,
        status: adForm.value.status ?? "published",
      });
      props.showToast("เพิ่มโฆษณาแล้ว", "success");
    } else {
      await props.adsApi.update(adForm.value.id, {
        file: isFile ? adForm.value.img : undefined,
        img: isFile ? undefined : adForm.value.img,
        link: adForm.value.link,
        status: adForm.value.status,
      });
      props.showToast("อัพเดทเรียบร้อยแล้ว", "success");
    }
    await fetchAds();
    view.value = "list";
  } catch (error) {
    props.showToast(error.message || "เกิดข้อผิดพลาดในการบันทึกโฆษณา", "error");
  } finally {
    adSaving.value = false;
  }
}

async function fetchAds() {
  if (isSpinning.value) return;
  adsLoading.value = true;
  isSpinning.value = true;
  try {
    const res = await props.adsApi.list();
    adsList.value = res.data;
  } catch (e) {
    console.error("ads fetch error", e);
  } finally {
    adsLoading.value = false;
    setTimeout(() => {
      isSpinning.value = false;
    }, 500);
  }
}

function confirmDelete(item) {
  deleteTarget.value = item;
}

async function doDelete() {
  try {
    await props.adsApi.delete(deleteTarget.value.id);
    deleteTarget.value = null;
    props.showToast("ลบรายการแล้ว");
    await fetchAds();
  } catch (e) {
    props.showToast(e.message, "error");
  }
}
</script>

<style scoped>
.form-side {
  width: 70%;
}
.form-main {
  width: 30%;
}
.form-flex {
  display: flex;
  justify-content: space-between;
}

.text-primary {
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

/* ── Clicks cell ── */
.clicks-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.clicks-icon {
  color: #6c63ff;
  font-size: 0.85rem;
}
.clicks-count {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text, #1a1a2e);
}

::v-deep .img-dropzone {
  aspect-ratio: 10 / 3 !important;
}

@media (max-width: 768px) {
  .form-flex {
    flex-direction: column;
  }
  .form-side {
    width: 100%;
  }
  .form-main {
    width: 100%;
  }
}
</style>
