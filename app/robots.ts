import type { MetadataRoute } from "next";

// Seluruh situs adalah aplikasi internal, jadi mesin pencari diminta tidak merayapi halaman apa pun.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
