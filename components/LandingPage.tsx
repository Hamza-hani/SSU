// components/LandingPage.tsx (FULL UPDATED - same UI, cleaned imports, fixed minor issues)
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Target,
  MapPin,
  CheckCircle2,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

const tracks = [
  {
    title: "Protective Operations",
    desc: "Operational readiness, formations, and field procedures for protective duties.",
    icon: ShieldCheck,
  },
  {
    title: "Threat Awareness",
    desc: "Risk recognition, situational awareness, and fast decision-making under pressure.",
    icon: Target,
  },
  {
    title: "Professional Development",
    desc: "Discipline, conduct, reporting, and structured certification preparation.",
    icon: GraduationCap,
  },
];

const steps = [
  {
    title: "Enroll & Get Access",
    desc: "Sign up and get access to structured modules and training resources.",
  },
  {
    title: "Learn by Scenarios",
    desc: "Short lessons built around real-world protective/security scenarios.",
  },
  {
    title: "Test & Improve",
    desc: "Quizzes + progress tracking to improve confidence and performance.",
  },
];

const faqs = [
  {
    q: "Is this platform for SSU personnel only?",
    a: "Yes. This e-learning platform is intended for SSU Sindh Police internal training and professional learning.",
  },
  {
    q: "What does SSU training focus on?",
    a: "Operational readiness, protective security fundamentals, discipline, and scenario-based learning aligned with duty requirements.",
  },
  {
    q: "Is learning self-paced?",
    a: "Yes. Content is on-demand and you can revisit lessons anytime.",
  },
  {
    q: "Do you provide certificates?",
    a: "Courses are designed to be certification-ready and professionally structured for internal standards.",
  },
];

function openAuth(mode: "login" | "signup") {
  // AppShell listens to this event and opens AuthModal
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ssu:open-auth", { detail: { mode } }));
}

