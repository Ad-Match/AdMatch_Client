"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { getHomePathForRole } from "@/lib/roles";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "advertiser" as "advertiser" | "model",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === "model") {
        router.push("/models/profile");
      } else {
        router.push(getHomePathForRole(user.role));
      }
    } catch {
      setError("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <input
          required
          placeholder="이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        <input
          required
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as "advertiser" | "model" })
          }
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        >
          <option value="advertiser">광고주</option>
          <option value="model">모델</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-brand-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-brand-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
