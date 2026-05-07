<template>
  <nav class="sidebar-nav">
    <div class="nav-group">
      <span class="nav-group-label">Overview</span>
      <a
        class="nav-item"
        :class="{ active: currentPage === 'dashboard' }"
        @click="$emit('page', 'dashboard')"
      >
        <i class="bi bi-grid-1x2" />
        <span class="nav-label">Dashboard</span>
      </a>
    </div>
    <div class="nav-group">
      <span class="nav-group-label">Content</span>
      <a
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{
          active: currentPage === 'content' && activeSection === item.key,
        }"
        @click="$emit('section', item.key)"
      >
        <i class="bi" :class="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
        <span class="nav-badge">{{ sectionCount[item.key] ?? 0 }}</span>
      </a>
    </div>
    <div class="nav-group">
      <span class="nav-group-label">Marketing</span>
      <a
        class="nav-item"
        :class="{ active: currentPage === 'ads' }"
        @click="$emit('page', 'ads')"
      >
        <i class="bi bi-badge-ad" />
        <span class="nav-label">Ads Banner</span>
      </a>
    </div>
    <div class="nav-group">
      <span class="nav-group-label">System</span>
      <a
        class="nav-item"
        :class="{ active: currentPage === 'contact' }"
        @click="$emit('page', 'contact')"
      >
        <i class="bi bi-person" />
        <span class="nav-label">Contact</span>
      </a>
    </div>
    <div class="nav-group">
      <a class="nav-item" @click="$emit('logout')">
        <i class="bi bi-box-arrow-right" />
        <span class="nav-label">Logout</span>
      </a>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  currentPage: String,
  activeSection: String,
  navItems: Array,
  sectionCount: Object,
});

defineEmits(["page", "section", "logout"]);
</script>

<style scoped>
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  scrollbar-width: none;
}
.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-group-label {
  font-size: 9px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.28);
  padding: 0 8px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
}
.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 7px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
  transition: all 0.18s;
  white-space: nowrap;
  overflow: hidden;
  text-decoration: none;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.85);
}
.nav-item.active {
  background: var(--accent);
  color: #fff;
  font-weight: 500;
}
.nav-item .bi {
  font-size: 15px;
  flex-shrink: 0;
}
.nav-label {
  flex: 1;
}
.nav-badge {
  background: rgba(255, 255, 255, 0.18);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 20px;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 24px;
  text-align: center;
}
.nav-item.active .nav-badge {
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 768px) {
  .sidebar .nav-label,
  .sidebar .nav-badge,
  .sidebar .nav-group-label {
    display: none;
  }
}
</style>
