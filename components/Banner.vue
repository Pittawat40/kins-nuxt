<template>
  <section class="coll-sec" id="collections">
    <div class="section-banner">
      <img
        :src="bannerImage"
        :alt="textHeader"
        class="banner-img"
        loading="lazy"
        decoding="async"
      />

      <h2 class="t-h2">
        <em style="font-style: italic; color: var(--ink-muted)">
          {{ textHeader }}
        </em>
      </h2>
    </div>
  </section>
</template>

<script setup>
defineProps({
  bannerImage: {
    type: String,
    required: false,
  },
  textHeader: {
    type: String,
    required: false,
  },
});
</script>

<style scoped>
.section-banner {
  margin-top: 60px;
  width: 100%;
  height: 600px;
  position: relative;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

h2 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

@media (max-width: 767px) {
  .section-banner {
    height: 200px;
  }
}
</style>
