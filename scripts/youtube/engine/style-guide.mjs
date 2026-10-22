// scripts/youtube/engine/style-guide.mjs
// Master Visual DNA & Palette Engine for Consistent Editorial Stills

export const CATEGORY_PALETTES = {
  finance: {
    primary: "#0F172A",
    accent: "#10B981",
    mood: "navy blue, dark emerald green, crisp gold lighting",
    keywords: "infographics, digital ledger, savings ledger, modern banking interface, clean financial graphics"
  },
  scams: {
    primary: "#18181B",
    accent: "#EF4444",
    mood: "charcoal dark slate, alarm crimson red, dramatic cyber contrast",
    keywords: "cyber security radar, locked smartphone screen, digital shield, biometric alert, high-tech forensic diagram"
  },
  rights: {
    primary: "#1E1B4B",
    accent: "#3B82F6",
    mood: "deep royal indigo, legal cobalt blue, ivory parchment tones",
    keywords: "official government portal seal, legal document folder, scales of justice, stamped application receipt, citizen rights handbook"
  },
  health: {
    primary: "#064E3B",
    accent: "#14B8A6",
    mood: "forest slate, surgical teal, clear calm lighting",
    keywords: "medical stethoscope, clinic desk, clean nutritional charts, doctor advisory room, wellness infographic"
  },
  career: {
    primary: "#1E293B",
    accent: "#F59E0B",
    mood: "slate graphite, ambition amber, modern office illumination",
    keywords: "skill development workspace, digital laptop desk, career roadmap flowchart, interview briefcase"
  },
  parenting: {
    primary: "#312E81",
    accent: "#8B5CF6",
    mood: "warm twilight purple, soft lavender, inviting warm home glow",
    keywords: "family study table, school textbook stack, childhood growth chart, friendly guidance diagram"
  }
};

/**
 * Builds a strictly consistent prompt adhering to VizhiTN's Editorial Graphic Novel DNA
 * @param {string} sceneConcept - The specific scene action/subject
 * @param {string} category - Content category (finance, scams, rights, etc.)
 * @param {'16:9'|'9:16'} [aspectRatio='16:9']
 * @returns {string} - Complete synthesized prompt
 */
export function buildScenePrompt(sceneConcept, category = 'finance', aspectRatio = '16:9') {
  const palette = CATEGORY_PALETTES[category] || CATEGORY_PALETTES.finance;

  // Unified Visual DNA Prefix injected into EVERY scene
  const STYLE_DNA = `High-end editorial vector infographic art, graphic novel aesthetic, clean bold outlines, cohesive palette of ${palette.mood}, volumetric atmospheric lighting, professional digital illustration, ${aspectRatio === '9:16' ? '9:16 vertical composition' : '16:9 widescreen composition'}`;

  // Strict negative prompt to ban photorealistic fake people and noise
  const NEGATIVE_PROMPT = "photorealistic human face, real photograph, camera snapshot, 3d clay render, distorted faces, blurry details, watermark, UI buttons, messy sketch, stock photo";

  return `${STYLE_DNA}, Scene: ${sceneConcept}, ${palette.keywords}, no realistic faces, no distorted text, clean 4k vector artwork. [Exclude: ${NEGATIVE_PROMPT}]`;
}
