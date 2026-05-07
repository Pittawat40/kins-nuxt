<template>
  <div class="view-wrap">
    <section class="section-card">
      <div class="section-head">
        <div>
          <h3 class="section-title"><i class="bi bi-person me-2" />Contact</h3>
          <p class="section-sub">ข้อมูลติดต่อที่แสดงในส่วนหน้าเว็บ</p>
        </div>
      </div>
      <div v-if="contactLoading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm" role="status" />
      </div>

      <div v-else class="contact-layout">
        <!-- ── Email ── -->
        <div class="contact-block">
          <div class="contact-block-header">
            <span><i class="bi bi-envelope me-2" />Email</span>
          </div>
          <div class="contact-block-body">
            <div class="form-field">
              <label>อีเมล</label>
              <input
                v-model="contactForm.email"
                type="email"
                placeholder="กรอกอีเมล"
                class="field-input"
                @input="contactErrors.email = ''"
              />
              <small v-if="contactErrors.email" class="field-error">
                {{ contactErrors.email }}
              </small>
            </div>
          </div>
        </div>

        <!-- ── Phone Numbers ── -->
        <div class="contact-block">
          <div class="contact-block-header">
            <span><i class="bi bi-telephone me-2" />Phone</span>
            <button
              v-if="contactForm.phones.length < 3"
              class="contact-add-btn"
              @click="addPhone"
            >
              <i class="bi bi-plus-lg" /> เพิ่มเบอร์
            </button>
          </div>
          <div class="contact-block-body">
            <div
              v-for="(phone, idx) in contactForm.phones"
              :key="idx"
              class="contact-row"
            >
              <div class="contact-row-num">{{ idx + 1 }}</div>
              <div class="form-field" style="flex: 1">
                <label>ชื่อ / ผู้ติดต่อ</label>
                <input
                  v-model="phone.name"
                  type="text"
                  placeholder="กรอกข้อมูล"
                  class="field-input"
                  @input="clearPhoneError(idx, 'name')"
                />
                <small
                  v-if="contactErrors.phones[idx]?.name"
                  class="field-error"
                >
                  {{ contactErrors.phones[idx].name }}
                </small>
              </div>
              <div class="form-field" style="flex: 1">
                <label>เบอร์โทร</label>
                <input
                  v-model="phone.number"
                  type="tel"
                  placeholder="กรอกข้อมูล"
                  class="field-input"
                  @input="clearPhoneError(idx, 'number')"
                />
                <small
                  v-if="contactErrors.phones[idx]?.number"
                  class="field-error"
                >
                  {{ contactErrors.phones[idx].number }}
                </small>
              </div>
              <button
                class="contact-remove-btn"
                :disabled="contactForm.phones.length <= 1"
                @click="removePhone(idx)"
              >
                <i class="bi bi-trash3" />
              </button>
            </div>
            <div v-if="contactForm.phones.length === 0" class="contact-empty">
              <i class="bi bi-telephone-x" />
              <span>ยังไม่มีเบอร์โทร — กด "เพิ่มเบอร์" เพื่อเริ่มต้น</span>
            </div>
          </div>
        </div>

        <!-- ── Social Links ── -->
        <div class="contact-block">
          <div class="contact-block-header">
            <span><i class="bi bi-share me-2" />Social Media</span>
          </div>
          <div class="contact-block-body social-grid">
            <div
              v-for="social in socialFields"
              :key="social.key"
              class="form-field"
            >
              <label>
                <i :class="social.icon" class="me-1" />{{ social.label }}
              </label>
              <div class="social-input-wrap">
                <input
                  v-model="contactForm.socials[social.key]"
                  type="text"
                  :placeholder="social.placeholder"
                  class="field-input social-field"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ── Save ── -->
        <div class="contact-save-row">
          <button
            class="btn-primary btn"
            style="min-width: 160px"
            :disabled="contactSaving"
            @click="saveContact"
          >
            <span
              v-if="contactSaving"
              class="spinner-border spinner-border-sm me-1"
            />
            Update
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

const props = defineProps({
  contactApi: { type: Object, required: true },
  showToast: { type: Function, required: true },
});

// ── Social field definitions ──────────────────────────
const socialFields = [
  {
    key: "facebook",
    label: "Facebook",
    icon: "bi bi-facebook",
    prefix: "facebook.com/",
    placeholder: "URL",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "bi bi-instagram",
    prefix: "instagram.com/",
    placeholder: "URL",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "bi bi-youtube",
    prefix: "youtube.com/",
    placeholder: "URL",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: "bi bi-tiktok",
    prefix: "tiktok.com/",
    placeholder: "URL",
  },
];

// ── State ─────────────────────────────────────────────
const contactLoading = ref(false);
const contactSaving = ref(false);

const contactForm = reactive({
  email: "",
  phones: [{ name: "", number: "" }],
  socials: { facebook: "", instagram: "", youtube: "", tiktok: "" },
});

const contactErrors = reactive({ email: "", phones: [] });

