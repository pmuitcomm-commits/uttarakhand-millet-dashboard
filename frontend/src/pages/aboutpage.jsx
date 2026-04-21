import React from "react";
import {
  User,
  Bell,
  Home,
  BookOpen,
  LayoutDashboard,
  Map,
  Award,
  Landmark,
  Wheat,
  BadgeIndianRupee,
  Factory,
  Sprout,
  Users,
  Megaphone,
  Truck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const stats = [
  { label: "Districts", value: "13" },
  { label: "Blocks", value: "95" },
  { label: "Gram Panchayats", value: "7791" },
  { label: "Villages", value: "16793" },
  { label: "Registered User / Farmers", value: "250000+" },
];

const recognitions = [
  "The Uttarakhand Millet Initiative is aligned with the International Year of Millets vision and promotes nutri-cereals as climate-resilient crops for hill agriculture.",
  "The project strengthens farmer registration, district-level planning and real-time monitoring through a digital MIS dashboard tailored for Uttarakhand.",
  "The initiative supports evidence-based decision making for administrators at state, district and block level through role-based dashboards.",
  "Special focus is placed on traditional millet cultivation, local value chains and improved access to schemes and services for farmers.",
  "The platform is designed to improve transparency in farmer data management, regional reporting and monthly progress tracking.",
  "The project encourages convergence between agriculture, extension systems and local institutions for sustainable millet-based livelihoods.",
];

const milestones = [
  "Creation of a unified digital farmer registry for millet growers across Uttarakhand.",
  "Role-based dashboards prepared for state, district and block-level monitoring.",
  "Farmer registration, authentication and login workflows structured for transparent data handling.",
  "Region-wise analytics introduced for faster review of coverage and implementation progress.",
  "Monthly employee progress reporting integrated into the MIS workflow.",
  "Foundation established for scalable agriculture data systems using free and open-source tools.",
];

const architectureCards = [
  {
    title: "Led By Department of Agriculture, Uttarakhand",
    points: [
      "Programme oversight and policy direction",
      "District-wise monitoring and review",
      "Coordination with field offices and implementation teams",
    ],
  },
  {
    title: "Powered By MIS Dashboard System",
    points: [
      "Role-based access for admin, district and block users",
      "Farmer registration, login and dashboard workflows",
      "Data-driven reporting for planning and implementation",
    ],
  },
  {
    title: "Built On Open Digital Stack",
    points: [
      "PostgreSQL-based data backbone",
      "Dashboard and reporting through open-source tools",
      "Scalable architecture for future agriculture modules",
    ],
  },
];

const objectives = [
  "Build a state-wide millet farmer registry",
  "Enable district and block level monitoring",
  "Track monthly field progress efficiently",
  "Support transparent farmer data management",
  "Strengthen millet-focused planning and reporting",
  "Improve administrative decision-making through dashboards",
  "Create a scalable foundation for AgriStack-like services",
];

const components = [
  {
    title: "Farmer Registration and Login",
    icon: <Users className="h-6 w-6" />,
    points: [
      "Digital registration of millet farmers across Uttarakhand",
      "Secure login workflows for registered users",
      "Structured capture of farmer and regional details",
      "Improved accessibility of farmer records for administration",
    ],
  },
  {
    title: "State, District and Block Dashboards",
    icon: <LayoutDashboard className="h-6 w-6" />,
    points: [
      "Dedicated dashboards for each administrative level",
      "Region-wise summaries for faster monitoring",
      "Improved visibility into registrations and implementation progress",
      "Quick review of dashboard metrics for officials",
    ],
  },
  {
    title: "Millet Crop Focus",
    icon: <Sprout className="h-6 w-6" />,
    points: [
      "Exclusive focus on millet-related farmer data",
      "Support for traditional and climate-resilient crops",
      "Better planning for millet promotion in hill regions",
      "Alignment with nutrition and livelihood objectives",
    ],
  },
  {
    title: "Monthly Employee Progress Reports",
    icon: <BookOpen className="h-6 w-6" />,
    points: [
      "Track monthly work completed by field staff",
      "Support accountability and performance review",
      "Make reporting easier across administrative levels",
      "Enable structured monitoring of implementation activities",
    ],
  },
  {
    title: "Region-Based Analytics",
    icon: <Map className="h-6 w-6" />,
    points: [
      "District and block-wise analysis of farmer records",
      "Visual summaries for decision support",
      "Quick identification of gaps and coverage trends",
      "Improved planning for targeted interventions",
    ],
  },
  {
    title: "Open-Source Technology Framework",
    icon: <Factory className="h-6 w-6" />,
    points: [
      "Built using PostgreSQL and other free/open-source tools",
      "Designed for sustainability and cost efficiency",
      "Easier future expansion into additional agriculture services",
    ],
  },
  {
    title: "Administrative Decision Support",
    icon: <Megaphone className="h-6 w-6" />,
    points: [
      "Support evidence-based planning for officials",
      "Strengthen review and monitoring workflows",
      "Enable better coordination between state and field units",
    ],
  },
];

const flowLevels = ["State Level", "District Level", "Block Level"];

const mPassteps = [
  "Farmer details are collected through the digital registration workflow.",
  "Farmer records are entered and validated in the Uttarakhand millet MIS system.",
  "District-level teams review registration and dashboard records.",
  "Regional mapping enables block and district-wise verification of entries.",
  "Authenticated users access dashboards based on their assigned role.",
  "Corrections and updates are managed through administrative review.",
  "Reports are generated for monitoring, planning and monthly progress review.",
  "Consolidated insights support faster decision-making at state level.",
];

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-wide text-[#0f5a2c] uppercase">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-lg md:text-2xl text-slate-800">{subtitle}</p>
      ) : null}
      <div className="mx-auto mt-5 h-px w-full max-w-5xl bg-[#b9c89d]" />
    </div>
  );
}

