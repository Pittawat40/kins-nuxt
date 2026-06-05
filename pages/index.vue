<template>
  <div>
    <!-- Hero Slideshow -->
    <HeroSlideshow :slides="heroBanners" :interval="5000" />

    <!-- Curated Collections -->
    <CuratedCollections :collections="content" />
  </div>
</template>

<script setup>
useHead({ title: "KIN'S" });
useScrollReveal();

const { posts, banners: bannersApi } = useApi();

const heroBanners = ref([]);
const content = ref([]);

onMounted(async () => {
  await fetchHeroBanners();
  await fetchPosts();
});

async function fetchHeroBanners() {
  try {
    const res = await bannersApi.list("dashboard");
    heroBanners.value = res.data || [];
  } catch (e) {
    console.error("hero banner fetch error", e);
  }
}

async function fetchPosts() {
  try {
    const res = await posts.combined({ status: "published", limit: 20 });

    content.value = res.data.map((p) => ({
      id: p.id,
      slug: slugify(p.title),
      img: p.img || "",
      title: p.title,
      date: p.date,
      content: p.description,
    }));
  } catch (e) {
    console.error("posts fetch error", e);
  }
}
</script>
