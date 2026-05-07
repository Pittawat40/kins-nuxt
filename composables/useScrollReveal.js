/**
 * useScrollReveal
 * Adds .vis class when elements with .rv / .rvl / .rvs enter viewport.
 * Call once in a page/layout onMounted.
 */
export function useScrollReveal() {
  onMounted(() => {
    const elements = document.querySelectorAll('.rv, .rvl, .rvs')
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.07, rootMargin: '0px 0px -35px 0px' }
    )

    elements.forEach((el) => observer.observe(el))
  })
}
