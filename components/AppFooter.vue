<template>
  <footer class="foot" id="contact">
    <div class="container-fluid px-3 px-lg-5">
      <div class="row g-5">
        <!-- Brand -->
        <div class="col-12 col-md-9">
          <div class="flogo">KIN'S</div>
          <div class="ftagline">Travel &amp; Lifestyle</div>

          <!-- Social icons -->
          <div class="d-flex gap-3 mt-3 align-items-center flex-wrap">
            <a
              :href="contactForm?.socials?.facebook"
              target="_blank"
              class="soa"
              title="Facebook"
              ><i class="bi bi-facebook"
            /></a>
            <a
              :href="contactForm?.socials?.instagram"
              target="_blank"
              class="soa"
              title="Instagram"
              ><i class="bi bi-instagram"
            /></a>
            <a
              :href="contactForm?.socials?.tiktok"
              target="_blank"
              class="soa soa-tiktok"
              title="TikTok"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path
                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"
                />
              </svg>
            </a>
            <a
              :href="contactForm?.socials?.youtube"
              target="_blank"
              class="soa"
              title="YouTube"
              ><i class="bi bi-youtube"
            /></a>
          </div>
          <div class="fnh mt-4">Contact</div>
          <div class="d-flex flex-column">
            <a
              v-for="phone in contactForm.phones"
              :key="phone.name"
              class="contact"
            >
              {{ phone.name }} : {{ phone.number }}
            </a>
            <a v-if="contactForm.email" class="contact">
              E-mail : {{ contactForm.email }}
            </a>
          </div>
        </div>

        <!-- Discover -->
        <div class="col-12 col-md-3">
          <div class="fnh">Discover</div>
          <NuxtLink
            v-for="link in footerLinks.discover"
            :key="link.label"
            :to="link.href"
            class="fnl"
            >{{ link.label }}</NuxtLink
          >
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="fbar">
        <span class="fcopy">© {{ year }} KIN'S. All rights reserved.</span>
        <span class="fcopy">Designed with intention.</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const { footerLinks } = useSiteData();
const year = new Date().getFullYear();

const props = defineProps({
  contactForm: { type: Object, required: true },
});
</script>

<style scoped>
.foot {
  padding: 4rem 0 2.5rem;
  background: var(--ink);
}
.flogo {
  font-family: var(--font-serif);
  font-size: 1.55rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  color: var(--white);
}
.ftagline {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.27);
  margin-top: 0.25rem;
}

.soa {
  color: rgba(255, 255, 255, 0.32);
  font-size: 0.95rem;
  transition: color 0.3s;
  display: inline-flex;
  align-items: center;
}
.soa:hover {
  color: var(--white);
}
.soa-text {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  font-weight: 400;
}

.contact {
  text-decoration: none;
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.52);
  padding: 0.28rem 0;
  transition: color 0.3s;
  font-weight: 300;
}

.fnh {
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.28);
  margin-bottom: 1.1rem;
}
.fnl {
  text-decoration: none;
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.52);
  padding: 0.28rem 0;
  transition: color 0.3s;
  font-weight: 300;
}
.fnl:hover {
  color: var(--white);
}

.fnewsletter-text {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.28);
  line-height: 1.7;
  margin-bottom: 0.9rem;
  font-weight: 300;
}
.fnewsletter-form {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}
.ni {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--white);
  font-family: var(--font-sans);
  font-size: 0.78rem;
  padding: 0.5rem 0;
  outline: none;
  transition: border-color 0.3s;
}
.ni:focus + .fnewsletter-form {
  border-bottom-color: var(--gold);
}
.ni::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.ni-btn {
  background: transparent;
  border: none;
  color: var(--gold);
  cursor: pointer;
  padding: 0.5rem;
}

.fbar {
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  margin-top: 3rem;
  padding-top: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.fcopy {
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.22);
}
</style>
