<template>
  <section class="coll-sec" id="collections">
    <div
      class="section-banner"
      :style="`background-image: url('${bannerImage}')`"
    >
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
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
}
h2 {
  position: absolute;
  top: 50%;
  left: 50%;
}

@media (max-width: 767px) {
  .section-banner {
    height: 300px;
  }
}
</style>
