export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const { auth } = useApi();
    if (!auth.isLoggedIn()) return navigateTo("/admin");
  }
});
