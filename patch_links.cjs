const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'DigiHireLanding.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace Get Started dropdown items
content = content.replace(
  /<a href="#" className="flex items-center gap-3 px-3 py-2\.5 rounded-lg/g,
  '<Link to={i === 0 ? "/login?role=talent" : i === 1 ? "/login?role=brand" : "/"} className="flex items-center gap-3 px-3 py-2.5 rounded-lg'
).replace(
  /<\/span>\s*\{item\.label\}\s*<\/a>/g,
  '</span>\n                        {item.label}\n                      </Link>'
);

// Main CTA (Launch a Campaign)
content = content.replace(
  /<a\s*href="#"\s*className="btn-launch flex items-center gap-2 text-\[14px\] font-extrabold text-\[#06111F\] bg-\[#00C2FF\]/g,
  '<Link\n              to="/login?role=brand"\n              className="btn-launch flex items-center gap-2 text-[14px] font-extrabold text-[#06111F] bg-[#00C2FF]'
).replace(
  /<ArrowRight className="w-4 h-4" \/>\s*<\/a>/g,
  '<ArrowRight className="w-4 h-4" />\n            </Link>'
);

// Hero CTA
content = content.replace(
  /<a\s*href="#"\s*className="btn-launch inline-flex items-center justify-center gap-2 font-extrabold text-\[#06111F\] bg-\[#00C2FF\] rounded-xl px-12 py-4 text-\[16px\] transition-all duration-200"/g,
  '<Link\n              to={tab === "jobs" ? "/join-now?role=talent" : "/join-now?role=brand"}\n              className="btn-launch inline-flex items-center justify-center gap-2 font-extrabold text-[#06111F] bg-[#00C2FF] rounded-xl px-12 py-4 text-[16px] transition-all duration-200"'
).replace(
  /\{content\.cta\}\s*<\/a>/g,
  '{content.cta}\n            </Link>'
);

// Features CTA
content = content.replace(
  /<a href="#" className="btn-launch inline-flex items-center gap-2 text-\[14px\] font-extrabold text-\[#06111F\] bg-\[#00C2FF\] rounded-lg px-6 py-3 transition-all duration-200"/g,
  '<Link to="/join-now?role=talent" className="btn-launch inline-flex items-center gap-2 text-[14px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-lg px-6 py-3 transition-all duration-200"'
).replace(
  /Start Your Journey →\s*<\/a>/g,
  'Start Your Journey →\n                </Link>'
);

// Brands CTA 1
content = content.replace(
  /<a href="#" className="btn-launch inline-flex items-center gap-2 text-\[14px\] font-extrabold text-\[#06111F\] bg-\[#00C2FF\] rounded-lg px-6 py-3 transition-all duration-200" style=\{\{ fontFamily: "'Syne', sans-serif", boxShadow: "0 3px 16px rgba\(0,194,255,0\.3\)" \}\}>\s*Download App →\s*<\/a>/g,
  '<Link to="/join-now?role=talent" className="btn-launch inline-flex items-center gap-2 text-[14px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-lg px-6 py-3 transition-all duration-200" style={{ fontFamily: "\'Syne\', sans-serif", boxShadow: "0 3px 16px rgba(0,194,255,0.3)" }}>\n                Download App →\n              </Link>'
);

// Brands CTA 2
content = content.replace(
  /<a href="#" className="btn-launch inline-flex items-center gap-2 text-\[15px\] font-extrabold text-\[#06111F\] bg-\[#00C2FF\] rounded-xl px-8 py-4 transition-all duration-200" style=\{\{ fontFamily: "'Syne', sans-serif", boxShadow: "0 4px 24px rgba\(0,194,255,0\.4\)" \}\}>\s*Get Started →\s*<\/a>/g,
  '<Link to="/join-now?role=brand" className="btn-launch inline-flex items-center gap-2 text-[15px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-xl px-8 py-4 transition-all duration-200" style={{ fontFamily: "\'Syne\', sans-serif", boxShadow: "0 4px 24px rgba(0,194,255,0.4)" }}>\n                Get Started →\n              </Link>'
);

// Brands CTA 3
content = content.replace(
  /<a href="#" className="btn-launch inline-flex items-center gap-2 text-\[15px\] font-extrabold text-\[#06111F\] bg-\[#00C2FF\] rounded-xl px-10 py-4 transition-all duration-200" style=\{\{ fontFamily: "'Syne', sans-serif", boxShadow: "0 4px 24px rgba\(0,194,255,0\.4\)" \}\}>\s*Find Top Talent →\s*<\/a>/g,
  '<Link to="/join-now?role=brand" className="btn-launch inline-flex items-center gap-2 text-[15px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-xl px-10 py-4 transition-all duration-200" style={{ fontFamily: "\'Syne\', sans-serif", boxShadow: "0 4px 24px rgba(0,194,255,0.4)" }}>\n            Find Top Talent →\n          </Link>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Links patched successfully.');
