// Auth sederhana untuk MVP – akun dummy tanpa database.
// Lihat prd.md bagian 3 "User" dan bagian 20 "Authentication".

export type Role = "admin" | "alumni";

export type DummyAccount = {
  // Disimpan di cookie sesi untuk mengenali akun yang login.
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  // Label role yang ditampilkan ke pengguna.
  roleLabel: string;
  school: string;
  // Hanya untuk role alumni: menghubungkan akun ke data alumni (NIK).
  alumniNik?: string;
};

export const DUMMY_ACCOUNTS: DummyAccount[] = [
  {
    id: "admin",
    email: "superadmin@binus.ac.id",
    password: "password123",
    name: "Admin",
    role: "admin",
    roleLabel: "Super Admin",
    school: "SMA Negeri 1",
  },
  {
    id: "alumni-alya",
    email: "alya.putri@gmail.com",
    password: "alumni123",
    name: "Alya Putri",
    role: "alumni",
    roleLabel: "Alumni",
    school: "SMA Negeri 1",
    alumniNik: "3273050101070001",
  },
];

export const DUMMY_ADMIN = DUMMY_ACCOUNTS[0];

export const SESSION_COOKIE = "alumni_session";

// Halaman awal setelah login untuk masing-masing role.
export const homePathByRole: Record<Role, string> = {
  admin: "/dashboard",
  alumni: "/alumni",
};

export function findAccountById(id: string | undefined) {
  return DUMMY_ACCOUNTS.find((account) => account.id === id);
}

export function findAccountByCredentials(email: string, password: string) {
  return DUMMY_ACCOUNTS.find(
    (account) => account.email === email.trim().toLowerCase() && account.password === password,
  );
}
