<template>
  <div
    class="toast-wrap"
    :class="{ show: toast.show, error: toast.type === 'error' }"
  >
    <i
      class="bi me-2"
      :class="
        toast.type === 'error' ? 'bi-x-circle-fill' : 'bi-check-circle-fill'
      "
    />
    {{ toast.msg }}
  </div>
</template>

<script setup>
const props = defineProps({
  toast: { type: Object, required: true },
});
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--green);
  color: #fff;
  padding: 11px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
  pointer-events: none;
  z-index: 9999;
}
.toast-wrap.show {
  opacity: 1;
  transform: translateY(0);
}
.toast-wrap.error {
  background: var(--danger);
}
</style>
