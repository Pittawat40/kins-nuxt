/**
 * useSiteData
 * Central data store — edit content here, UI updates automatically.
 */

import img1 from "@/assets/images/1.jpg";
import img2 from "@/assets/images/2.jpg";
import img3 from "@/assets/images/3.jpg";
import img4 from "@/assets/images/4.jpg";
import img5 from "@/assets/images/5.jpg";

export function useSiteData() {
  // ── Hero slides ──────────────────────────────────────────────────────────
  const heroSlides = [
    { id: 1, image: img5, alt: "" },
    { id: 2, image: img2, alt: "" },
    { id: 3, image: img4, alt: "" },
    { id: 4, image: img1, alt: "" },
  ];

  // ── contentTitle ──────────────────────────────────────────────────────────
  const contentTitle = [{ id: 1, image: img3, alt: "" }];

  // ── Footer nav ────────────────────────────────────────────────────────────
  const footerLinks = {
    discover: [
      { label: "Hotels", href: "/hotels?page=1" },
      { label: "Real Estate", href: "/real-estate?page=1" },
      { label: "Travel", href: "/travel?page=1" },
      { label: "Lifestyle", href: "/lifestyle?page=1" },
    ],
  };

  // ── Social links ──────────────────────────────────────────────────────────
  const socials = [
    { label: "Facebook", href: "#", icon: "bi bi-facebook" },
    { label: "Instagram", href: "#", icon: "bi bi-instagram" },
    { label: "TikTok", href: "#", type: "tiktok" },
    { label: "YouTube", href: "#", icon: "bi bi-youtube" },
  ];

  return { heroSlides, contentTitle, footerLinks, socials };
}
