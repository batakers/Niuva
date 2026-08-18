import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { LogoWordmark } from "@/components/brand/Logo";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export const AUTH_COPY = {
  id: {
    shell: {
      customer: {
        eyebrow: "Akun pelanggan",
        heading: "Pesanan Anda, dalam satu tempat.",
        tagline:
          "Pantau status, file, pembayaran, dan perkembangan pesanan yang terhubung dengan akun Anda.",
        note: "Informasi pelanggan tetap terpisah dari ruang kerja internal Niuva.",
      },
      staff: {
        eyebrow: "Admin Studio",
        heading: "Ruang kerja operasional Niuva.",
        tagline:
          "Masuk untuk menangani pekerjaan sesuai peran, izin, dan tanggung jawab akun Anda.",
        note: "Akses internal mengikuti peran dan izin yang ditetapkan untuk akun.",
      },
      recovery: {
        eyebrow: "Pemulihan akun",
        heading: "Kembali ke akun Anda dengan langkah yang jelas.",
        tagline:
          "Minta atau gunakan link reset untuk membuat password baru tanpa mengubah alur keamanan akun.",
        note: "Ikuti petunjuk pada layar. Link yang tidak valid dapat diminta ulang.",
      },
    },
    navigation: {
      backToSiteAria: "Kembali ke situs Niuva",
      backToSite: "Kembali ke situs",
    },
    login: {
      title: "Login Pelanggan",
      eyebrow: "Portal pelanggan",
      heading: "Masuk ke akun Anda",
      description: "Lihat pesanan dan perkembangan pekerjaan yang terhubung dengan akun Anda.",
      email: "Email",
      password: "Password",
      verifying: "Memverifikasi…",
      submit: "Masuk",
      forgot: "Lupa password?",
      google: "Masuk dengan Google",
      registerPrompt: "Belum punya akun pelanggan?",
      register: "Daftar akun",
      providerUnavailable: "Login Google belum tersedia. Gunakan email atau coba lagi nanti.",
      googleLinkRequired: "Akun Google ini sudah terkait dengan akun lain. Gunakan metode login yang sudah terdaftar.",
      googleRegistrationRequired: "Akun Google belum terdaftar. Buat akun pelanggan terlebih dahulu.",
      googleVerificationFailed: "Verifikasi Google belum berhasil. Coba lagi atau gunakan email.",
      googleStateInvalid: "Sesi Google sudah tidak berlaku. Mulai lagi dari tombol Google.",
      errors: {
        invalidCredentials: "Email atau password tidak valid.",
        unavailable: "Login belum dapat diproses. Periksa koneksi lalu coba lagi.",
        generic: "Login belum berhasil. Coba lagi.",
      },
    },
    recovery: {
      title: "Pemulihan akun",
      eyebrow: "Pemulihan akun",
      requestTitle: "Lupa password?",
      sentTitle: "Periksa email Anda",
      requestDescription:
        "Masukkan email akun. Jika terdaftar dan memenuhi syarat, kami akan mengirimkan link reset.",
      sentDescription:
        "Instruksi reset dikirim dengan respons yang sama untuk setiap permintaan.",
      email: "Email",
      request: "Kirim link reset",
      sending: "Mengirim…",
      resend: (seconds) => `Kirim ulang (${seconds})`,
      resendReady: "Kirim ulang",
      anotherEmail: "Gunakan email lain",
      maskedPrefix: "Jika email",
      maskedSuffix: "terdaftar, instruksi reset password telah dikirim.",
      customerLogin: "Kembali ke login pelanggan",
      staffLogin: "Kembali ke login admin",
      customerDestination: "Login pelanggan",
      staffDestination: "Login admin",
      errors: {
        requestFailed: "Permintaan reset belum berhasil. Coba lagi.",
        unavailable: "Layanan pemulihan belum tersedia. Periksa koneksi lalu coba lagi.",
      },
    },
    reset: {
      title: "Buat password baru",
      eyebrow: "Pemulihan akun",
      description: "Link akan diperiksa sebelum Anda dapat mengubah password.",
      checking: "Memeriksa link reset…",
      unavailable: "Link belum dapat diperiksa. Periksa koneksi, lalu coba lagi.",
      retry: "Coba Lagi",
      newPassword: "Password baru",
      confirmPassword: "Konfirmasi password",
      passwordHint: (min, max, bytes) =>
        `${min}–${max} karakter Unicode, maksimal ${bytes} byte, tanpa aturan kombinasi karakter.`,
      passwordInvalid: "Password belum memenuhi panjang yang diperlukan.",
      passwordMismatch: "Password tidak cocok.",
      hidePassword: "Sembunyikan password",
      showPassword: "Tampilkan password",
      processing: "Memproses…",
      submit: "Simpan password baru",
      requestNew: "Minta link baru",
      errors: {
        unavailable: "Password belum dapat diubah. Periksa koneksi lalu coba lagi.",
      },
    },
    resetState: {
      successTitle: "Password berhasil diubah",
      errorTitle: "Link tidak valid",
      successDescription:
        "Sesi lama telah diakhiri. Pilih halaman login yang sesuai untuk masuk dengan password baru.",
      errorDescription:
        "Link reset tidak valid atau sudah tidak dapat digunakan. Anda dapat meminta link baru.",
      customerLogin: "Login pelanggan",
      staffLogin: "Login admin",
      requestNew: "Minta link baru",
    },
  },
  en: {
    shell: {
      customer: {
        eyebrow: "Customer account",
        heading: "Your orders, in one place.",
        tagline:
          "Track status, files, payment, and progress connected to your account.",
        note: "Customer information remains separate from Niuva's internal workspace.",
      },
      staff: {
        eyebrow: "Admin Studio",
        heading: "Niuva's operational workspace.",
        tagline:
          "Sign in to handle work according to your account's role, permissions, and responsibility.",
        note: "Internal access follows the role and permissions assigned to the account.",
      },
      recovery: {
        eyebrow: "Account recovery",
        heading: "A clear path back to your account.",
        tagline:
          "Request or use a reset link to create a new password without changing the account security flow.",
        note: "Follow the instructions on screen. An invalid link can be requested again.",
      },
    },
    navigation: {
      backToSiteAria: "Back to the Niuva site",
      backToSite: "Back to site",
    },
    login: {
      title: "Customer Login",
      eyebrow: "Customer portal",
      heading: "Sign in to your account",
      description: "View orders and work progress connected to your account.",
      email: "Email",
      password: "Password",
      verifying: "Verifying…",
      submit: "Sign in",
      forgot: "Forgot password?",
      google: "Sign in with Google",
      registerPrompt: "Do not have a customer account yet?",
      register: "Create an account",
      providerUnavailable: "Google sign-in is not available yet. Use email or try again later.",
      googleLinkRequired: "This Google account is already associated with another account. Use the registered sign-in method.",
      googleRegistrationRequired: "This Google account is not registered yet. Create a customer account first.",
      googleVerificationFailed: "Google verification did not complete. Try again or use email.",
      googleStateInvalid: "The Google session is no longer valid. Start again from the Google button.",
      errors: {
        invalidCredentials: "Invalid email or password.",
        unavailable: "Login could not be completed. Check your connection and try again.",
        generic: "Login was not completed. Try again.",
      },
    },
    recovery: {
      title: "Account recovery",
      eyebrow: "Account recovery",
      requestTitle: "Forgot password?",
      sentTitle: "Check your email",
      requestDescription:
        "Enter your account email. If it is registered and eligible, we will send a reset link.",
      sentDescription:
        "Reset instructions use the same response for every request.",
      email: "Email",
      request: "Send reset link",
      sending: "Sending…",
      resend: (seconds) => `Send again (${seconds})`,
      resendReady: "Send again",
      anotherEmail: "Use another email",
      maskedPrefix: "If",
      maskedSuffix: "is registered, reset instructions have been sent.",
      customerLogin: "Back to customer login",
      staffLogin: "Back to admin login",
      customerDestination: "Customer login",
      staffDestination: "Admin login",
      errors: {
        requestFailed: "The reset request was not completed. Try again.",
        unavailable: "Recovery is not available right now. Check your connection and try again.",
      },
    },
    reset: {
      title: "Create a new password",
      eyebrow: "Account recovery",
      description: "The link will be checked before you can change your password.",
      checking: "Checking reset link…",
      unavailable: "The link could not be checked. Check your connection and try again.",
      retry: "Try again",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      passwordHint: (min, max, bytes) =>
        `${min}–${max} Unicode characters, up to ${bytes} bytes, without character-combination rules.`,
      passwordInvalid: "The password does not meet the required length.",
      passwordMismatch: "Passwords do not match.",
      hidePassword: "Hide password",
      showPassword: "Show password",
      processing: "Processing…",
      submit: "Save new password",
      requestNew: "Request a new link",
      errors: {
        unavailable: "The password could not be changed. Check your connection and try again.",
      },
    },
    resetState: {
      successTitle: "Password changed",
      errorTitle: "Invalid link",
      successDescription:
        "The previous session has ended. Choose the correct login page to sign in with your new password.",
      errorDescription:
        "The reset link is invalid or no longer usable. You can request a new link.",
      customerLogin: "Customer login",
      staffLogin: "Admin login",
      requestNew: "Request a new link",
    },
  },
};

