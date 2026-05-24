<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="overlay">
        <div class="dialog">
          <div class="icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 7v5l3 3" stroke-linecap="round" />
            </svg>
          </div>
          <div class="d-flex flex-column">
            <h2>Session หมดอายุ</h2>
            <p>กรุณา Login ใหม่เพื่อดำเนินการต่อ</p>
          </div>

          <button class="btn-primary btn w-100" @click="goLogin">Login</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const show = ref(false);
const router = useRouter();

function onTokenExpired() {
  show.value = true;
}

function goLogin() {
  show.value = false;
  router.push("/admin");
}

onMounted(() => {
  window.addEventListener("token-expired", onTokenExpired);
});

onUnmounted(() => {
  window.removeEventListener("token-expired", onTokenExpired);
});
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 9, 7, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog {
  background: #fafaf8;
  width: 100%;
  max-width: 380px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 8px;
}

.icon svg {
  width: 48px;
  height: 48px;
  color: #f60000;
  margin-bottom: 4px;
}

h2 {
  font-size: 20px;
  font-weight: 400;
  color: #1a1814;
  letter-spacing: 0.3px;
}

p {
  font-size: 13px;
  color: #888;
  letter-spacing: 0.3px;
}

button {
  margin-top: 12px;
  width: 100%;
  padding: 14px;
  color: #fafaf8;
  border: none;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.25s;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
