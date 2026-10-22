"use server";

import { DUMMY_ACCOUNTS, findAccountById } from "@/lib/auth";
import { getCurrentAccount } from "@/lib/session";

// Ambil data akun lengkap (termasuk password) milik pengguna yang sedang login, hanya di server.
async function currentAccountWithPassword() {
  const account = await getCurrentAccount();
  return findAccountById(account?.id);
}

export type AccountActionResult = {
  error?: string;
  success?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Dummy untuk MVP – password baru belum benar-benar disimpan.
export async function changePassword(input: {
  passwordLama: string;
  passwordBaru: string;
  konfirmasi: string;
}): Promise<AccountActionResult> {
  const account = await currentAccountWithPassword();
  if (!account) return { error: "Sesi berakhir. Silakan masuk kembali." };
  if (input.passwordLama !== account.password) {
    return { error: "Password saat ini salah." };
  }
  if (input.passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }
  if (input.passwordBaru === input.passwordLama) {
    return { error: "Password baru harus berbeda dari password saat ini." };
  }
  if (input.passwordBaru !== input.konfirmasi) {
    return { error: "Konfirmasi password tidak sama." };
  }
  return { success: "Password berhasil diubah." };
}

// Dummy untuk MVP – email belum benar-benar dikirim.
export async function requestEmailChange(input: {
  emailBaru: string;
  password: string;
}): Promise<AccountActionResult> {
  const account = await currentAccountWithPassword();
  if (!account) return { error: "Sesi berakhir. Silakan masuk kembali." };
  const email = input.emailBaru.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }
  if (email === account.email) {
    return { error: "Email baru sama dengan email saat ini." };
  }
  if (DUMMY_ACCOUNTS.some((other) => other.email === email)) {
    return { error: "Email sudah dipakai akun lain." };
  }
  if (input.password !== account.password) {
    return { error: "Password salah." };
  }
  return {
    success: `Tautan verifikasi telah dikirim ke ${email}. Email akan berubah setelah tautan dikonfirmasi.`,
  };
}

// Dummy untuk MVP – akun belum benar-benar dihapus.
export async function requestAccountDeletion(): Promise<AccountActionResult> {
  const account = await currentAccountWithPassword();
  if (!account) return { error: "Sesi berakhir. Silakan masuk kembali." };
  return {
    success: `Email konfirmasi penghapusan akun telah dikirim ke ${account.email}.`,
  };
}
