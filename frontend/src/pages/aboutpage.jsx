import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Blocks, Sprout, Mountain, Wheat, TrendingUp, Factory, Info } from "lucide-react";

/**
 * Uttarakhand Millet Programme – About Page
 *
 * Notes:
 * 1. Replace SAMPLE_DISTRICTS with API data from your backend.
 * 2. If you already have a district GeoJSON, replace UTTARAKHAND_DISTRICTS_SVG with your real map.
 * 3. Each district path below is a simplified placeholder layout for dashboard UI prototyping.
 * 4. Hovering a district shows district name, blocks, and farmers.
 */

const SAMPLE_DISTRICTS = [
  { id: "dehradun", name: "Dehradun", blocks: 6, farmers: 1240, areaHa: 320 },
  { id: "haridwar", name: "Haridwar", blocks: 6, farmers: 980, areaHa: 280 },
  { id: "uttarkashi", name: "Uttarkashi", blocks: 6, farmers: 860, areaHa: 240 },
  { id: "tehri", name: "Tehri Garhwal", blocks: 9, farmers: 1560, areaHa: 410 },
  { id: "pauri", name: "Pauri Garhwal", blocks: 15, farmers: 2100, areaHa: 520 },
  { id: "chamoli", name: "Chamoli", blocks: 9, farmers: 1180, areaHa: 300 },
  { id: "rudraprayag", name: "Rudraprayag", blocks: 3, farmers: 640, areaHa: 175 },
  { id: "bageshwar", name: "Bageshwar", blocks: 3, farmers: 720, areaHa: 210 },
  { id: "almora", name: "Almora", blocks: 11, farmers: 1880, areaHa: 465 },
  { id: "nainital", name: "Nainital", blocks: 8, farmers: 1110, areaHa: 290 },
  { id: "champawat", name: "Champawat", blocks: 4, farmers: 690, areaHa: 190 },
  { id: "pithoragarh", name: "Pithoragarh", blocks: 8, farmers: 1320, areaHa: 355 },
  { id: "usnagar", name: "Udham Singh Nagar", blocks: 7, farmers: 970, areaHa: 260 },
];

const UTTARAKHAND_DISTRICTS_SVG = [
  { id: "dehradun", path: "M60 220 L120 205 L135 240 L105 275 L50 260 Z" },
  { id: "haridwar", path: "M120 255 L170 248 L182 285 L132 300 L105 275 Z" },
  { id: "uttarkashi", path: "M70 120 L145 105 L155 165 L120 205 L60 220 L40 165 Z" },
  { id: "tehri", path: "M145 105 L205 115 L220 175 L155 165 Z" },
  { id: "pauri", path: "M155 165 L220 175 L235 235 L170 248 L120 205 Z" },
  { id: "chamoli", path: "M205 115 L280 110 L295 175 L220 175 Z" },
  { id: "rudraprayag", path: "M220 175 L260 178 L268 220 L235 235 Z" },
  { id: "bageshwar", path: "M295 175 L340 165 L352 208 L310 225 L268 220 L260 178 Z" },
  { id: "almora", path: "M268 220 L310 225 L322 275 L255 290 L235 235 Z" },
  { id: "nainital", path: "M322 275 L370 270 L385 315 L335 328 Z" },
  { id: "champawat", path: "M352 208 L392 202 L405 245 L370 270 L322 275 L310 225 Z" },
  { id: "pithoragarh", path: "M340 165 L430 150 L455 232 L405 245 L392 202 L352 208 Z" },
  { id: "usnagar", path: "M255 290 L335 328 L285 360 L210 330 Z" },
];

const objectives = [
  "Promote millet cultivation in suitable agro-climatic zones of Uttarakhand.",
  "Improve productivity through better agronomic practices and farmer training.",
  "Conserve and promote traditional millet varieties and local seed systems.",
  "Strengthen household-level millet consumption and nutrition awareness.",
  "Support decentralized processing, value addition, and entrepreneurship.",
  "Enhance market access through SHGs, FPOs, and institutional convergence.",
];

const components = [
  {
    title: "Farmer Registration",
    icon: Users,
    desc: "Digital registration of millet farmers for planning, monitoring, and benefit delivery.",
  },
  {
    title: "Seed & Demonstrations",
    icon: Sprout,
    desc: "Promotion of quality seed, local varieties, and improved package of practices.",
  },
  {
    title: "Mechanization Support",
    icon: Wheat,
    desc: "Appropriate equipment and custom hiring support for reducing drudgery in hill agriculture.",
  },
  {
    title: "Processing & Value Addition",
    icon: Factory,
    desc: "Post-harvest management, primary processing, branding, and millet product development.",
  },
];

function getChoroplethColor(value, min, max) {
  if (max === min) return "#86efac";
  const ratio = (value - min) / (max - min);
  if (ratio < 0.2) return "#dcfce7";
  if (ratio < 0.4) return "#bbf7d0";
  if (ratio < 0.6) return "#86efac";
  if (ratio < 0.8) return "#4ade80";
  return "#16a34a";
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card className="rounded-2xl shadow-sm border-green-100">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="p-3 rounded-2xl bg-green-50">
          <Icon className="h-5 w-5 text-green-700" />
        </div>
      </CardContent>
    </Card>
  );
}

