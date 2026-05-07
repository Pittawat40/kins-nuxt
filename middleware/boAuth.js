export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const token = localStorage.getItem("valeur_token");
    if (!token) return navigateTo("/admin");
  }
});
