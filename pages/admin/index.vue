<template>
  <div class="login-page">
    <div class="login-left">
      <img :src="contentTitle[0].image" alt="cover" class="cover-img" />
      <div class="cover-overlay" />
      <div class="cover-text">
        <span class="cover-label">Memorable Stays</span>
        <h2>Where every journey<br />begins with a story.</h2>
      </div>
    </div>

    <div class="login-right">
      <div class="form-wrap">
        <div class="brand" @click="$router.push('/')">KIN'S</div>

        <div class="form-head">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <div v-if="errorMsg" class="error-alert">
          {{ errorMsg }}
        </div>

        <form class="form" @submit.prevent="handleSubmit">
          <div
            class="field-container"
            :class="{ 'has-error': errors.username }"
          >
            <div
              class="field"
              :class="{ focused: focus.username, filled: form.username }"
            >
              <label>Username</label>
              <input
                v-model="form.username"
                type="text"
                autocomplete="username"
                @focus="focus.username = true"
                @blur="handleBlur('username')"
                @input="validateField('username')"
              />
            </div>
            <span v-if="errors.username" class="field-error-text">
              {{ errors.username }}
            </span>
          </div>

          <div
            class="field-container mt-2"
            :class="{ 'has-error': errors.password }"
          >
            <div
              class="field"
              :class="{ focused: focus.password, filled: form.password }"
            >
              <label>Password</label>
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="current-password"
                @focus="focus.password = true"
                @blur="handleBlur('password')"
                @input="validateField('password')"
              />
              <button
                type="button"
                class="eye-btn"
                @click="showPass = !showPass"
              >
                <svg
                  v-if="!showPass"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-6.5 0-10-8-10-8a17.6 17.6 0 014.22-5.47M9.9 4.24A9.12 9.12 0 0112 4c6.5 0 10 8 10 8a17.6 17.6 0 01-2.34 3.37M3 3l18 18"
                  />
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="field-error-text">
              {{ errors.password }}
            </span>
          </div>

          <button
            :disabled="loading"
            type="submit"
            class="submit-btn"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else class="spinner"></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

useHead({ title: "Admin - KIN'S" });

const { contentTitle } = useSiteData();
const { auth } = useApi();
const router = useRouter();

const form = reactive({ username: "", password: "" });
const focus = reactive({ username: false, password: false });
const showPass = ref(false);
const loading = ref(false);
const errorMsg = ref("");

// ── VALIDATION STATE ─────────────────
const errors = reactive({ username: "", password: "" });
const touched = reactive({ username: false, password: false });

// เช็คว่าปุ่มควรปิดการใช้งานหรือไม่ (ถ้ามีช่องว่าง หรือมี Error ค้างอยู่)
const isFormInvalid = computed(() => {
  return (
    !form.username || !form.password || !!errors.username || !!errors.password
  );
});

// ตรวจสอบข้อมูลรายฟิลด์
function validateField(field) {
  if (!touched[field]) return; // จะเริ่มตรวจก็ต่อเมื่อผู้ใช้เคยโฟกัสฟิลด์นั้นแล้วหลุดออกไป (Touched)

  if (field === "username") {
    if (!form.username.trim()) {
      errors.username = "กรุณากรอกชื่อผู้ใช้";
    } else {
      errors.username = "";
    }
  }

  if (field === "password") {
    if (!form.password) {
      errors.password = "กรุณากรอกรหัสผ่าน";
    } else if (form.password.length < 6) {
      errors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    } else {
      errors.password = "";
    }
  }
}

// เมื่อผู้ใช้เอาเคอร์เซอร์ออกจาก input (Blur) ให้เปลี่ยนสถานะเป็น Touched และตรวจทันที
function handleBlur(field) {
  focus[field] = false;
  touched[field] = true;
  validateField(field);
}

onMounted(() => {
  if (auth.isLoggedIn()) router.push("/dashboard");
});

