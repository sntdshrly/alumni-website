// Helper kontak alumni: nomor WhatsApp dan tautan media sosial.

export type SocialPlatform = "linkedin" | "instagram" | "tiktok";

const socialBaseUrl: Record<SocialPlatform, string> = {
  linkedin: "https://www.linkedin.com/in/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/@",
};

// Prefix yang ditampilkan di depan input, sesuai cara username biasa ditulis.
export const socialInputPrefix: Record<SocialPlatform, string> = {
  linkedin: "linkedin.com/in/",
  instagram: "@",
  tiktok: "@",
};

// Menerima username, "@username", atau URL profil lengkap, lalu menyimpan username-nya saja.
export function normalizeSocialHandle(platform: SocialPlatform, input: string) {
  const value = input.trim();
  const patterns: Record<SocialPlatform, RegExp> = {
    linkedin: /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\//i,
    instagram: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i,
    tiktok: /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?/i,
  };
  return value
    .replace(patterns[platform], "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .replace(/\s+/g, "");
}

export function socialUrl(platform: SocialPlatform, handle: string) {
  return `${socialBaseUrl[platform]}${encodeURIComponent(handle)}`;
}

export function socialLabel(platform: SocialPlatform, handle: string) {
  return platform === "linkedin" ? `linkedin.com/in/${handle}` : `@${handle}`;
}

// Mengubah nomor lokal (08xx) menjadi format internasional (628xx) yang dipakai wa.me.
export function toWhatsAppNumber(telepon: string) {
  const digits = telepon.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

// Nama panggilan diambil dari kata pertama nama lengkap, misalnya "Alya Putri" → "Alya".
export function namaPanggilan(nama: string) {
  return nama.trim().split(/\s+/)[0] ?? "";
}

export type DataPembaruan = {
  nama: string;
  email: string;
  linkedin: string;
  instagram: string;
  tiktok: string;
  statusSetelahLulus: string;
  // Nama perguruan tinggi / institusi; kosong bila tidak ada.
  institusi: string;
  programStudi: string;
  jabatan: string;
  tempatKerja: string;
};

function akunAtauKosong(platform: SocialPlatform, handle: string) {
  return handle ? socialLabel(platform, handle) : "(belum ada)";
}

// Template pesan pembaruan data yang otomatis terisi saat chat WhatsApp dibuka.
// Data yang tercatat disebutkan satu per satu agar alumni mudah mengecek bagian mana yang berubah.
export function pesanPembaruanData(data: DataPembaruan) {
  const status = (
    data.statusSetelahLulus === "Wirausaha"
      ? [
          data.statusSetelahLulus,
          data.jabatan && `di bidang ${data.jabatan}`,
          data.tempatKerja && `(${data.tempatKerja})`,
        ]
      : data.statusSetelahLulus === "Bekerja"
      ? [
          data.statusSetelahLulus,
          data.jabatan && `sebagai ${data.jabatan}`,
          data.tempatKerja && `di ${data.tempatKerja}`,
        ]
      : [
          data.statusSetelahLulus,
          data.institusi && `di ${data.institusi}`,
          data.programStudi && `(${data.programStudi})`,
        ]
  )
    .filter(Boolean)
    .join(" ");

  return `Halo, ${namaPanggilan(data.nama)}! 👋

Semoga dalam keadaan sehat ya. Kami sebagai admin Alumni Tracking Systems ingin memastikan apakah data kamu saat ini sudah yang paling baru atau belum. Berikut data yang kami punya:

• Email: ${data.email || "(belum ada)"}
• Media sosial:
   - LinkedIn: ${akunAtauKosong("linkedin", data.linkedin)}
   - Instagram: ${akunAtauKosong("instagram", data.instagram)}
   - TikTok: ${akunAtauKosong("tiktok", data.tiktok)}
• Status setelah lulus: ${status}

Jika ada yang berubah atau belum lengkap, mohon balas pesan ini dengan data terbarunya ya. Data ini sangat penting bagi kami untuk menjaga hubungan dan juga monitoring perkembangan karier/studi. Terima kasih banyak atas waktu dan bantuannya ya! 🙏😊`;
}

// Memakai api.whatsapp.com/send secara langsung: link wa.me dialihkan ke sana dan
// pengalihan itu merusak emoji (berubah menjadi karakter �).
export function whatsappUrl(telepon: string, pesan?: string) {
  const base = `https://api.whatsapp.com/send?phone=${toWhatsAppNumber(telepon)}`;
  return pesan ? `${base}&text=${encodeURIComponent(pesan)}` : base;
}
