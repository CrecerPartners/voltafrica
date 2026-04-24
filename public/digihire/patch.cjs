const fs = require('fs');

const file = 'c:\\Users\\PRECISE\\Desktop\\Projects\\Voltafrica\\digihire\\blog.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject CSS
const cssToInject = `
  <style>
    /* ── Blog Specific Styles ── */
    .blog-hero { position: relative; padding: 180px 24px 80px; background: var(--navy); text-align: center; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
    #hero-bars { position: absolute; inset: 0; display: flex; align-items: flex-end; width: 100%; height: 100%; z-index: 0; }
    .hero-bar { flex: 1; height: 100%; transform-origin: bottom; background: linear-gradient(to top, rgba(0,194,255,0.35), transparent); }
    .blog-hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
    .blog-hero-sub { font-size: 14px; color: var(--cyan); margin-bottom: 16px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'CenturyGothic', sans-serif; display: inline-flex; align-items: center; gap: 8px; background: rgba(0,194,255,0.1); padding: 6px 16px; border-radius: 999px; }
    .blog-hero-title { font-family: 'CenturyGothic', sans-serif; font-size: clamp(42px, 6vw, 72px); font-weight: 300; margin-bottom: 20px; letter-spacing: -0.02em; line-height: 1.1; text-shadow: 0 4px 24px rgba(0,0,0,0.4); }
    .blog-hero-desc { font-size: 18px; color: rgba(255,255,255,0.7); max-width: 600px; margin: 0 auto 32px; line-height: 1.6; }
    
    .blog-featured { padding: 100px 0 60px; background: var(--white); }
    .blog-featured-card { display: grid; grid-template-columns: 1.3fr 1fr; gap: 0; background: white; border-radius: 24px; overflow: hidden; border: 1px solid #E8EEF5; box-shadow: 0 24px 64px rgba(0,0,0,0.06); align-items: stretch; transition: transform 0.3s, box-shadow 0.3s; text-decoration: none; }
    .blog-featured-card:hover { transform: translateY(-4px); box-shadow: 0 32px 80px rgba(0,0,0,0.1); border-color: rgba(0,194,255,0.3); }
    .bfc-img-wrap { position: relative; min-height: 440px; }
    .bfc-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .bfc-content { padding: 56px 48px; display: flex; flex-direction: column; justify-content: center; }
    .blog-cat-pill { display: inline-flex; background: rgba(0,194,255,0.12); color: var(--cyan-dim); font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 6px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; align-self: flex-start; }
    .bfc-title { font-family: 'CenturyGothic', sans-serif; font-size: clamp(28px, 3.5vw, 40px); font-weight: 800; color: #0D1B33; line-height: 1.2; margin-bottom: 16px; transition: color 0.2s; }
    .blog-featured-card:hover .bfc-title { color: var(--cyan-dim); }
    .bfc-excerpt { font-size: 16px; color: #6B849E; line-height: 1.65; margin-bottom: 32px; }
    .bfc-cta { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--cyan); font-family: 'CenturyGothic', sans-serif; transition: gap 0.2s; }
    .blog-featured-card:hover .bfc-cta { gap: 10px; }
    
    .blog-tabs-sec { padding: 20px 0 40px; background: var(--white); }
    .blog-tabs { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .blog-tab { padding: 10px 22px; border-radius: 999px; background: #F4F8FF; border: 1px solid #D0DFF0; font-size: 14px; color: #2C4A6E; text-decoration: none; transition: all 0.2s; font-family: 'CenturyGothic', sans-serif; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .blog-tab.active { background: var(--cyan); color: var(--navy); border-color: var(--cyan); }
    .blog-tab:not(.active):hover { border-color: var(--cyan); background: rgba(0,194,255,0.06); color: var(--navy); }
    
    .blog-grid-sec { padding: 0 0 100px; background: var(--white); }
    .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .blog-card { background: white; border-radius: 20px; border: 1px solid #E8EEF5; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; display: flex; flex-direction: column; text-decoration: none; position: relative; }
    .blog-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.08); border-color: rgba(0,194,255,0.3); }
    .bc-img-wrap { overflow: hidden; height: 240px; position: relative; }
    .bc-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .blog-card:hover .bc-img { transform: scale(1.05); }
    .bc-content { padding: 28px; display: flex; flex-direction: column; flex: 1; }
    .bc-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .bc-date { font-size: 13px; color: #9AAFC7; font-weight: 500; }
    .bc-title { font-family: 'CenturyGothic', sans-serif; font-size: 20px; font-weight: 800; color: #0D1B33; line-height: 1.3; margin-bottom: 12px; transition: color 0.2s; }
    .blog-card:hover .bc-title { color: var(--cyan-dim); }
    .bc-excerpt { font-size: 15px; color: #6B849E; line-height: 1.65; flex: 1; margin-bottom: 24px; }
    .bc-cta { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 800; color: var(--cyan-dim); font-family: 'CenturyGothic', sans-serif; transition: gap 0.2s, color 0.2s; }
    .blog-card:hover .bc-cta { gap: 8px; color: var(--cyan); }
    
    .newsletter-cta { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-3) 100%); padding: 100px 0; text-align: center; position: relative; overflow: hidden; border-top: 1px solid rgba(0,194,255,0.1); }
    .nl-glow { position: absolute; top: -50%; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(0,194,255,0.15) 0%, transparent 70%); pointer-events: none; }
    .nl-title { font-family: 'CenturyGothic', sans-serif; font-size: clamp(32px, 4.5vw, 48px); color: white; font-weight: 800; margin-bottom: 16px; position: relative; z-index: 1; letter-spacing: -0.02em; }
    .nl-sub { font-size: 18px; color: rgba(255,255,255,0.6); max-width: 540px; margin: 0 auto 40px; position: relative; z-index: 1; line-height: 1.6; }
    .nl-form { display: flex; max-width: 520px; margin: 0 auto; position: relative; z-index: 1; gap: 12px; background: rgba(255,255,255,0.06); padding: 8px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
    .nl-input { flex: 1; padding: 16px 20px; border-radius: 8px; border: none; background: transparent; color: white; font-size: 16px; outline: none; }
    .nl-input::placeholder { color: rgba(255,255,255,0.4); }
    .btn-nl { border-radius: 8px; padding: 16px 28px; }
    
    @media (max-width: 900px) {
      .blog-featured-card { grid-template-columns: 1fr; }
      .bfc-img-wrap { min-height: 300px; }
      .bfc-content { padding: 40px 32px; }
      .blog-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
    }
    @media (max-width: 600px) {
      .blog-hero { padding: 140px 20px 60px; }
      .blog-grid { grid-template-columns: 1fr; }
      .nl-form { flex-direction: column; padding: 16px; background: transparent; border: none; gap: 16px; }
      .nl-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); }
      .btn-nl { width: 100%; justify-content: center; }
    }
  </style>
</head>
`;
content = content.replace('</head>', cssToInject);

