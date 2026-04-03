const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const fixes = {
  'Ã¢â‚¬Â¢': '•',
  'Ã¢Å“â€¢': '✕',
  'Ã¢â€“Â²': '▲',
  'Ã¢â€“Â¼': '▼',
  'ÄŸÅ¸Å¡Â¨': '🚨',
  'Ã¢Å¡Â¡': '⚡',
  'Ã¢Å¡Â\xa0Ã¯Â¸Â ': '⚠️',
  'ÄŸÅ¸â€\xa0Âµ': '🔵',
  'Ã¢â€\xa0Â ': '←',
  'Ãƒâ€“': 'Ö',
  'ÃƒÅ“': 'Ü',
  'Ã„Â°': 'İ',
  'Ã…Âž': 'Ş',
  'Ã„Â±': 'ı',
  'ÃƒÂ¶': 'ö',
  'Ã…Å¸': 'ş',
  'Ã„Å¸': 'ğ',
  'ÃƒÂ¼': 'ü',
  'ÃƒÂ§': 'ç',
  'Ã‡': 'Ç',
  'Ãœ': 'Ü'
};

for (const [bad, good] of Object.entries(fixes)) {
  code = code.split(bad).join(good);
}

fs.writeFileSync('src/App.jsx', code, 'utf8');
