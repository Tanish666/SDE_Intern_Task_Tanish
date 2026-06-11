import { Link } from "@tanstack/react-router"
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion"
import Lenis from "lenis"
import { useEffect, useRef } from "react"
import { BackgroundRippleEffect } from "../components/ui/background-ripple-effect"
import { Highlighter } from "../components/ui/highlighter"
import { useMe } from "../lib/useAuth"

const ROW1_TESTIMONIALS = [
  {
    name: "Brian Ramirez",
    title: "Financial Analyst",
    text: "Formly has completely transformed how we gather client feedback. It's user-friendly, efficient, and fits our corporate brand guidelines perfectly!",
    initial: "B",
    bg: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "David Anderson",
    title: "Marketing Manager",
    text: "I love the custom themes! It makes creating branded surveys for our campaigns a breeze. Conversion rates have shot up.",
    initial: "D",
    bg: "bg-amber-100 text-amber-700",
  },
  {
    name: "James Carter",
    title: "Graphic Designer",
    text: "The design tools are fantastic. The survey aesthetics have really helped increase our completion rates on portfolio feedback!",
    initial: "J",
    bg: "bg-blue-100 text-blue-700",
  },
  {
    name: "Jane Doe",
    title: "Data Scientist",
    text: "I've never seen better survey analytics. The response dashboard and csv exports are absolutely top-notch!",
    initial: "J",
    bg: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Sarah Lewis",
    title: "Customer Success",
    text: "The support team is incredibly helpful and responsive. They resolved our branding questions in a couple of minutes.",
    initial: "S",
    bg: "bg-rose-100 text-rose-700",
  },
]

const ROW2_TESTIMONIALS = [
  {
    name: "John Mitchell",
    title: "Product Manager",
    text: "I appreciate the simplicity. No complex setup means I can launch a feedback survey with confidence in seconds.",
    initial: "J",
    bg: "bg-violet-100 text-violet-700",
  },
  {
    name: "Daniel Walker",
    title: "Web Developer",
    text: "The webhook integrations changed my workflow! Triggering email sequences based on responses is now easier than ever.",
    initial: "D",
    bg: "bg-teal-100 text-teal-700",
  },
  {
    name: "William Johnson",
    title: "Sales Executive",
    text: "The custom redirect feature gives us peace of mind when converting survey leads into booking links. Highly recommend!",
    initial: "W",
    bg: "bg-sky-100 text-sky-700",
  },
  {
    name: "Joshua White",
    title: "Business Consultant",
    text: "I can't believe how quickly we get response notifications. Saves our consulting team so much time analyzing client needs.",
    initial: "J",
    bg: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    name: "Emily Watson",
    title: "HR Coordinator",
    text: "We use Formly for all our internal employee feedback. The anonymous collection feature is clean, secure, and reliable.",
    initial: "E",
    bg: "bg-orange-100 text-orange-700",
  },
]