// ── Helpers ───────────────────────────────────────────
function addPhone() {
  contactForm.phones.push({ name: "", number: "" });
}
function removePhone(idx) {
  contactForm.phones.splice(idx, 1);
}
function clearPhoneError(idx, field) {
  if (contactErrors.phones[idx]) contactErrors.phones[idx][field] = "";
}

function validateContact() {
  let valid = true;
  contactErrors.email = "";
  contactErrors.phones = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (contactForm.email && !emailRegex.test(contactForm.email)) {
    contactErrors.email = "อีเมลไม่ถูกต้อง";
    valid = false;
  }

  const phoneRegex = /^[0-9]{9,10}$/;
  contactForm.phones.forEach((p, i) => {
    contactErrors.phones[i] = { name: "", number: "" };
    if (!p.name?.trim()) {
      contactErrors.phones[i].name = "กรุณากรอกข้อมูล";
      valid = false;
    }
    const raw = (p.number || "").replace(/-/g, "");
    if (!raw) {
      contactErrors.phones[i].number = "กรุณากรอกข้อมูล";
      valid = false;
    } else if (!phoneRegex.test(raw)) {
      contactErrors.phones[i].number = "เบอร์โทรต้องเป็นตัวเลข 9–10 หลัก";
      valid = false;
    }
  });

  return valid;
}

// ── API calls ─────────────────────────────────────────
async function fetchContact() {
  contactLoading.value = true;
  try {
    const res = await props.contactApi.get();
    if (res?.data) {
      contactForm.email = res.data.email ?? "";
      contactForm.phones = res.data.phones?.length
        ? res.data.phones
        : [{ name: "", number: "" }];
      contactForm.socials = {
        facebook: res.data.socials?.facebook ?? "",
        instagram: res.data.socials?.instagram ?? "",
        youtube: res.data.socials?.youtube ?? "",
        tiktok: res.data.socials?.tiktok ?? "",
      };
    }
  } catch (e) {
    props.showToast(e.message || "โหลด contact ไม่ได้", "error");
  } finally {
    contactLoading.value = false;
  }
}

async function saveContact() {
  if (!validateContact()) return;
  contactSaving.value = true;
  try {
    await props.contactApi.update({
      email: contactForm.email.trim(),
      phones: contactForm.phones
        .filter((p) => p.name.trim() || p.number.trim())
        .map((p) => ({ name: p.name.trim(), number: p.number.trim() })),
      socials: {
        facebook: (contactForm.socials.facebook || "").trim(),
        instagram: (contactForm.socials.instagram || "").trim(),
        youtube: (contactForm.socials.youtube || "").trim(),
        tiktok: (contactForm.socials.tiktok || "").trim(),
      },
    });
    props.showToast("อัพเดทเรียบร้อยแล้ว");
  } catch (e) {
    console.log(e, "sss");
    props.showToast(e.message || "อัพเดทไม่ได้", "error");
  } finally {
    contactSaving.value = false;
  }
}

onMounted(fetchContact);
</script>

<style scoped>
.btn {
  display: block !important;
}

.contact-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}
.contact-block {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}
.contact-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #f9f9f7;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}
.contact-block-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.contact-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #f9f9f7;
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.2s;
}
.contact-row:hover {
  border-color: #ccc;
}
.contact-row-num {
  margin-top: 28px;
  width: 24px;
  height: 24px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.contact-remove-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 7px;
  color: var(--danger);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  align-self: center;
  margin-top: 20px;
  transition: all 0.18s;
}
.contact-remove-btn:hover:not(:disabled) {
  border-color: var(--danger);
  background: #fff5f5;
}
.contact-remove-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.contact-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent);
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 6px 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.18s;
}
.contact-add-btn:hover {
  background: #dce8ff;
}
.contact-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
  padding: 20px 0 10px;
}
.contact-save-row {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 8px;
}
/* Social grid */
.social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.social-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.2s;
}
.social-input-wrap:focus-within {
  border-color: var(--accent);
}
.social-prefix {
  padding: 9px 10px;
  font-size: 11.5px;
  color: var(--muted);
  background: #f4f4f2;
  border-right: 1px solid var(--border);
  white-space: nowrap;
  flex-shrink: 0;
}
.social-field {
  border: none !important;
  border-radius: 0 !important;
  outline: none;
  flex: 1;
  padding: 9px 12px;
  font-family: inherit;
  font-size: 13.5px;
  color: var(--ink);
  background: transparent;
}
.form-field {
  display: flex;
  flex-direction: column;
}
.form-field label {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 5px;
}
.field-input {
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 9px 12px;
  font-family: inherit;
  font-size: 13.5px;
  color: var(--ink);
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.field-input:focus {
  border-color: var(--accent);
}
.field-error {
  color: var(--danger, #e53e3e);
  font-size: 12px;
  margin-top: 4px;
  margin-left: 2px;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 7px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #1e4ad4;
}
.btn-primary:disabled {
  opacity: 0.65;
  pointer-events: none;
}
.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .social-grid {
    grid-template-columns: 1fr;
  }
  .contact-row {
    flex-wrap: wrap;
  }
}
</style>