function SoftImage({ label, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#cfddb4] bg-gradient-to-br from-[#d7e4bb] via-[#eef3db] to-[#ccdca6] shadow-md ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.7),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,90,44,.08),transparent_30%)]" />
      <div className="relative flex h-full min-h-[220px] items-center justify-center p-6 text-center text-xl font-semibold text-slate-600">
        {label}
      </div>
    </div>
  );
}

function MiniBadge({ children }) {
  return (
    <div className="rounded-2xl bg-[#2f7f79] px-4 py-3 text-sm md:text-base font-semibold text-white shadow-md">
      {children}
    </div>
  );
}

export default function UttarakhandMilletProjectLandingPage() {
  return (
    <div className="min-h-screen bg-[#efefef] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#053b47] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#d79652] to-[#9a5a1d] text-xs font-bold text-white shadow-lg">
              UTTARAKHAND
            </div>
            <div>
              <div className="text-3xl font-black tracking-tight">UTTARAKHAND</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                Millet Project
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-lg font-semibold lg:flex">
            <a href="#" className="flex items-center gap-2 hover:text-[#d9ef87]"><Home className="h-4 w-4" />Home</a>
            <a href="#about" className="hover:text-[#d9ef87]">Program</a>
            <a href="#resources" className="hover:text-[#d9ef87]">Resources</a>
            <a href="#dashboard" className="hover:text-[#d9ef87]">Dashboard</a>
            <a href="#milletshakti" className="hover:text-[#d9ef87]">MilletShakti</a>
            <a href="#notifications" className="flex items-center gap-2 hover:text-[#d9ef87]"><Bell className="h-4 w-4" />Notifications</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-white/85 text-[#053b47] shadow lg:flex">
              <Landmark className="h-7 w-7" />
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[#06351d]/45" />
        <div className="relative mx-auto flex min-h-[220px] max-w-7xl items-center justify-center px-6 py-16 text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-white md:text-6xl">About Project</h1>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr_220px]">
          <div className="overflow-hidden rounded-2xl border border-[#a4b153] bg-white shadow-sm">
            {stats.map((item, idx) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-5 py-5 ${idx !== stats.length - 1 ? "border-b border-[#a4b153]" : ""}`}
              >
                <span className="text-3xl font-extrabold text-[#0e7b1b]">{item.value}</span>
                <span className="text-2xl text-slate-800">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center rounded-[2.5rem] bg-[#eef0e8] shadow-inner">
              <div className="absolute inset-8 rounded-[2rem] border border-dashed border-[#b2c768]" />
              <Map className="h-28 w-28 text-[#94ab1b]" />
              <div className="absolute bottom-5 rounded-full bg-[#94ab1b] px-5 py-2 text-white shadow">Uttarakhand District Map</div>
            </div>

            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-[#efc993] via-[#ca7e35] to-[#744113] p-2 shadow-xl">
              <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#ffe2bc] bg-[#b66b2d] text-center text-sm font-extrabold uppercase tracking-wide text-white">
                Millet Project
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-start pt-2 text-center">
            <div className="text-sm leading-7 text-slate-500">
              <div>0</div>
              <div>1-3</div>
              <div>4-5</div>
              <div>5+</div>
            </div>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">No. Of Blocks</h3>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-8">
        <div className="flex justify-center pb-4">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-[#efc993] via-[#ca7e35] to-[#744113] p-2 shadow-xl">
            <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#ffe2bc] bg-[#b66b2d] text-center text-sm font-extrabold uppercase tracking-wide text-white">
              Millet Project
            </div>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl text-slate-900">Overview and impact of the Uttarakhand Millet Project</h2>
          <div className="mx-auto mt-4 h-px w-full max-w-5xl bg-slate-300" />
          <h3 className="mt-5 text-2xl md:text-4xl text-[#0d7b17]">
            A digital initiative for farmer registry, monitoring and millet-focused governance.
          </h3>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recognitions.map((item) => (
            <div key={item} className="min-h-[180px] rounded-sm bg-[#deebe6] p-7 text-xl leading-10 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 bg-[#dde3b7] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionTitle
            title="Project Milestones"
            subtitle="Key progress areas of the Uttarakhand Millet Project:"
          />

          <div className="relative mt-12 hidden md:block">
            <div className="absolute left-0 right-0 top-1/2 h-6 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#5f8c95] via-[#8ed5da] to-[#d7c965] opacity-80" />
            <div className="grid grid-cols-6 gap-4">
              {milestones.map((item, index) => (
                <div key={item} className={`relative ${index % 2 ? "pt-40" : "pb-40"}`}>
                  <div className={`absolute left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-[#eef0d3] shadow ${index % 2 ? "top-[calc(50%-12px)]" : "top-[calc(50%-12px)]"}`} />
                  <div className={`rounded-2xl p-4 text-lg font-semibold text-white shadow-lg ${index % 3 === 0 ? "bg-[#2f7f79]" : index % 3 === 1 ? "bg-[#a78a5a]" : "bg-[#6ca68a]"}`}>
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:hidden">
            {milestones.map((item) => (
              <div key={item} className="rounded-2xl bg-[#70907b] p-4 text-white shadow">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <SoftImage label="Background / Consultation Photograph" className="min-h-[380px]" />
        <div className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase">Background</h2>
          <div className="h-px w-full bg-slate-300" />
          <p className="text-2xl leading-10">
            The Uttarakhand Millet Project is a digital agriculture initiative designed to support farmer registry, reporting and decision-making for millet-focused development in the state.
          </p>
          <div className="h-px w-full bg-slate-300" />
          <p className="text-xl leading-10">
            The platform has been structured to help manage farmer data, strengthen monitoring systems and improve access to region-wise insights for administrators and field teams.
          </p>
          <div className="h-px w-full bg-slate-300" />
          <p className="text-xl leading-10">
            It supports a practical, scalable MIS approach for state, district and block-level use, with special emphasis on transparent records and progress tracking.
          </p>
        </div>
      </section>

      <section className="bg-[#dde6bc] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase text-[#0f5a2c]">System Architecture</h2>
            <div className="mt-5 h-px w-full max-w-xl bg-[#b9c89d]" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-4 text-2xl font-extrabold">{architectureCards[0].title}</h3>
                <ul className="space-y-3 text-xl text-slate-700">
                  {architectureCards[0].points.map((point) => (
                    <li key={point} className="flex gap-3"><span>•</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-[460px] w-full max-w-[520px]">
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[#d6ac7e]" />
                <div className="absolute left-1/2 top-12 flex h-40 w-40 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-xl">
                  <Landmark className="h-16 w-16 text-slate-700" />
                </div>
                <div className="absolute bottom-10 left-10 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-xl">
                  <Wheat className="h-16 w-16 text-[#317a6f]" />
                </div>
                <div className="absolute bottom-10 right-10 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-xl">
                  <BookOpen className="h-16 w-16 text-[#5647a5]" />
                </div>
                <div className="absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#d48c49] to-[#bb6c29] p-3 shadow-2xl">
                  <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#f8d5aa] text-center text-2xl font-extrabold uppercase text-white">
                    Millet Project
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-4 text-2xl font-extrabold">{architectureCards[1].title}</h3>
                <ul className="space-y-3 text-xl text-slate-700">
                  {architectureCards[1].points.map((point) => (
                    <li key={point} className="flex gap-3"><span>•</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-4 text-2xl font-extrabold">{architectureCards[2].title}</h3>
                <ul className="space-y-3 text-xl text-slate-700">
                  {architectureCards[2].points.map((point) => (
                    <li key={point} className="flex gap-3"><span>•</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-center text-3xl md:text-5xl font-extrabold uppercase">Objectives and Framework</h2>
            <div className="my-8 text-center text-2xl font-bold uppercase text-[#f0b321]">Core Objectives</div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {objectives.map((item, idx) => (
                <div key={item} className={`px-6 py-5 text-center text-xl md:text-2xl font-semibold ${idx !== objectives.length - 1 ? "border-b border-slate-200" : ""}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center rounded-3xl bg-[#f1f4e9] p-6 shadow-inner">
            <div className="grid w-full max-w-[700px] place-items-center gap-6 md:grid-cols-3">
              <MiniBadge>Farmer registry with district and block mapping</MiniBadge>
              <MiniBadge>Role-based dashboard access for officials</MiniBadge>
              <MiniBadge>Millet-focused regional monitoring and analytics</MiniBadge>
              <MiniBadge>Monthly progress tracking across field teams</MiniBadge>
              <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-[#d48c49] to-[#bb6c29] p-3 shadow-2xl">
                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#f8d5aa] text-center text-2xl font-extrabold uppercase text-white">
                  Millet Project
                </div>
              </div>
              <MiniBadge>Scalable digital backbone for future expansion</MiniBadge>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#dce4b5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionTitle title="Components of the Project" />
          <p className="mb-12 text-xl md:text-2xl leading-10">
            <span className="font-extrabold">Implementation Structure:</span> The project is designed for use across state, district and block levels, supporting farmer registration, dashboard reporting, employee monitoring and millet-focused administration.
          </p>

          <div className="grid gap-8">
            {components.map((item, idx) => (
              <div key={item.title} className={`grid gap-8 items-center ${idx % 2 === 0 ? "lg:grid-cols-[380px_1fr]" : "lg:grid-cols-[1fr_380px]"}`}>
                {idx % 2 === 0 ? (
                  <SoftImage label={`${item.title} / Image`} className="min-h-[320px]" />
                ) : null}

                <div className="py-4">
                  <div className="mb-4 flex items-center gap-3 text-[#1a1a1a]">
                    <div className="rounded-2xl bg-white p-3 shadow">{item.icon}</div>
                    <h3 className="text-3xl md:text-5xl">{item.title} :</h3>
                  </div>
                  <ul className="space-y-3 text-lg md:text-2xl leading-10 text-slate-800">
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-[#0d7b17]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {idx % 2 !== 0 ? (
                  <SoftImage label={`${item.title} / Image`} className="min-h-[320px]" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-[#a77826] text-white shadow-2xl">
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="relative min-h-[360px] overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517022812141-23620dba5c23?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c2d14]/45 to-transparent" />
              <div className="relative p-8 md:p-14">
                <h2 className="max-w-xl text-4xl md:text-7xl font-bold leading-tight">Project Delivery Mechanism</h2>
              </div>
            </div>
            <div className="p-8 md:p-12">
              <div className="mb-8 flex items-center gap-4 text-[#d9b36c]">
                <BadgeIndianRupee className="h-14 w-14" />
                <div>
                  <div className="text-lg uppercase tracking-[0.35em] text-[#d0ad63]">Fund Flow</div>
                  <h3 className="text-4xl md:text-5xl font-semibold text-white">System Flow Design</h3>
                </div>
              </div>
              <div className="space-y-8 text-lg md:text-2xl leading-10">
                <div>
                  <h4 className="mb-2 text-3xl font-extrabold">Project Data Flow</h4>
                  <p>
                    Farmer registration, administrative review and dashboard insights move through a structured digital workflow to support transparent project implementation.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-3xl font-extrabold">Monitoring Flow</h4>
                  <p>
                    Progress reports and regional summaries are consolidated to help officials review performance and make timely decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl">
          <div className="grid gap-10 xl:grid-cols-[240px_1fr_1fr]">
            <div className="flex flex-col items-center justify-start gap-6 border-r border-slate-200 pr-6">
              <div className="grid place-items-center rounded-3xl bg-[#eef3d8] p-6 shadow-inner">
                <Users className="h-20 w-20 text-[#827122]" />
              </div>
              <div className="text-center text-[#7a6a1e]">
                <p className="text-xl font-semibold">Project implementation happens at three levels:</p>
              </div>
              <div className="w-full space-y-3">
                {flowLevels.map((level) => (
                  <div key={level} className="rounded-xl bg-[#8a7b2a] px-4 py-4 text-center text-white text-xl font-bold shadow">
                    {level}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {[
                ["State Agriculture Department", "Project Admin", "State Monitoring & Analytics"],
                ["District Dashboard Team", "District Nodal Officer", "District Reporting Unit"],
                ["Block Dashboard Team", "Field Monitoring", "Progress Review & Validation"],
                ["Farmer Registry", "Administrative Support", "Local Implementation Units"],
              ].map((row, idx) => (
                <div key={idx} className="grid gap-4 md:grid-cols-3">
                  {row.map((box) => (
                    <div key={box} className="rounded-2xl bg-[#7f7923] p-5 text-center text-lg font-semibold text-white shadow">
                      {box}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl bg-[#8c6120] p-6 text-center text-2xl font-semibold text-white shadow">
                State Project Administrator
              </div>
              <div className="rounded-2xl bg-[#9f6c23] p-6 text-center text-2xl font-semibold text-white shadow">
                District Project Administrator
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "Farmer Database",
                  "Block Administration",
                  "Farmer Registration",
                  "Dashboard Access",
                  "Regional Analytics",
                  "Progress Reporting",
                  "System Management",
                ].map((box) => (
                  <div key={box} className="rounded-2xl bg-[#a17025] p-5 text-center text-lg font-semibold text-white shadow">
                    {box}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#dce4b5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase">Uttarakhand Millet MIS Workflow</h2>
            <p className="mt-4 text-2xl md:text-5xl">Farmer Registry and Dashboard System</p>
          </div>

          <div className="mx-auto mb-8 max-w-4xl rounded-2xl bg-[#06777a] px-6 py-5 text-center text-2xl md:text-4xl text-slate-900 shadow-lg">
            Process of Farmer Registration and Monitoring
          </div>

          <div className="grid gap-4 lg:grid-cols-[160px_1fr_1fr_1fr]">
            <div className="flex flex-col items-center justify-start gap-3 rounded-3xl bg-[#ebdfc1] p-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f6ead1]">
                <Users className="h-12 w-12 text-[#7f6335]" />
              </div>
              <div className="text-3xl">Farmer</div>
            </div>

            {mPassteps.slice(0, 6).map((step, idx) => (
              <div
                key={step}
                className={`relative rounded-2xl p-6 text-center text-lg md:text-2xl shadow ${idx % 3 === 0 ? "bg-[#a8ddd8]" : idx % 3 === 1 ? "bg-[#c9dfc0]" : "bg-[#efdebc]"}`}
              >
                <div className="flex h-full items-center justify-center">{step}</div>
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-white lg:block" />
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl bg-[#d6e5a0] p-6 text-center text-lg md:text-2xl shadow">
              {mPassteps[6]}
            </div>
            <div className="rounded-2xl bg-[#8b8b8b] p-6 text-center text-lg md:text-2xl text-white shadow">
              {mPassteps[7]}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