// ── SUBMIT HANDLER ───────────────────
async function handleSubmit() {
  // มาร์กทุกฟิลด์ว่าเป็น Touched เพื่อบังคับให้ Validate ทั้งหมดก่อนกดส่ง
  touched.username = true;
  touched.password = true;
  validateField("username");
  validateField("password");

  if (errors.username || errors.password) return;

  errorMsg.value = "";
  loading.value = true;
  try {
    await auth.login(form.username, form.password);
    router.push("/dashboard");
  } catch (e) {
    errorMsg.value = e.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  font-weight: 300;
}

/* ── LEFT PANEL ─────────────────────── */
.login-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: none;
}
@media (min-width: 860px) {
  .login-left {
    display: block;
  }
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 9, 7, 0.75) 0%,
    rgba(10, 9, 7, 0.15) 60%,
    transparent 100%
  );
}
.cover-text {
  position: absolute;
  bottom: 52px;
  left: 48px;
  color: #fff;
}
.cover-label {
  display: block;
  font-size: 10px;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 12px;
}
.cover-text h2 {
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 300;
  line-height: 1.25;
  letter-spacing: 0.5px;
}

/* ── RIGHT PANEL ────────────────────── */
.login-right {
  width: 100%;
  max-width: 480px;
  background: #fafaf8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}
@media (min-width: 860px) {
  .login-right {
    width: 440px;
    flex: none;
  }
}

.form-wrap {
  width: 100%;
  max-width: 360px;
}

/* ── BRAND ──────────────────────────── */
.brand {
  cursor: pointer;
  font-size: 24px;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: #1a1814;
  font-weight: 300;
  margin-bottom: 48px;
}

/* ── FORM HEAD ──────────────────────── */
.form-head {
  margin-bottom: 36px;
}
.form-head h1 {
  font-size: 32px;
  font-weight: 400;
  color: #1a1814;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}
.form-head p {
  font-size: 13px;
  color: #888;
  letter-spacing: 0.3px;
}

/* ── ERROR ──────────────────────────── */
.error-alert {
  background: #fff5f5;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 35px;
}

/* ── FORM ───────────────────────────── */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Floating label field */
.field {
  position: relative;
}
.field label {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  font-size: 13px;
  color: #aaa;
  pointer-events: none;
  transition: all 0.22s ease;
  letter-spacing: 0.3px;
}
.field.focused label,
.field.filled label {
  top: 0;
  transform: translateY(-100%) translateY(-4px);
  font-size: 10.5px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #1a1814;
}
.field input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #d8d4cd;
  background: transparent;
  padding: 12px 32px 12px 0;
  font-size: 14.5px;
  font-weight: 400;
  color: #1a1814;
  outline: none;
  transition: border-color 0.22s;
}
.field.focused input {
  border-bottom-color: #1a1814;
}
.field input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 999px #fafaf8 inset;
  -webkit-text-fill-color: #1a1814;
}

/* แถบเส้นด้านล่างเปลี่ยนเป็นสีแดงเมื่อมี Error */
.field-container.has-error .field input {
  border-bottom-color: #dc2626;
}
.field-container.has-error .field label {
  color: #dc2626;
}

/* ข้อความแจ้งเตือน Error ใต้กล่อง Input */
.field-error-text {
  font-size: 11px;
  color: #dc2626;
  margin-top: 2px;
}

.eye-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #aaa;
  transition: color 0.2s;
  display: flex;
}
.eye-btn:hover {
  color: #1a1814;
}
.eye-btn svg {
  width: 17px;
  height: 17px;
}

/* ── SUBMIT ─────────────────────────── */
.submit-btn {
  margin-top: 8px;
  width: 100%;
  padding: 15px;
  background: #1a1814;
  color: #fafaf8;
  border: none;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.25s,
    opacity 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}
.submit-btn:hover {
  background: #2e2a24;
}
.submit-btn:disabled {
  background: #a3a3a3;
  cursor: not-allowed;
  opacity: 0.6;
}

/* spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