export function getAuthCopy(lang) {
  return AUTH_COPY[lang === "en" ? "en" : "id"];
}

export function AuthShell({
  children,
  audience = "staff",
  heading,
  tagline,
}) {
  const { lang } = useI18n();
  const copy = getAuthCopy(lang);
  const content = copy.shell[audience] || copy.shell.recovery;

  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <main className="mx-auto grid min-h-screen min-w-0 w-full max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)]">
        <section className="hidden border-r border-border-default px-10 py-12 lg:flex lg:flex-col xl:px-16">
          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-4 focus-visible:ring-offset-surface-page"
            aria-label={copy.navigation.backToSiteAria}
          >
            <LogoWordmark className="h-9 text-text-primary" />
          </Link>

          <div className="my-auto max-w-xl py-16">
            <p className="type-label text-action-primary">{content.eyebrow}</p>
            <h2 className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight text-text-primary xl:text-5xl">
              {heading || content.heading}
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-text-secondary">
              {tagline || content.tagline}
            </p>
          </div>

          <p className="max-w-lg border-t border-border-default pt-6 text-sm leading-6 text-text-secondary">
            {content.note}
          </p>
        </section>

        <section className="flex min-h-screen min-w-0 flex-col px-4 py-6 sm:px-8 sm:py-10 lg:justify-center lg:px-10">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <LogoWordmark className="h-8 text-text-primary" />
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {copy.navigation.backToSite}
            </Link>
          </div>

          <div className="mx-auto min-w-0 w-full max-w-md">{children}</div>
        </section>
      </main>
    </div>
  );
}

export const AuthCard = React.forwardRef(
  (
    {
      eyebrow,
      title,
      description,
      children,
      className,
      contentClassName,
      ...props
    },
    ref
  ) => (
    <SurfacePanel
      ref={ref}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <div className={cn("p-6 sm:p-8", contentClassName)}>
        {eyebrow && (
          <p className="type-label text-action-primary">{eyebrow}</p>
        )}
        {title && (
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
        )}
        {description && (
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        )}
        <div className={cn((eyebrow || title || description) && "mt-8")}>
          {children}
        </div>
      </div>
    </SurfacePanel>
  )
);
AuthCard.displayName = "AuthCard";
