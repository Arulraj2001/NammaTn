#!/usr/bin/env node
/**
 * scripts/test-social-post.mjs
 * Test posting to Facebook and Instagram.
 *
 * Usage:
 *   node scripts/test-social-post.mjs --dry-run
 *   node scripts/test-social-post.mjs
 */

import { broadcastToSocials } from './lib/meta-social-poster.mjs';

const isDryRun = process.argv.includes('--dry-run');

const samplePost = {
  title_ta: 'அரசு கல்லூரி மாணவர்களுக்கு FREE LAPTOP!',
  title_en: 'Free Laptops for Tamil Nadu Government College Students',
  subtitle: '₹300 Cr School Upgrade + 10,000 Schools-க்கு Clean Campus',
  content_ta: 'வெற்றி மடிக்கணினி திட்டத்தின் கீழ் அரசு மற்றும் உதவி பெறும் கல்லூரி மாணவர்களுக்கு இலவச மடிக்கணினிகள் வழங்க தமிழக அரசு அரசாணை வெளியிட்டுள்ளது.',
  category_slug: 'education',
  district_slug: 'chennai',
  assigned_department: 'கல்லூரி கல்வி இயக்ககம் (உதவி எண்: 1100)',
  bullet1: 'வழங்கும் திட்டம் ➔ Vetri Laptop Scheme',
  bullet2: 'பள்ளி நவீனமயமாக்கல் ➔ ₹300 Crore / 3,734 Schools',
  bullet3: 'சுத்தமான வளாகம் ➔ ₹139 Crore / 10,000 Schools',
  slug: 'kamarajar-kaalai-unavu-thittam',
  image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
  direct_image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80'
};

async function main() {
  console.log(`Starting Social Media Auto-Post Test (Dry Run: ${isDryRun})...\n`);

  const results = await broadcastToSocials(samplePost, {
    isDryRun: isDryRun,
    siteOrigin: 'https://www.vizhitn.in'
  });

  console.log('Results:', JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error('Fatal error in social post test:', err);
  process.exit(1);
});
