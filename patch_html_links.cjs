const fs = require('fs');
const path = require('path');

const files = ['index.html', 'about.html', 'blog.html', 'contact.html', 'events.html'];

files.forEach(fileName => {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace .html links with clean routes
  content = content.replace(/href="index\.html"/g, 'href="/"');
  content = content.replace(/href="about\.html"/g, 'href="/about"');
  content = content.replace(/href="blog\.html"/g, 'href="/blog"');
  content = content.replace(/href="contact\.html"/g, 'href="/contact"');
  content = content.replace(/href="events\.html"/g, 'href="/events"');
  
  // Replace Talent/Brand login/signup links if they are still #
  // (Most are already patched but let's be thorough)
  content = content.replace(/href="# talent-login"/g, 'href="/login?role=talent"');
  content = content.replace(/href="# brand-login"/g, 'href="/login?role=brand"');
  
  // Specific patching for buttons in different pages
  // Launch a Campaign -> /login?role=brand
  content = content.replace(/href="#"([^>]*class="[^"]*btn-launch[^"]*")/g, 'href="/login?role=brand"$1');
  
  // Get Started -> /join-now?role=talent (default for talent)
  content = content.replace(/href="#"([^>]*class="[^"]*btn-get-started[^"]*")/g, 'href="/login?role=talent"$1');

  // Patch any remaining "talk to sales" or "join" buttons
  content = content.replace(/href="#"([^>]*Talk to Sales)/g, 'href="/contact"$1');
  content = content.replace(/href="#"([^>]*Join Digihire)/g, 'href="/join-now?role=talent"$1');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${fileName}`);
});
