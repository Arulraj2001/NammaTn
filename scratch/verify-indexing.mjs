// scratch/verify-indexing.mjs
// Verifies current HTTP status + redirects for URLs affected by indexing issues

const urls = [
  'https://www.vizhitn.in/thoothukudi/',
  'https://www.vizhitn.in/thoothukudi',
  'https://www.vizhitn.in/district/chennai',
  'https://www.vizhitn.in/coimbatore/road-infrastructure',
  'https://www.vizhitn.in/coimbatore/road-infrastructure/',
  'https://vizhitn.in/thoothukudi',
  'https://www.vizhitn.in/explore/',
  'https://www.vizhitn.in/this-page-should-not-exist',
  'https://www.vizhitn.in/coimbatore/electricity',
  'https://www.vizhitn.in/coimbatore/water-sanitation',
];

async function check(url) {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IndexingChecker/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    const location = res.headers.get('location') || '';
    const robots = res.headers.get('x-robots-tag') || '';
    console.log(`${res.status}  ${location ? '-> ' + location : ''}  ${robots ? '[X-Robots: ' + robots + ']' : ''}  ${url}`);
  } catch (e) {
    console.log(`ERR  ${e.message}  ${url}`);
  }
}

(async () => {
  console.log('=== VizhiTN URL Status Verification ===');
  for (const url of urls) {
    await check(url);
  }
  console.log('=== Done ===');
})();