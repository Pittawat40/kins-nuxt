<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal-box">
      <div class="modal-icon">
        <i class="bi bi-exclamation-triangle-fill" />
      </div>
      <h3>ยืนยันการลบ</h3>

      <p v-if="target === 'all'">ต้องการลบทั้งหมดใช่ไหม?</p>
      <p v-else-if="target">
        ต้องการลบ
        <strong>"{{ target.title || target.name || "รายการนี้" }}"</strong>
        ใช่ไหม?
      </p>

      <div class="modal-actions">
        <button class="btn-outline sm" @click="$emit('cancel')">Cancel</button>
        <button class="btn-danger sm" @click="$emit('confirm')">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  target: {
    type: [Object, String],
    default: null,
  },
});

defineEmits(["cancel", "confirm"]);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 32px 28px;
  max-width: 360px;
  width: 90%;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}
.modal-icon {
  font-size: 34px;
  color: var(--warn);
  margin-bottom: 12px;
}
.modal-box h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 10px;
}
.modal-box p {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.65;
  margin-bottom: 24px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
