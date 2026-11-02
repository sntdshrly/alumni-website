// Konstanta auth yang aman dipakai di proxy maupun server. Data akun ada di database
// (tabel pengguna untuk staf, tabel alumni untuk akun portal alumni).

export type Role = "admin" | "alumni";

export const SESSION_COOKIE = "alumni_session";

// Halaman awal setelah login untuk masing-masing role.
export const homePathByRole: Record<Role, string> = {
  admin: "/dashboard",
  alumni: "/alumni",
};