export default function LandingPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const openSignup = () => {
    if (currentUser) return router.push("/");
    openAuth("signup");
  };

  const openLogin = () => {
    if (currentUser) return router.push("/");
    openAuth("login");
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] ssu-grid" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-black/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

        <div className="ssu-container">
          <div className="py-14 sm:py-18 lg:py-20">
            <div className="ssu-card ssu-noise p-6 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-12 items-center">
                {/* Left */}
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-gray-700 shadow-sm">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">SSU • Karachi, Sindh, Pakistan</span>
                  </div>

                  <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 font-ssu">
                    SSU Internal E-Learning Platform
                  </h1>

                  <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-2xl">
                    Structured training for Special Security Unit (SSU), Sindh Police — built around
                    operational readiness, protective security, and professional standards for internal use.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-gray-800">
                      <CheckCircle2 className="h-4 w-4" /> Private LMS Access
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-gray-800">
                      <Target className="h-4 w-4" /> Scenario Based
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-gray-800">
                      <BadgeCheck className="h-4 w-4" /> Progress Tracking
                    </span>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-gray-700 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Access is intended for SSU Sindh Police training use.</span>
                  </div>

                  <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="text-2xl font-bold text-gray-900">17+</div>
                      <div className="text-sm text-gray-600">Specialized Courses</div>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="text-2xl font-bold text-gray-900">Pro</div>
                      <div className="text-sm text-gray-600">Industry Standard</div>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="text-2xl font-bold text-gray-900">Ready</div>
                      <div className="text-sm text-gray-600">Certification Focus</div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-8 flex flex-wrap gap-3 items-center">
                    {!currentUser ? (
                      <>
                        <button
                          onClick={openSignup}
                          className="inline-flex items-center justify-center rounded-xl bg-black px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-gray-900 transition"
                        >
                          Start Training
                        </button>

                        <button
                          onClick={openLogin}
                          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-7 py-3.5 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition"
                        >
                          Log In
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-600 ml-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Private LMS • Secure access
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push("/")}
                          className="inline-flex items-center justify-center rounded-xl bg-black px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-gray-900 transition"
                        >
                          Continue
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-600 ml-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Logged in as <span className="font-semibold">{currentUser.name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="lg:col-span-5">
                  <div className="rounded-3xl border border-black/10 bg-black text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden">
                    <div className="relative h-44">
                      <Image
                        src="/assets/image2.png"
                        alt="SSU Academy"
                        fill
                        className="object-cover opacity-90"
                        priority
                        sizes="(max-width: 1024px) 100vw, 520px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-5 right-5">
                        <div className="text-sm text-white/80">Special Security Unit</div>
                        <div className="text-lg font-bold">Operational Training</div>
                      </div>
                    </div>

                    <div className="p-7">
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <ShieldCheck className="h-7 w-7 flex-shrink-0 text-white" />
                          <div>
                            <h3 className="font-semibold text-lg">Security Excellence</h3>
                            <p className="text-gray-300 mt-1">
                              Structured learning focused on duty-ready procedures and professionalism.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <Target className="h-7 w-7 flex-shrink-0 text-white" />
                          <div>
                            <h3 className="font-semibold text-lg">Scenario-Based Learning</h3>
                            <p className="text-gray-300 mt-1">
                              Lessons designed around real operational situations and decision-making.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <BadgeCheck className="h-7 w-7 flex-shrink-0 text-white" />
                          <div>
                            <h3 className="font-semibold text-lg">Quality Standards</h3>
                            <p className="text-gray-300 mt-1">
                              Clean curriculum structure with progress tracking and assessments.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-7 rounded-2xl bg-white/10 border border-white/10 p-5">
                        <div className="text-sm text-white/80">Best for:</div>
                        <div className="mt-1 text-sm">
                          SSU personnel • Protective teams • Specialized assignments
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Training content is structured for internal professional development.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 ssu-divider" />
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-14 sm:py-16">
        <div className="ssu-container">
          <div className="ssu-card p-6 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-12 items-center">
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
                  <Image
                    src="/assets/image.png"
                    alt="SSU Founder"
                    width={900}
                    height={1100}
                    className="h-[420px] w-full object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 520px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                    <p className="text-sm text-white/90">
                      “Discipline, readiness, and real-world training — that’s what we build at SSU Academy.”
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-ssu">
                  Message from the Founder
                </h2>

                <p className="mt-4 text-gray-600 text-lg">
                  SSU Academy ka purpose ek structured, duty-focused learning system provide karna hai — jahan
                  personnel operational knowledge, professional discipline, aur scenario readiness ko step-by-step
                  improve kar sakein.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-5 bg-white">
                    <p className="text-sm font-semibold text-gray-900">Our Vision</p>
                    <p className="mt-2 text-sm text-gray-600">
                      SSU training ko modern, structured aur measurable banana — taake performance field me reflect ho.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-5 bg-white">
                    <p className="text-sm font-semibold text-gray-900">Our Promise</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Clear modules, assessments, and practical learning — without unnecessary complexity.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {!currentUser ? (
                    <>
                      <button
                        onClick={openSignup}
                        className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-900 transition"
                      >
                        Explore Courses
                      </button>
                      <button
                        onClick={openLogin}
                        className="rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition"
                      >
                        Log In
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push("/")}
                      className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-900 transition"
                    >
                      Continue
                    </button>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-900">Founder Name</p>
                  <p className="text-sm text-gray-600">Founder, Dr. Maqsood Ahmed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 ssu-divider" />
        </div>
      </section>

      {/* ABOUT SSU */}
      <section className="py-14 sm:py-16">
        <div className="ssu-container">
          <div className="ssu-card p-6 sm:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-ssu">
                About SSU
              </h2>
              <p className="mt-4 text-gray-600 text-lg">
                SSU is a specialized unit of Sindh Police. This e-learning platform is designed for internal training,
                operational readiness, and professional development.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-black/10 bg-white p-7 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Specialized Personnel</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Training focused on discipline, responsibility, and professional conduct for specialized roles.
                </p>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white p-7 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Operational Readiness</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Structured learning paths that support readiness, coordination, and safe execution of duties.
                </p>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white p-7 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Standards & Assessment</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Assessments and progress tracking to improve knowledge retention and performance over time.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <BookOpen className="h-7 w-7 text-black flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Training Mission</h3>
                  <p className="mt-2 text-gray-700">
                    Build capable personnel with practical knowledge, scenario readiness, and professional discipline —
                    to support secure operations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 ssu-divider" />
        </div>
      </section>

      {/* TRAINING TRACKS */}
      <section className="py-14 sm:py-16">
        <div className="ssu-container">
          <div className="ssu-card p-6 sm:p-10">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-ssu">
                Training Tracks
              </h2>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Operational confidence, professional discipline, and scenario-based learning.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {tracks.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.title}
                    className="rounded-3xl border border-black/10 bg-white p-7 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{t.title}</h3>
                    </div>
                    <p className="mt-4 text-gray-600">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 ssu-divider" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 sm:py-16">
        <div className="ssu-container">
          <div className="ssu-card p-6 sm:p-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center font-ssu">
              How Training Works
            </h2>
            <p className="mt-3 text-center text-gray-600 max-w-2xl mx-auto">
              Simple, structured flow — designed for internal training and measurable progress.
            </p>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {steps.map((s, idx) => (
                <div
                  key={s.title}
                  className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm"
                >
                  <div className="text-sm font-semibold text-gray-500">Step {idx + 1}</div>
                  <div className="mt-2 text-xl font-semibold text-gray-900">{s.title}</div>
                  <div className="mt-3 text-gray-600">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 ssu-divider" />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-16">
        <div className="ssu-container">
          <div className="ssu-card p-6 sm:p-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center font-ssu">
              FAQs
            </h2>

            <div className="mt-10 space-y-4 max-w-3xl mx-auto">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-black/10 bg-white p-5 open:shadow-sm transition"
                >
                  <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between">
                    {f.q}
                    <span className="text-gray-500 group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="mt-3 text-gray-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-10 ssu-divider" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16">
        <div className="ssu-container">
          <div className="ssu-card p-6 sm:p-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 font-ssu">
              Ready to Begin Training?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Internal learning designed to support operational readiness and professional standards.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {!currentUser ? (
                <>
                  <button
                    onClick={openSignup}
                    className="bg-black hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-sm transition"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={openLogin}
                    className="border border-black/10 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg transition"
                  >
                    Log In
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/")}
                  className="bg-black hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-sm transition"
                >
                  Continue
                </button>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4" />
              Private LMS • Controlled access • Training-first design
            </div>
          </div>
        </div>
      </section>

      {/* AuthModal handled globally in AppShell */}
    </div>
  );
}