// 2. Replace body from <!-- ════ 2. HERO ══════════════════════════════════ --> 
// up to <!-- ════ 11. FOOTER ═══════════════════════════════ -->
const startIndex = content.indexOf('<!-- ════ 2. HERO');
const endIndex = content.indexOf('<!-- ════ 11. FOOTER');

if (startIndex !== -1 && endIndex !== -1) {
  const newBody = `
<!-- ════ 2. BLOG HERO ══════════════════════════════════ -->
<div class="blog-hero">
  <div id="hero-bars"></div>
  <div class="blog-hero-content reveal">
    <div class="blog-hero-sub"><i data-lucide="book-open" class="lucide"></i> Digihire Insights</div>
    <h1 class="blog-hero-title">Insights on sales, growth, hiring, and market activation</h1>
    <p class="blog-hero-desc">Explore practical ideas, strategies, and stories from the Digihire ecosystem.</p>
    <a href="#articles" class="btn btn-cyan btn-lg" style="box-shadow: 0 4px 24px rgba(0,194,255,0.4);">Read Latest Articles</a>
  </div>
</div>

<!-- ════ 3. FEATURED ARTICLE ═══════════════════════════ -->
<section class="blog-featured" id="articles">
  <div class="container">
    <div class="reveal">
      <p class="section-label" style="margin-bottom: 24px;">Featured Insight</p>
      <a href="#" class="blog-featured-card">
        <div class="bfc-img-wrap">
          <img src="assets/blog_featured.png" alt="Featured Article" class="bfc-img" onerror="this.src='https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center&q=80'" />
        </div>
        <div class="bfc-content">
          <span class="blog-cat-pill">Sales Strategy</span>
          <h2 class="bfc-title">How to Structure a Performance-Based Sales Campaign That Actually Converts</h2>
          <p class="bfc-excerpt">Learn the exact framework top-performing brands use to launch commission-based campaigns, activate the right talent, and drive measurable user acquisition without wasting upfront marketing budget.</p>
          <span class="bfc-cta">Read Article <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        </div>
      </a>
    </div>
  </div>
</section>

<!-- ════ 4. BLOG CATEGORIES ════════════════════════════ -->
<section class="blog-tabs-sec">
  <div class="container reveal">
    <div class="blog-tabs">
      <a href="#" class="blog-tab active">All Topics</a>
      <a href="#" class="blog-tab">Sales</a>
      <a href="#" class="blog-tab">Recruitment</a>
      <a href="#" class="blog-tab">Campaigns</a>
      <a href="#" class="blog-tab">Activations</a>
      <a href="#" class="blog-tab">Talent Growth</a>
      <a href="#" class="blog-tab">Future of Work</a>
      <a href="#" class="blog-tab">Digihire Updates</a>
    </div>
  </div>
</section>

<!-- ════ 5. ARTICLES GRID ══════════════════════════════ -->
<section class="blog-grid-sec">
  <div class="container">
    <div class="blog-grid stagger-grid">
      
      <!-- Article 1 -->
      <a href="#" class="blog-card">
        <div class="bc-img-wrap">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&crop=top&q=80" alt="Recruitment" class="bc-img" />
        </div>
        <div class="bc-content">
          <div class="bc-meta">
            <span class="blog-cat-pill" style="margin-bottom:0;">Recruitment</span>
            <span class="bc-date">Apr 18, 2026</span>
          </div>
          <h3 class="bc-title">Why African Companies Are Winning with Remote-First Hiring</h3>
          <p class="bc-excerpt">Discover how forward-thinking companies are accessing top talent pools across the continent.</p>
          <span class="bc-cta">Read More →</span>
        </div>
      </a>

      <!-- Article 2 -->
      <a href="#" class="blog-card">
        <div class="bc-img-wrap">
          <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&crop=center&q=80" alt="Updates" class="bc-img" />
        </div>
        <div class="bc-content">
          <div class="bc-meta">
            <span class="blog-cat-pill" style="margin-bottom:0;">Digihire Updates</span>
            <span class="bc-date">Apr 12, 2026</span>
          </div>
          <h3 class="bc-title">DigiHire Launches Advanced AI Resume Optimization</h3>
          <p class="bc-excerpt">Our new AI-powered resume builder helps professionals get past ATS filters and land interviews.</p>
          <span class="bc-cta">Read More →</span>
        </div>
      </a>

      <!-- Article 3 -->
      <a href="#" class="blog-card">
        <div class="bc-img-wrap">
          <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&crop=center&q=80" alt="Activations" class="bc-img" />
        </div>
        <div class="bc-content">
          <div class="bc-meta">
            <span class="blog-cat-pill" style="margin-bottom:0;">Activations</span>
            <span class="bc-date">Apr 05, 2026</span>
          </div>
          <h3 class="bc-title">The Blueprint for High-ROI Mall Activations</h3>
          <p class="bc-excerpt">Field marketing doesn't have to be guesswork. Here is how to track, measure, and scale physical activations.</p>
          <span class="bc-cta">Read More →</span>
        </div>
      </a>

      <!-- Article 4 -->
      <a href="#" class="blog-card">
        <div class="bc-img-wrap">
          <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop&crop=center&q=80" alt="Talent Growth" class="bc-img" />
        </div>
        <div class="bc-content">
          <div class="bc-meta">
            <span class="blog-cat-pill" style="margin-bottom:0;">Talent Growth</span>
            <span class="bc-date">Mar 28, 2026</span>
          </div>
          <h3 class="bc-title">How to Break Into Tech Sales with Zero Experience</h3>
          <p class="bc-excerpt">A practical guide to landing your first tech sales role in Africa's booming technology sector.</p>
          <span class="bc-cta">Read More →</span>
        </div>
      </a>

      <!-- Article 5 -->
      <a href="#" class="blog-card">
        <div class="bc-img-wrap">
          <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop&crop=center&q=80" alt="Future of Work" class="bc-img" />
        </div>
        <div class="bc-content">
          <div class="bc-meta">
            <span class="blog-cat-pill" style="margin-bottom:0;">Future of Work</span>
            <span class="bc-date">Mar 22, 2026</span>
          </div>
          <h3 class="bc-title">The Gig Economy is Changing Sales forever</h3>
          <p class="bc-excerpt">Why fractional sales professionals and commission-only reps are becoming the standard for rapid growth.</p>
          <span class="bc-cta">Read More →</span>
        </div>
      </a>

      <!-- Article 6 -->
      <a href="#" class="blog-card">
        <div class="bc-img-wrap">
          <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=600&h=400&fit=crop&crop=center&q=80" alt="Sales" class="bc-img" />
        </div>
        <div class="bc-content">
          <div class="bc-meta">
            <span class="blog-cat-pill" style="margin-bottom:0;">Sales</span>
            <span class="bc-date">Mar 15, 2026</span>
          </div>
          <h3 class="bc-title">Closing the Enterprise Deal: What Most Reps Get Wrong</h3>
          <p class="bc-excerpt">B2B sales cycles can be long and painful. Learn the crucial step you need to shorten the timeline.</p>
          <span class="bc-cta">Read More →</span>
        </div>
      </a>

    </div>
  </div>
</section>

<!-- ════ 6. NEWSLETTER CTA ═════════════════════════════ -->
<section class="newsletter-cta">
  <div class="nl-glow"></div>
  <div class="container reveal">
    <h2 class="nl-title">Get Digihire insights delivered to you</h2>
    <p class="nl-sub">Stay updated with our latest insights, strategies, and platform news straight to your inbox. No spam, just value.</p>
    <form class="nl-form" onsubmit="event.preventDefault(); alert('Subscribed!');">
      <input type="email" class="nl-input" placeholder="Enter your email address" required />
      <button type="submit" class="btn btn-cyan btn-nl">Subscribe</button>
    </form>
  </div>
</section>

`;
  content = content.substring(0, startIndex) + newBody + content.substring(endIndex);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Blog page successfully generated.');
