"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Loader2, Upload, UserRound } from "lucide-react";
import {
  changePassword,
  requestAccountDeletion,
  requestEmailChange,
  type AccountActionResult,
} from "@/app/dashboard/akun/actions";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AccountSettingsProps = {
  nama: string;
  email: string;
  role: string;
  sekolah: string;
  // Keterangan di bawah field role & sekolah (siapa yang bisa mengubahnya).
  roleNote?: string;
};

type DialogKind = "password" | "email" | "delete" | null;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const readOnlyInputClassName = "h-10 bg-slate-50 text-slate-600";

function Notice({ result }: { result: AccountActionResult }) {
  if (result.error) {
    return <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{result.error}</p>;
  }
  if (result.success) {
    return (
      <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
        <CircleCheck className="mt-0.5 size-4 shrink-0" />
        <p>{result.success}</p>
      </div>
    );
  }
  return null;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function AccountSettings({
  nama: initialNama,
  email,
  role,
  sekolah,
  roleNote = "Role dan sekolah hanya dapat diubah oleh Super Admin melalui menu Daftar Pengguna.",
}: AccountSettingsProps) {
  const [savedNama, setSavedNama] = useState(initialNama);
  const [nama, setNama] = useState(initialNama);
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [pageNotice, setPageNotice] = useState<AccountActionResult>({});

  const [dialog, setDialog] = useState<DialogKind>(null);
  const [dialogResult, setDialogResult] = useState<AccountActionResult>({});
  const [isPending, startTransition] = useTransition();
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [emailBaru, setEmailBaru] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  const isNamaValid = nama.trim().length > 0;
  const isDirty = nama.trim() !== savedNama || avatar !== savedAvatar;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setAvatarError("Gunakan foto berformat JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Ukuran foto maksimal 2 MB.");
      return;
    }
    setAvatarError("");
    setPageNotice({});
    setAvatar(URL.createObjectURL(file));
  }

  function handleCancel() {
    setNama(savedNama);
    setAvatar(savedAvatar);
    setAvatarError("");
    setPageNotice({});
  }

  function handleSave() {
    if (!isNamaValid || !isDirty) return;
    setSavedNama(nama.trim());
    setNama(nama.trim());
    setSavedAvatar(avatar);
    setPageNotice({ success: "Perubahan profil berhasil disimpan." });
  }

  function openDialog(kind: Exclude<DialogKind, null>) {
    setDialogResult({});
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasi("");
    setEmailBaru("");
    setEmailPassword("");
    setDialog(kind);
  }

  function runAction(action: () => Promise<AccountActionResult>) {
    startTransition(async () => {
      const result = await action();
      setDialogResult(result);
    });
  }

  const isDialogDone = Boolean(dialogResult.success);

  return (
    <>
      <Header title="Pengaturan Akun" actions={<></>} />

      <main className="flex-1 p-6">
        <div className="mx-auto w-full max-w-4xl rounded-xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-col-reverse gap-10 md:flex-row md:gap-14">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="akun-nama" className="font-semibold text-slate-800">
                  Nama Lengkap
                </Label>
                <Input
                  id="akun-nama"
                  value={nama}
                  onChange={(e) => {
                    setNama(e.target.value);
                    setPageNotice({});
                  }}
                  aria-invalid={!isNamaValid}
                  className="h-10"
                />
                {!isNamaValid && <p className="text-xs text-rose-600">Nama wajib diisi.</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="akun-password" className="font-semibold text-slate-800">
                  Password
                </Label>
                <Input
                  id="akun-password"
                  type="password"
                  value="••••••••••"
                  readOnly
                  tabIndex={-1}
                  className={readOnlyInputClassName}
                />
                <button
                  type="button"
                  onClick={() => openDialog("password")}
                  className="self-end text-sm font-medium text-blue-600 hover:underline"
                >
                  Ubah
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="akun-email" className="font-semibold text-slate-800">
                  Email
                </Label>
                <Input
                  id="akun-email"
                  value={email}
                  readOnly
                  className={readOnlyInputClassName}
                />
                <button
                  type="button"
                  onClick={() => openDialog("email")}
                  className="self-end text-sm font-medium text-blue-600 hover:underline"
                >
                  Ubah
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="akun-role" className="font-semibold text-slate-800">
                    Role
                  </Label>
                  <Input id="akun-role" value={role} readOnly className={readOnlyInputClassName} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="akun-sekolah" className="font-semibold text-slate-800">
                    Sekolah
                  </Label>
                  <Input
                    id="akun-sekolah"
                    value={sekolah}
                    readOnly
                    className={readOnlyInputClassName}
                  />
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                {roleNote}
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => openDialog("delete")}
                  className="text-sm font-medium text-rose-600 hover:underline"
                >
                  Hapus Akun
                </button>
                <p className="mt-1 text-xs text-slate-500">
                  Anda akan menerima email untuk mengonfirmasi keputusan ini. Setelah dikonfirmasi,
                  akun Anda akan dihapus secara permanen.
                </p>
              </div>

              <Notice result={pageNotice} />

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 flex-1 sm:max-w-44"
                  disabled={!isDirty}
                  onClick={handleCancel}
                >
                  Batal
                </Button>
                <Button
                  size="lg"
                  className="h-11 flex-1 bg-[#0d1a37] hover:bg-[#1a2b52] sm:max-w-44"
                  disabled={!isDirty || !isNamaValid}
                  onClick={handleSave}
                >
                  Simpan
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 md:w-56">
              <div className="flex size-36 items-center justify-center overflow-hidden rounded-3xl bg-slate-200 text-slate-400">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal dari object URL
                  <img src={avatar} alt="Foto profil" className="size-full object-cover" />
                ) : (
                  <UserRound className="size-16" />
                )}
              </div>
              <input
                id="akun-avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="sr-only"
              />
              <label
                htmlFor="akun-avatar"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full cursor-pointer gap-1.5 bg-[#0d1a37] hover:bg-[#1a2b52]",
                )}
              >
                <Upload className="size-4" />
                Unggah Foto
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  className="text-xs font-medium text-slate-500 hover:text-rose-600"
                >
                  Hapus foto
                </button>
              )}
              <p className="text-center text-xs text-slate-400">JPG, PNG, atau WEBP, maksimal 2 MB</p>
              {avatarError && <p className="text-center text-xs text-rose-600">{avatarError}</p>}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          {dialog === "password" && (
            <>
              <DialogHeader>
                <DialogTitle>Ubah Password</DialogTitle>
              </DialogHeader>
              {!isDialogDone && (
                <div className="flex flex-col gap-3">
                  <PasswordField
                    id="pw-lama"
                    label="Password saat ini"
                    value={passwordLama}
                    onChange={setPasswordLama}
                    autoComplete="current-password"
                  />
                  <PasswordField
                    id="pw-baru"
                    label="Password baru"
                    value={passwordBaru}
                    onChange={setPasswordBaru}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    id="pw-konfirmasi"
                    label="Konfirmasi password baru"
                    value={konfirmasi}
                    onChange={setKonfirmasi}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-slate-400">Minimal 8 karakter.</p>
                </div>
              )}
              <Notice result={dialogResult} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(null)}>
                  {isDialogDone ? "Tutup" : "Batal"}
                </Button>
                {!isDialogDone && (
                  <Button
                    className="bg-[#0d1a37] hover:bg-[#1a2b52]"
                    disabled={isPending || !passwordLama || !passwordBaru || !konfirmasi}
                    onClick={() =>
                      runAction(() => changePassword({ passwordLama, passwordBaru, konfirmasi }))
                    }
                  >
                    {isPending && <Loader2 className="animate-spin" />}
                    Simpan Password
                  </Button>
                )}
              </DialogFooter>
            </>
          )}

          {dialog === "email" && (
            <>
              <DialogHeader>
                <DialogTitle>Ubah Email</DialogTitle>
                <p className="text-xs text-slate-500">Email saat ini: {email}</p>
              </DialogHeader>
              {!isDialogDone && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email-baru">Email baru</Label>
                    <Input
                      id="email-baru"
                      type="email"
                      value={emailBaru}
                      onChange={(e) => setEmailBaru(e.target.value)}
                      placeholder="nama@sekolah.sch.id"
                    />
                  </div>
                  <PasswordField
                    id="email-password"
                    label="Password"
                    value={emailPassword}
                    onChange={setEmailPassword}
                    autoComplete="current-password"
                  />
                </div>
              )}
              <Notice result={dialogResult} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(null)}>
                  {isDialogDone ? "Tutup" : "Batal"}
                </Button>
                {!isDialogDone && (
                  <Button
                    className="bg-[#0d1a37] hover:bg-[#1a2b52]"
                    disabled={isPending || !emailBaru || !emailPassword}
                    onClick={() =>
                      runAction(() =>
                        requestEmailChange({ emailBaru, password: emailPassword }),
                      )
                    }
                  >
                    {isPending && <Loader2 className="animate-spin" />}
                    Kirim Verifikasi
                  </Button>
                )}
              </DialogFooter>
            </>
          )}

          {dialog === "delete" && (
            <>
              <DialogHeader>
                <DialogTitle>Hapus Akun</DialogTitle>
              </DialogHeader>
              {!isDialogDone && (
                <p className="text-sm text-slate-600">
                  Kami akan mengirim email konfirmasi ke{" "}
                  <span className="font-semibold text-slate-900">{email}</span>. Akun baru dihapus
                  permanen setelah Anda mengonfirmasi melalui email tersebut.
                </p>
              )}
              <Notice result={dialogResult} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(null)}>
                  {isDialogDone ? "Tutup" : "Batal"}
                </Button>
                {!isDialogDone && (
                  <Button
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => runAction(requestAccountDeletion)}
                  >
                    {isPending && <Loader2 className="animate-spin" />}
                    Kirim Email Konfirmasi
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