export function LandingPage() {
  const { data } = useMe()
  const phoneContainerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: phoneContainerRef,
    offset: ["start end", "center center"],
  })

  // Scroll animations for the phone mockup
  const phoneY = useTransform(scrollYProgress, [0.5, 1], [-400, 0])
  const phoneOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1])
  const phoneBlur = useTransform(scrollYProgress, [0.5, 0.8], [15, 0])
  const phoneFilter = useMotionTemplate`blur(${phoneBlur}px)`

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2,
    })
    function raf(time: any) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [])

  const signedIn = Boolean(data?.user)
  const ctaTo = signedIn ? "/dashboard" : "/login"
  const ctaLabel = signedIn ? "Go to dashboard" : "Get started — it's free"

  return (
    <div className="min-h-full bg-slate-950">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="w-full max-w-5xl flex items-center justify-between px-6 py-2.5 rounded-full border border-slate-800/80 bg-[#161824]/80 backdrop-blur-lg shadow-[0_15px_40px_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-300">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-100">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-sm text-white font-black">
              F
            </span>
            Formly
          </Link>

          {/* Middle navigation links matching reference design */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => {
                const featuresSection = document.getElementById("features")
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15)] text-slate-100 text-xs font-semibold tracking-wide transition cursor-pointer hover:bg-white/10"
            >
              Features
            </button>
            <button
              onClick={() => {
                const testimonialsSection = document.getElementById("testimonials")
                if (testimonialsSection) {
                  testimonialsSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
              className="px-4 py-1.5 rounded-full text-slate-400 hover:text-slate-100 text-xs font-semibold tracking-wide transition cursor-pointer hover:bg-white/5"
            >
              Testimonials
            </button>
            <Link
              to={ctaTo}
              className="px-4 py-1.5 rounded-full text-slate-400 hover:text-slate-100 text-xs font-semibold tracking-wide transition cursor-pointer hover:bg-white/5"
            >
              Get Started
            </Link>
          </nav>

          <Link to={ctaTo}>
            <button
              type="button"
              className="px-5 py-2 rounded-full border border-slate-700/80 hover:border-slate-500/80 bg-transparent text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
            >
              {signedIn ? "Dashboard" : "Sign in"}
            </button>
          </Link>
        </div>
      </motion.header>

      <main>
        {/* top blur */}
        <div className="fixed h-[2%] w-full bg-transparent backdrop-blur-[5px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[4%] w-full bg-transparent backdrop-blur-[10px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[6%] w-full bg-transparent backdrop-blur-[9px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[8%] w-full bg-transparent backdrop-blur-[6px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[10%] w-full bg-transparent backdrop-blur-[5px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[12%] w-full bg-transparent backdrop-blur-[4px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[14%] w-full bg-transparent backdrop-blur-[3px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[16%] w-full bg-transparent backdrop-blur-[2px] top-0 z-40 opacity-100"></div>
        <div className="fixed h-[18%] w-full bg-transparent backdrop-blur-[1px] top-0 z-40 opacity-100"></div>
        {/* top blur */}

        {/* bottom blur */}
        <div className="fixed h-[2%] w-full bg-transparent backdrop-blur-[5px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[4%] w-full bg-transparent backdrop-blur-[10px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[6%] w-full bg-transparent backdrop-blur-[9px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[8%] w-full bg-transparent backdrop-blur-[6px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[10%] w-full bg-transparent backdrop-blur-[5px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[12%] w-full bg-transparent backdrop-blur-[4px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[14%] w-full bg-transparent backdrop-blur-[3px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[16%] w-full bg-transparent backdrop-blur-[2px] bottom-0 z-40 opacity-100"></div>
        <div className="fixed h-[18%] w-full bg-transparent backdrop-blur-[1px] bottom-0 z-40 opacity-100"></div>
        {/* bottom blur */}

        <section className="relative overflow-hidden border-b border-slate-900 bg-slate-950 py-24 sm:py-32 flex flex-col items-center justify-center min-h-[550px]">
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,155,94,0.15)_0%,transparent_65%)] pointer-events-none" />

          {/* Ripple grid background with overridden green CSS variables */}
          <div className="absolute inset-0 z-0 opacity-100 [--cell-border-color:rgba(16,185,129,0.08)] [--cell-fill-color:transparent] [--cell-shadow-color:rgba(16,185,129,0.02)]">
            <BackgroundRippleEffect rows={9} cols={30} cellSize={56} />
          </div>

          <div className="relative z-45 mx-auto max-w-5xl px-4 text-center flex flex-col items-center pointer-events-none">
            {/* Pill Badge */}
            <div className="relative inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 p-1 pr-3 text-xs text-slate-300 backdrop-blur-sm mb-8 pointer-events-auto z-50">
              <span className="rounded-full bg-[#d2f53c] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                New
              </span>
              <span className="font-normal text-[11px] sm:text-xs text-slate-300">
                Survey themes & custom branding upgraded
              </span>
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center flex flex-col items-center pointer-events-none">
            {/* Heading */}
            <h1 className="text-4xl font-medium tracking-tight text-white sm:text-6xl md:text-7xl max-w-4xl leading-[1.12] pointer-events-auto">
              <Highlighter
                isView={true}
                animationDuration={1000}
                iterations={2}
                action="highlight"
                color="#1D9B5E"
              >
                Beautiful
              </Highlighter>
              , on-brand surveys <br className="hidden sm:inline" /> made{" "}
              <Highlighter
                isView={true}
                animationDuration={1000}
                iterations={3.5}
                action="underline"
                color="#1D9B5E"
              >
                easy
              </Highlighter>
              .
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-slate-400 font-light max-w-2xl leading-relaxed pointer-events-auto">
              We help creators and teams to easily build, brand, and share gorgeous surveys, without
              the premium price tag.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pointer-events-auto">
              <Link to={ctaTo} className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-base font-semibold text-white hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10 cursor-pointer"
                >
                  {ctaLabel}
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <title>Arrow</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </Link>

              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-100 transition-all shadow-lg cursor-pointer"
                onClick={() => {
                  const featuresSection = document.getElementById("features")
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm shadow-brand-500/30">
                  <svg className="h-3.5 w-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <title>Play</title>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                Watch Tutorial
              </button>
            </div>

            {/* phone mockup image with floating absolute cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -150px 0px", amount: 0.3 }}
              className="relative mt-16 w-full max-w-[700px] mx-auto pointer-events-auto flex justify-center items-center"
            >
              <img
                src="phone.png"
                alt="Phone Mockup"
                className="w-[400px] h-auto object-contain z-10"
              />

              {/* Middle Big Card Overlay */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, filter: "blur(15px)" },
                  visible: { opacity: 1, filter: "blur(0px)" },
                }}
                transition={{ duration: 0.7, delay: 2.5 }}
                className="absolute inset-x-0 mx-auto w-[350px] bg-white border border-slate-100 rounded-[28px] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.15)] z-25 flex flex-col gap-3 pointer-events-auto"
              >
                <div className="text-center">
                  <h3 className="text-base font-bold text-slate-900">Branded Survey</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customize to match your brand.
                  </p>
                </div>

                <div className="relative flex flex-col gap-1.5">
                  {/* Box 1 */}
                  <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 rounded-xl p-2.5 text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-4.5 w-4.5 rounded-full bg-brand-500 shadow-sm shadow-brand-500/30" />
                      <span className="text-xs font-semibold">Primary Color</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">#1D9B5E</span>
                  </div>

                  {/* Swap/Link Badge in the middle */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <title>Link</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>

                  {/* Box 2 */}
                  <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 rounded-xl p-2.5 text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-4.5 w-4.5 rounded bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
                        L
                      </span>
                      <span className="text-xs font-semibold">Survey Logo</span>
                    </div>
                    <span className="text-[10px] text-slate-500">acme_logo.png</span>
                  </div>
                </div>

                {/* Black Action Button */}
                <button
                  type="button"
                  className="w-full rounded-xl bg-slate-900 py-3 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-md"
                >
                  Publish Survey
                </button>
              </motion.div>

              {/* Floating Absolute Cards */}
              {/* Left Top Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -50, y: -50 },
                  visible: { opacity: 1, x: 0, y: 0 },
                }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="absolute -left-36 top-[20%] hidden md:flex items-center gap-6 bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Active surveys
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-0.5">12</h3>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-base font-semibold">
                  +18.5%
                </span>
              </motion.div>

              {/* Left Bottom Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -50, y: 50 },
                  visible: { opacity: 1, x: 0, y: 0 },
                }}
                transition={{ duration: 0.7, delay: 1 }}
                className="absolute -left-56 bottom-[30%] hidden md:flex items-center gap-5 bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <title>Checkmark</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Responses
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">6,790.67</h3>
                </div>
              </motion.div>

              {/* Left Circular Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute -left-10 bottom-[50%] hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-[#d2f53c] text-slate-950 shadow-lg z-20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-world-dollar"
                >
                  <title>World Dollar</title>
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M20.876 10.51a9 9 0 1 0 -7.839 10.43" />
                  <path d="M3.6 9h16.8" />
                  <path d="M3.6 15h9.9" />
                  <path d="M11.5 3a17 17 0 0 0 0 18" />
                  <path d="M12.5 3a16.986 16.986 0 0 1 2.578 9.02" />
                  <path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
                  <path d="M19 21v1m0 -8v1" />
                </svg>
              </motion.div>

              {/* Right Top Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 50, y: -50 },
                  visible: { opacity: 1, x: 0, y: 0 },
                }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="absolute -right-28 top-[20%] hidden md:flex items-center gap-6 bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Completion rate
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-0.5">94.2%</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <title>Arrow Up</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Right Bottom Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 50, y: 50 },
                  visible: { opacity: 1, x: 0, y: 0 },
                }}
                transition={{ duration: 0.7, delay: 1 }}
                className="absolute -right-56 bottom-[30%] hidden md:flex items-center gap-5 bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20"
              >
                <div className="flex -space-x-2">
                  <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-emerald-100 overflow-hidden flex items-center justify-center text-base font-bold text-emerald-800">
                    A
                  </div>
                  <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-indigo-100 overflow-hidden flex items-center justify-center text-base font-bold text-indigo-800">
                    B
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">124.8K+</h3>
                  <p className="text-sm text-slate-500 font-medium">Trusted Users</p>
                </div>
              </motion.div>

              {/* Right Circular Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute -right-12 bottom-[50%] hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-[#d2f53c] text-slate-950 shadow-lg z-20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-antenna-bars-4"
                >
                  <title>Signal</title>
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M6 18l0 -3" />
                  <path d="M10 18l0 -6" />
                  <path d="M14 18l0 -9" />
                  <path d="M18 18l0 .01" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="bg-white py-24 text-slate-900 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-4">
            {/* Top Grid: Mockup & Copy */}
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              {/* Left Column: Phone Mockup inside Dotted Wrapper */}
              <div
                ref={phoneContainerRef}
                className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 sm:p-10 flex justify-center items-center relative overflow-hidden h-[520px] w-full max-w-[380px] mx-auto shadow-sm"
                style={{
                  backgroundImage: "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {/* Phone Outer Frame */}
                <motion.div
                  style={{
                    y: phoneY,
                    opacity: phoneOpacity,
                    filter: phoneFilter,
                  }}
                  className="relative w-[250px] h-[450px] rounded-[40px] border-[8px] border-slate-950 bg-white shadow-2xl overflow-hidden flex flex-col shrink-0"
                >
                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4.5 bg-black rounded-full z-30" />

                  {/* Status Bar */}
                  <div className="absolute top-0 inset-x-0 h-8 px-5 flex items-center justify-between z-20 text-[8px] font-semibold text-slate-900 pointer-events-none">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      {/* Signal */}
                      <svg
                        className="w-2.5 h-2.5 text-slate-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M2 22h20V2z" />
                      </svg>
                      {/* Wifi */}
                      <svg
                        className="w-2.5 h-2.5 text-slate-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21l-12-18h24z" />
                      </svg>
                      {/* Battery */}
                      <div className="w-3.5 h-1.5 border border-slate-900 rounded-[1px] p-[0.5px] flex items-center">
                        <div className="h-full w-2 bg-slate-900 rounded-[0.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* Phone Content */}
                  <div className="p-4 pt-8 flex-1 flex flex-col justify-between bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7.5 h-7.5 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                          F
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-800 leading-tight">
                            Acme Corp
                          </span>
                          <span className="text-[7.5px] text-slate-400 font-semibold leading-none">
                            Customer Survey
                          </span>
                        </div>
                      </div>

                      {/* Dots Settings Button */}
                      <button className="w-7.5 h-7.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Survey Question Card */}
                    <div className="bg-brand-500 rounded-[18px] p-3 text-white flex flex-col gap-2.5 shadow-lg shadow-brand-500/10 mt-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[7.5px] font-bold text-emerald-100 uppercase tracking-wider">
                          <span>Question 3 of 5</span>
                          <span>60% Complete</span>
                        </div>
                        <div className="w-full bg-emerald-700/60 h-1 rounded-full overflow-hidden">
                          <div className="bg-[#d2f53c] h-full w-[60%] rounded-full" />
                        </div>
                      </div>
                      <div className="text-[10.5px] font-bold leading-tight mt-0.5">
                        How would you rate your checkout experience today?
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm transition-all cursor-pointer ${
                              num === 5
                                ? "bg-[#d2f53c] text-slate-950 font-extrabold transform scale-110"
                                : "bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <button className="w-full bg-white text-slate-800 rounded-full py-1.5 text-[9px] font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-1 mt-0.5 cursor-pointer">
                        Next Question
                        <svg
                          className="w-2.5 h-2.5 text-slate-800"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Recent Responses */}
                    <div className="mt-3 flex flex-col">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-extrabold text-[10px]">
                          Recent Responses
                        </span>
                        <span className="text-brand-500 font-extrabold text-[9px] cursor-pointer hover:underline">
                          See All
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5 mt-2">
                        {[
                          {
                            name: "Daniel",
                            bg: "bg-emerald-100 text-emerald-700",
                            initial: "D",
                            rating: "5 ★",
                          },
                          {
                            name: "Ethan",
                            bg: "bg-amber-100 text-amber-700",
                            initial: "E",
                            rating: "4 ★",
                          },
                          {
                            name: "Gabriel",
                            bg: "bg-blue-100 text-blue-700",
                            initial: "G",
                            rating: "5 ★",
                          },
                          {
                            name: "Henry",
                            bg: "bg-indigo-100 text-indigo-700",
                            initial: "H",
                            rating: "5 ★",
                          },
                          {
                            name: "James",
                            bg: "bg-rose-100 text-rose-700",
                            initial: "J",
                            rating: "4 ★",
                          },
                        ].map((c) => (
                          <div key={c.name} className="flex flex-col items-center gap-0.5">
                            <div
                              className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center text-[9px] font-extrabold border border-black/5 shadow-sm`}
                            >
                              {c.initial}
                            </div>
                            <span className="text-[7px] font-semibold text-slate-500 leading-none mt-0.5">
                              {c.name}
                            </span>
                            <span className="text-[6.5px] font-bold text-slate-400">
                              {c.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Copy & Grid Features */}
              <div className="flex flex-col justify-center">
                {/* Badge */}
                <div className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 mb-5 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                  Smart Surveys
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5">
                  Our survey builder is easy to start using.
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-lg">
                  Its drag-free, intuitive interface ensures teams can create and publish gorgeous
                  surveys effortlessly, making feedback collection and analysis straightforward and
                  reliable.
                </p>

                {/* 2x2 Feature Grid */}
                <div className="grid gap-4 sm:grid-cols-2 mb-8">
                  {/* Intuitive Builder */}
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      Build and customize surveys in minutes without code.
                    </span>
                  </div>

                  {/* Branded Themes */}
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.53 16.122a3 3 0 00-2.225.845 3 3 0 00-.777 2.899c.34 1.084.136 2.233-.521 3.134-.179.247-.45.394-.749.407a.5.5 0 01-.428-.753c.79-1.25.115-2.855-1.108-3.523A9.995 9.995 0 011.5 12C1.5 6.477 5.977 2 11.5 2S21.5 6.477 21.5 12c0 4.227-2.624 7.84-6.317 9.314a.75.75 0 01-.925-.905c.348-1.5.085-3.085-1.108-3.523a3 3 0 00-3.63 1.236z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      Apply custom colors, logos, and fonts to match your brand.
                    </span>
                  </div>

                  {/* Real-time Analytics */}
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      Track responses and completion rates in real time.
                    </span>
                  </div>

                  {/* Share Anywhere */}
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      Distribute via clean links, QR codes, or embedded widgets.
                    </span>
                  </div>
                </div>

                {/* Get Started Button */}
                <Link to={ctaTo} className="w-fit">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-bold text-white hover:bg-brand-600 transition-all shadow-md shadow-brand-500/10 cursor-pointer"
                  >
                    Get Started now
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            {/* Bottom Row: Stats Cards */}
            <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stat 1 */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  12.4<span className="text-2xl font-bold ml-0.5">M</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed mt-4">
                  Responses collected worldwide.
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-brand-500 rounded-3xl p-8 flex flex-col justify-between min-h-[180px] text-white shadow-lg shadow-brand-500/15 hover:shadow-xl hover:shadow-brand-500/25 transition-all">
                <div className="text-4xl font-extrabold text-white tracking-tight">
                  94.2<span className="text-2xl font-bold text-[#d2f53c] ml-0.5">%</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-100 leading-relaxed mt-4">
                  Average survey completion rate.
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  150<span className="text-2xl font-bold ml-1">+</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed mt-4">
                  Templates and integration options.
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  24<span className="text-2xl font-bold ml-0.5">/7</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed mt-4">
                  Instant dashboard updates and analytics.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="bg-white pb-24 pt-10 text-slate-900 border-t border-slate-100 overflow-hidden relative"
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes marquee-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marquee-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-marquee-left {
              display: flex;
              width: max-content;
              animation: marquee-left 45s linear infinite;
            }
            .animate-marquee-right {
              display: flex;
              width: max-content;
              animation: marquee-right 45s linear infinite;
            }
            .animate-marquee-left:hover,
            .animate-marquee-right:hover {
              animation-play-state: paused;
            }
          `,
            }}
          />

          <div className="mx-auto max-w-5xl px-4">
            {/* Header Content */}
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <div className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 mb-5 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                Testimonials
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5 max-w-2xl">
                Real Feedback from Satisfied Customers
              </h2>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-2xl">
                Discover what real clients have to say about how our services have helped them
                achieve their goals and gather insights effortlessly.
              </p>
            </div>

            {/* Row 1: Scrolling Left */}
            <div className="relative flex overflow-hidden w-full gap-6 mt-6 [mask-image:_linear-gradient(to_right,_transparent_0,_black_15%,_black_85%,_transparent_100%)]">
              <div className="animate-marquee-left gap-6 flex">
                {[...ROW1_TESTIMONIALS, ...ROW1_TESTIMONIALS].map((t, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-[280px] bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${t.bg} flex items-center justify-center font-bold text-xs shrink-0 border border-black/5`}
                        >
                          {t.initial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 leading-tight">
                            {t.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                            {t.title}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-3.5 leading-relaxed font-medium">
                        "{t.text}"
                      </p>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mt-3 text-amber-400 text-[10px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Scrolling Right */}
            <div className="relative flex overflow-hidden w-full gap-6 mt-6 [mask-image:_linear-gradient(to_right,_transparent_0,_black_15%,_black_85%,_transparent_100%)]">
              <div className="animate-marquee-right gap-6 flex">
                {[...ROW2_TESTIMONIALS, ...ROW2_TESTIMONIALS].map((t, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-[280px] bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${t.bg} flex items-center justify-center font-bold text-xs shrink-0 border border-black/5`}
                        >
                          {t.initial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 leading-tight">
                            {t.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                            {t.title}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-3.5 leading-relaxed font-medium">
                        "{t.text}"
                      </p>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mt-3 text-amber-400 text-[10px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white pb-24 pt-6 px-4">
          <div className="mx-auto max-w-5xl bg-slate-900 rounded-[32px] p-12 md:p-20 text-white relative overflow-hidden flex flex-col items-center text-center shadow-lg border border-slate-800">
            {/* Background Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,155,94,0.15)_0%,transparent_65%)] pointer-events-none" />

            {/* Content wrapper */}
            <div className="relative z-10 flex flex-col items-center max-w-2xl">
              {/* Rating Stars and Score */}
              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex gap-0.5 text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-300">4.9/5</span>
              </div>

              {/* Overlapping Avatar Stack */}
              <div className="flex -space-x-2.5 mb-3.5">
                {[
                  { initial: "D", bg: "bg-emerald-500 ring-2 ring-slate-900 text-white" },
                  { initial: "E", bg: "bg-amber-500 ring-2 ring-slate-900 text-white" },
                  { initial: "G", bg: "bg-blue-500 ring-2 ring-slate-900 text-white" },
                  { initial: "H", bg: "bg-indigo-500 ring-2 ring-slate-900 text-white" },
                  { initial: "J", bg: "bg-rose-500 ring-2 ring-slate-900 text-white" },
                ].map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${avatar.bg}`}
                  >
                    {avatar.initial}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-800 ring-2 ring-slate-900 flex items-center justify-center font-bold text-[9px] text-slate-300">
                  100K+
                </div>
              </div>

              {/* Stack description text */}
              <p className="text-xs text-slate-400 font-semibold mb-6">
                Over 100K+ creators, and businesses choose us
              </p>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] mb-6">
                Empowering Your Audience Insights
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light mb-8 max-w-xl">
                Trust us to deliver cutting-edge survey building, custom branding, and real-time
                analytics, all designed to help you understand your audience effortlessly.
              </p>

              {/* CTA Button */}
              <Link to={ctaTo}>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-base font-bold text-white hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10 cursor-pointer"
                >
                  Get Started now
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 text-slate-500 pt-20 pb-28 md:pt-28 md:pb-40 relative z-50 overflow-hidden border-t border-slate-100/60">
        <div className="mx-auto max-w-6xl px-4 md:px-6 relative z-10">
          <div className="bg-white border border-slate-100 rounded-[40px] p-10 md:p-16 lg:p-20 shadow-[0_15px_50px_rgba(0,0,0,0.02)]">
            <div className="grid gap-12 grid-cols-2 md:grid-cols-5 items-start">
              {/* Column 1: Brand info & Socials */}
              <div className="col-span-2 flex flex-col items-start pr-0 md:pr-8">
                <Link to="/" className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
                  <span className="grid h-8.5 w-8.5 place-items-center rounded-lg bg-brand-500 text-base text-white font-black shadow-sm">
                    F
                  </span>
                  Formly
                </Link>
                <p className="text-sm md:text-[15px] text-slate-500 font-normal leading-relaxed mt-5 max-w-sm">
                  Formly empowers teams to transform raw feedback into clear, compelling insights —
                  making forms easier to build, understand, and act on.
                </p>

                {/* Social Icons Row */}
                <div className="flex gap-5 mt-8 text-slate-400">
                  {/* X / Twitter */}
                  <a
                    href="https://x.com"
                    className="hover:text-slate-900 transition-colors duration-200 cursor-pointer"
                    aria-label="X"
                  >
                    <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                      <title>X (formerly Twitter)</title>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    className="hover:text-slate-900 transition-colors duration-200 cursor-pointer"
                    aria-label="Instagram"
                  >
                    <svg
                      className="w-5.5 h-5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <title>Instagram</title>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                    </svg>
                  </a>
                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    className="hover:text-slate-900 transition-colors duration-200 cursor-pointer"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                      <title>LinkedIn</title>
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  {/* GitHub */}
                  <a
                    href="https://github.com"
                    className="hover:text-slate-900 transition-colors duration-200 cursor-pointer"
                    aria-label="GitHub"
                  >
                    <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                      <title>GitHub</title>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Column 2: Product Links */}
              <div className="flex flex-col gap-4">
                <span className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-1 block">
                  Product
                </span>
                <a
                  href="#features"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Features
                </a>
                <a
                  href="/pricing"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Pricing
                </a>
                <a
                  href="/integrations"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Integrations
                </a>
                <a
                  href="/changelog"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Changelog
                </a>
              </div>

              {/* Column 3: Resources Links */}
              <div className="flex flex-col gap-4">
                <span className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-1 block">
                  Resources
                </span>
                <a
                  href="/docs"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Documentation
                </a>
                <a
                  href="/tutorials"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Tutorials
                </a>
                <a
                  href="/blog"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Blog
                </a>
                <a
                  href="/support"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Support
                </a>
              </div>

              {/* Column 4: Company Links */}
              <div className="flex flex-col gap-4">
                <span className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-1 block">
                  Company
                </span>
                <a
                  href="/about"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  About
                </a>
                <a
                  href="/careers"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Careers
                </a>
                <a
                  href="/contact"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Contact
                </a>
                <a
                  href="/partners"
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 block text-sm font-medium cursor-pointer"
                >
                  Partners
                </a>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="border-t border-slate-100 mt-16 pt-10 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400 gap-4">
              <span>© 2026 Formly. All rights reserved.</span>
              <div className="flex gap-6">
                <a
                  href="/privacy"
                  className="text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Terms of Service
                </a>
                <a
                  href="/cookies"
                  className="text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Cookies Settings
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[12rem] sm:text-[18rem] md:text-[22rem] lg:text-[26rem] font-black text-slate-200/70 tracking-tight text-center w-full absolute bottom-[-4rem] md:bottom-[-7rem] left-0 right-0 pointer-events-none select-none leading-none z-0">
          Formly
        </div>
      </footer>
    </div>
  )
}
