import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users, MapPin, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Users, en: "Citizens", ta: "குடிமக்கள்", value: "50K+" },
  { icon: MapPin, en: "Districts", ta: "மாவட்டங்கள்", value: "38" },
  { icon: MessageSquare, en: "Posts", ta: "பதிவுகள்", value: "10K+" },
];

export default function HeroSection() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-300 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-blue-700/50 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {T("Live Community Updates", "நேரடி சமுதாய புதுப்பிப்புகள்")}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4 tracking-tight">
            {T(
              "Your Voice for Tamil Nadu",
              "தமிழ்நாட்டிற்கான உங்கள் குரல்"
            )}
          </h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            {T(
              "Share local issues, celebrate progress, and discuss what matters in your district.",
              "உள்ளூர் சிக்கல்களை பகிரவும், முன்னேற்றத்தை கொண்டாடவும், உங்கள் மாவட்டத்தில் முக்கியமானவற்றை விவாதிக்கவும்."
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/create">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold w-full sm:w-auto">
                {T("Share an Update", "புதுப்பிப்பை பகிரவும்")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                {T("Explore Posts", "பதிவுகளை ஆராய்க")}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto"
        >
          {stats.map(({ icon: Icon, en, ta, value }) => (
            <div key={en} className="text-center bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <Icon className="w-5 h-5 mx-auto mb-1 text-blue-200" />
              <div className="text-xl font-bold">{value}</div>
              <div className="text-blue-200 text-xs">{T(en, ta)}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}