function DistrictChoropleth({ districts }) {
  const [hovered, setHovered] = useState(null);

  const districtMap = useMemo(() => {
    return districts.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, [districts]);

  const farmerValues = districts.map((d) => d.farmers);
  const minFarmers = Math.min(...farmerValues);
  const maxFarmers = Math.max(...farmerValues);

  return (
    <div className="relative">
      <div className="rounded-3xl border bg-white p-4 shadow-sm overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">District Coverage Map</h3>
            <p className="text-sm text-slate-500">Hover over a district to view blocks and registered farmers.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Low</span>
            <div className="flex overflow-hidden rounded-full border">
              {["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#16a34a"].map((c) => (
                <div key={c} className="h-3 w-8" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>

        <div className="relative w-full">
          <svg viewBox="0 0 520 420" className="w-full h-auto">
            {UTTARAKHAND_DISTRICTS_SVG.map((feature) => {
              const district = districtMap[feature.id];
              const fill = district
                ? getChoroplethColor(district.farmers, minFarmers, maxFarmers)
                : "#e2e8f0";

              return (
                <path
                  key={feature.id}
                  d={feature.path}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onMouseEnter={() => setHovered(district || null)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </svg>

          {hovered && (
            <div className="absolute right-4 top-4 w-64 rounded-2xl border bg-white/95 backdrop-blur p-4 shadow-lg">
              <p className="text-sm font-semibold text-slate-900">{hovered.name}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Blocks</span>
                  <span className="font-medium text-slate-900">{hovered.blocks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registered Farmers</span>
                  <span className="font-medium text-slate-900">{hovered.farmers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Area under Millets</span>
                  <span className="font-medium text-slate-900">{hovered.areaHa} ha</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UttarakhandMilletAboutPage() {
  const totals = useMemo(() => {
    const farmers = SAMPLE_DISTRICTS.reduce((sum, d) => sum + d.farmers, 0);
    const blocks = SAMPLE_DISTRICTS.reduce((sum, d) => sum + d.blocks, 0);
    const areaHa = SAMPLE_DISTRICTS.reduce((sum, d) => sum + d.areaHa, 0);
    return {
      districts: SAMPLE_DISTRICTS.length,
      blocks,
      farmers,
      areaHa,
      villages: 1248,
      shgs: 186,
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 relative">
          <div className="max-w-3xl">
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/15 rounded-full px-4 py-1">
              Uttarakhand Millet Initiative
            </Badge>
            <h1 className="mt-5 text-4xl lg:text-5xl font-bold leading-tight">
              About the Uttarakhand Millet Programme
            </h1>
            <p className="mt-5 text-base lg:text-lg text-green-50 leading-8">
              The Uttarakhand Millet Programme is designed to strengthen traditional mountain farming,
              improve farmer livelihoods, support nutrition security, and build resilient millet-based
              value chains across the state.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="px-4 py-2 rounded-full bg-white/10 border border-white/15">Climate-resilient agriculture</span>
              <span className="px-4 py-2 rounded-full bg-white/10 border border-white/15">Traditional crops revival</span>
              <span className="px-4 py-2 rounded-full bg-white/10 border border-white/15">Nutrition and livelihoods</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <StatCard title="Districts Covered" value={totals.districts} subtitle="State-wide reach" icon={MapPin} />
          <StatCard title="Blocks Covered" value={totals.blocks} subtitle="Across hill and plain regions" icon={Blocks} />
          <StatCard title="Registered Farmers" value={totals.farmers.toLocaleString()} subtitle="Millet farmers onboarded" icon={Users} />
          <StatCard title="Area under Millets" value={`${totals.areaHa.toLocaleString()} ha`} subtitle="Current registered area" icon={Sprout} />
          <StatCard title="Villages Reached" value={totals.villages.toLocaleString()} subtitle="Programme outreach" icon={Mountain} />
          <StatCard title="SHGs / Groups" value={totals.shgs} subtitle="Community institutions involved" icon={TrendingUp} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8 items-stretch">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Background</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 leading-8 space-y-4">
            <p>
              Millets have long been part of Uttarakhand’s traditional agriculture and food culture,
              especially in rainfed and hill farming systems. These crops are nutritious, hardy, and
              well suited to diverse agro-climatic conditions across the state.
            </p>
            <p>
              Revitalizing millet cultivation supports small and marginal farmers, strengthens household
              nutrition, preserves local crop diversity, and creates opportunities for decentralized
              processing and value addition through SHGs, farmer groups, and FPOs.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm bg-green-50">
          <CardHeader>
            <CardTitle className="text-2xl">Programme Framework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Department of Agriculture, Uttarakhand",
                desc: "Policy direction, implementation oversight, and programme monitoring.",
              },
              {
                title: "District and Block Agriculture Teams",
                desc: "Farmer mobilization, field verification, demonstrations, and local monitoring.",
              },
              {
                title: "SHGs, FPOs, and Community Institutions",
                desc: "Processing, value addition, market linkage, and nutrition outreach.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-4 border border-green-100">
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-600 mt-1 leading-6">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <DistrictChoropleth districts={SAMPLE_DISTRICTS} />
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="rounded-3xl shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Major Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {objectives.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-green-600 shrink-0" />
                    <p className="text-slate-700 leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Key Programme Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {components.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-slate-100 p-5 bg-white">
                      <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-green-700" />
                      </div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600 mt-2 leading-6">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <Card className="rounded-3xl border-0 shadow-sm bg-gradient-to-r from-amber-50 to-green-50">
          <CardContent className="p-8 lg:p-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white shadow-sm">
                <Info className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">Why Millets Matter for Uttarakhand</h3>
                <p className="mt-3 text-slate-700 leading-8 max-w-4xl">
                  Millets are not only crops of the past but crops of the future for Uttarakhand. They support
                  sustainable hill agriculture, strengthen nutrition security, and create livelihood opportunities
                  through processing, entrepreneurship, and local market development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
