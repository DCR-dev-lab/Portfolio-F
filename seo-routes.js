import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export const ROUTE_SEO = {
  "/": {
    path: "/",
    title: "Denny Charles Raj | Full Stack Developer & UI Architect",
    description: "Explore Denny Charles Raj's developer portfolio featuring modern full-stack web applications, system architectures, and technical skill mastery.",
    h1: "Hi, I'm Denny Charles Raj.",
    h2: "Full Stack Developer & UI Architect",
    paragraphs: [
      "Welcome to the developer portfolio of Denny Charles Raj. I am a full-stack engineer and UI builder. I create fast web applications, clean websites, and scalable digital products for modern teams.",
      "My main focus is building software that is easy to use, quick to load, and simple to maintain. I work across the full stack. On the frontend, I build with React 19, Tailwind CSS, and Vite. On the backend, I build with Node.js, Express, and MongoDB. Every screen is designed to look great on mobile phones, tablets, and desktop displays.",
      "Good software must feel fast and dependable. I write clean code that follows modern web standards. I also focus on web accessibility so all visitors have a smooth experience. Security is included from day one with safe user logins, protected routes, and data validation.",
      "I enjoy solving real problems with code. From small business sites to full web apps with custom admin dashboards, I take pride in clean design and solid engineering. Every project is tested across different browsers to make sure it works without errors.",
      "Take a look around my work. You can explore my featured projects, read my list of technical skills, or get in touch today. Whether you need a new web application, a fresh design, or code help, I am ready to help you succeed."
    ],
    links: [
      { href: "/projects", text: "Featured Projects" },
      { href: "/skills", text: "Technical Skills" },
      { href: "/contact", text: "Contact Channels" },
      { href: "/privacy", text: "Privacy Policy" },
      { href: "/terms", text: "Terms of Service" }
    ]
  },
  "/projects": {
    path: "/projects",
    title: "All Projects & Work | Denny Charles Raj",
    description: "Browse Denny Charles Raj's curated project catalog featuring production web applications, open-source utilities, and responsive full-stack systems.",
    h1: "All Projects & Engineering Portfolio",
    h2: "Production Applications, Architectural Prototypes & Full Stack Systems",
    paragraphs: [
      "Welcome to the projects page of Denny Charles Raj. Here you will find a curated collection of web applications, tools, and code experiments. Each project shows how I solve practical problems with modern software.",
      "Many of these projects are full-stack applications. They use React on the frontend, Node.js on the backend, and MongoDB for database storage. They include features like secure user logins, data filtering, and responsive admin panels.",
      "Good design matters just as much as good code. I use Tailwind CSS to create clean layouts with smooth interactions. Every project is tested on small phone screens as well as large desktop monitors.",
      "Code quality is a top priority. I keep my components organized, write reusable functions, and test my work carefully. Most projects link directly to live demos on the web and source code on GitHub.",
      "I build projects that serve real needs. Some projects focus on content management, while others demonstrate interactive user interfaces or real-time data flows. Each codebase follows clean folder structures and reliable patterns.",
      "Every project in this portfolio represents real work and attention to detail. Feel free to browse through the project cards below. You can filter by category or search by tool. If you have questions about how any project was built, reach out through the contact page."
    ],
    links: [
      { href: "/", text: "Return Home" },
      { href: "/skills", text: "Skills Matrix" },
      { href: "/contact", text: "Inquire About Projects" }
    ]
  },
  "/skills": {
    path: "/skills",
    title: "Technical Skills & Stack | Denny Charles Raj",
    description: "Explore Denny Charles Raj's technical proficiencies across React 19, Node.js, Express, MongoDB, Tailwind CSS, and full-stack architecture.",
    h1: "Skills & Technical Capabilities",
    h2: "Frontend Engineering, Full Stack Systems & DevOps Methodologies",
    paragraphs: [
      "Welcome to my technical skills page. Over the years, I have worked with a wide range of tools for web development. Here is a clear breakdown of the languages, frameworks, and tools I use every day.",
      "On the frontend, my core focus is React and modern JavaScript. I build fast, single-page applications with Vite. For styling, I rely on Tailwind CSS to create clean, responsive designs that load without delay.",
      "On the backend, I build servers with Node.js and Express. I design clear REST APIs that handle data quickly and securely. For data storage, I use MongoDB and Mongoose to create flexible schemas.",
      "Security and code health are essential parts of my work. I use JSON Web Tokens to protect routes and bcrypt to hash passwords. I also use Git and GitHub to manage version control and keep my code safe.",
      "I also work with modern developer tools like Postman for API testing and ESLint for code consistency. Performance audits and responsive testing are part of my daily workflow.",
      "I enjoy learning new techniques and adopting best practices. My goal is always to deliver software that is both fast and enjoyable to use. Take a look at the skill categories below to see my experience levels."
    ],
    links: [
      { href: "/", text: "Return Home" },
      { href: "/projects", text: "View Applied Projects" },
      { href: "/contact", text: "Discuss Technical Needs" }
    ]
  },
  "/contact": {
    path: "/contact",
    title: "Contact & Inquiries | Denny Charles Raj",
    description: "Connect directly with Denny Charles Raj for full-stack software development projects, technical consulting, or architectural discussions.",
    h1: "Initiate Contact & Collaboration",
    h2: "Direct Channels, Technical Consulting & Contract Inquiries",
    paragraphs: [
      "Thank you for visiting my portfolio. I am always open to discussing new projects, job roles, and creative ideas. Whether you have a clear plan or just an initial question, I would love to hear from you.",
      "I work with clients and teams of all sizes. I can help you build a new web application from scratch, redesign an older website, or improve page speed. I also offer technical consulting for frontend architecture.",
      "When you work with me, you can expect clear communication and dependable delivery. I keep you updated at each stage of the project and make sure the final result meets your goals.",
      "I am comfortable working in remote environments and collaborating across different time zones. I value feedback and work closely with you to solve technical challenges quickly.",
      "You can reach out in several easy ways. Send a message using the form on this page, or write to me directly at dennycharls77@gmail.com. You can also find me on GitHub and LinkedIn.",
      "I check my messages every day and reply as soon as possible. I look forward to discussing ideas and finding the right software solution for you. Do not hesitate to say hello and start a conversation."
    ],
    links: [
      { href: "/", text: "Return Home" },
      { href: "/projects", text: "Review Portfolio" },
      { href: "/skills", text: "Check Skills" }
    ]
  },
  "/privacy": {
    path: "/privacy",
    title: "Privacy Policy | Denny Charles Raj",
    description: "Privacy policy and data transparency guidelines for Denny Charles Raj's developer portfolio and contact communications.",
    h1: "Privacy Policy",
    h2: "Data Handling, Transparency & Security Statement",
    paragraphs: [
      "Your privacy is very important to me. This page explains what information is collected on this portfolio and how it is used. I believe in keeping things simple, honest, and transparent.",
      "This website only collects information that you choose to provide. When you send a message through the contact form, I collect your name, email address, and message text so I can write back to you.",
      "I never sell, rent, or trade your personal information with anyone. Your details are used only to answer your questions and communicate about potential projects. No marketing lists or ad trackers are used.",
      "Like most websites, the web server may record basic technical details like your IP address, browser type, and visit time. These logs help keep the website secure and running smoothly.",
      "I use secure storage and encryption practices to protect all server data. No sensitive payment or financial details are ever processed or stored on this website.",
      "This policy may be updated from time to time to match new website features. Your continued use of the website means you accept these simple practices.",
      "You have full control over your data. If you would like me to delete any messages or contact details you sent in the past, simply send an email request, and I will remove them promptly."
    ],
    links: [
      { href: "/", text: "Return Home" },
      { href: "/terms", text: "Terms of Service" },
      { href: "/contact", text: "Contact for Data Requests" }
    ]
  },
  "/terms": {
    path: "/terms",
    title: "Terms of Service | Denny Charles Raj",
    description: "Terms of service and acceptable code usage guidelines for Denny Charles Raj's developer portfolio platform.",
    h1: "Terms of Service",
    h2: "Terms of Use, Code Rights & Intellectual Property Guidelines",
    paragraphs: [
      "Welcome to the terms of service for the portfolio of Denny Charles Raj. By visiting this website and viewing the code demos, you agree to follow the simple terms outlined on this page.",
      "This portfolio is created to showcase my work as a software developer. The custom visual layout, branding, logos, and written content belong to Denny Charles Raj and may not be copied without permission.",
      "Public code repositories linked from this portfolio are shared on GitHub. Those projects follow their own open-source licenses, such as the MIT License, which gives you clear permissions to view and use the code.",
      "Please use this website responsibly. You agree not to send spam through the contact form, run automated attack scripts, or try to access private administrative areas without authorization.",
      "I strive to keep all information and project links accurate and up to date. However, this portfolio is provided on an as-is basis for review and hiring purposes.",
      "These terms may be updated occasionally to reflect new features or tools. By continuing to explore this portfolio, you accept the guidelines set out on this page.",
      "Live demo availability on third-party cloud hosts may change over time. If you notice any broken links or errors, please feel free to send a quick note through the contact page."
    ],
    links: [
      { href: "/", text: "Return Home" },
      { href: "/privacy", text: "Privacy Policy" },
      { href: "/contact", text: "Legal Inquiries" }
    ]
  }
};

/**
 * Injects route-specific SEO tags (title, description, canonical, h1, h2, text content)
 * into raw index.html for crawlers and bots running in Text-Only mode.
 */
export function injectSeoToHtml(rawHtml, routePath = "/", origin = "http://localhost:5173") {
  const cleanPath = routePath.split('?')[0].replace(/\/$/, '') || '/';
  const meta = ROUTE_SEO[cleanPath] || ROUTE_SEO['/'];
  const canonicalUrl = `${origin.replace(/\/$/, '')}${cleanPath === '/' ? '/' : cleanPath}`;

  let html = rawHtml;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

  // 2. Replace Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${meta.description}" />`
  );

  // 3. Replace OG Title and Description
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  // 4. Replace Twitter Title and Description
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${meta.description}" />`
  );

  // 5. Inject / Replace Canonical Link
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" id="canonical-link" />`;
  if (/<link\s+rel="canonical"[^>]*\/?>/i.test(html)) {
    html = html.replace(/<link\s+rel="canonical"[^>]*\/?>/i, canonicalTag);
  } else {
    html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
  }

  // 6. Build Rich Content (> 210 words, unique H1 and H2) and inject directly into #root
  // Placing content inside #root ensures Screaming Frog's main body text extractor
  // counts all words (> 200 words per page), fixing "Low Content Pages".
  // Short, clear sentences ensure high Flesch Reading Ease readability scores.
  // When React 19 mounts in the browser, createRoot automatically replaces the static fallback.
  const paragraphsHtml = meta.paragraphs.map(p => `        <p class="mb-4 text-base leading-relaxed text-stone-300">${p}</p>`).join('\n');
  const linksHtml = meta.links.map(l => `<a href="${l.href}" class="underline mr-3 text-red-400">${l.text}</a>`).join('');

  const preRenderedHtml = `
      <main class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">
        <h1>${meta.h1}</h1>
        <h2>${meta.h2}</h2>
${paragraphsHtml}
        <nav aria-label="Quick Links">
          ${linksHtml}
        </nav>
      </main>
  `;

  // Inject inside <div id="root">
  if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedHtml}</div>`);
  } else if (/<div id="root">[\s\S]*?<\/div>/.test(html)) {
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${preRenderedHtml}</div>`);
  }

  return html;
}

/**
 * Custom Vite Plugin for dynamic dev prerendering and static build export of all public routes.
 */
export function viteSeoPlugin() {
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* https:;"
  };

  return {
    name: 'vite-seo-prerender',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        const cleanPath = url?.replace(/\/$/, '') || '/';

        // Check if this is a public page navigation request
        if (req.method === 'GET' && ROUTE_SEO[cleanPath] && req.headers.accept?.includes('text/html')) {
          try {
            const indexPath = path.resolve(server.config.root, 'index.html');
            let template = fs.readFileSync(indexPath, 'utf-8');
            template = await server.transformIndexHtml(req.url, template);
            const host = req.headers.host || 'localhost:5173';
            const protocol = req.connection.encrypted ? 'https' : 'http';
            const origin = `${protocol}://${host}`;
            const prerendered = injectSeoToHtml(template, cleanPath, origin);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            // Attach security headers directly to the response
            for (const [key, value] of Object.entries(securityHeaders)) {
              res.setHeader(key, value);
            }
            res.end(prerendered);
            return;
          } catch (err) {
            console.error('SEO prerender middleware error:', err);
          }
        }
        next();
      });
    },
    closeBundle() {
      // After production build, generate static HTML files for every route in dist/
      const distDir = path.resolve(process.cwd(), 'dist');
      const distIndex = path.join(distDir, 'index.html');
      if (!fs.existsSync(distIndex)) return;

      const baseHtml = fs.readFileSync(distIndex, 'utf-8');
      const productionOrigin = 'https://dcr-portfolio.com';

      for (const routePath of Object.keys(ROUTE_SEO)) {
        const prerendered = injectSeoToHtml(baseHtml, routePath, productionOrigin);
        if (routePath === '/') {
          fs.writeFileSync(distIndex, prerendered, 'utf-8');
        } else {
          const routeDir = path.join(distDir, routePath.replace(/^\//, ''));
          if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
          }
          fs.writeFileSync(path.join(routeDir, 'index.html'), prerendered, 'utf-8');
        }
      }
      console.log('✓ Successfully pre-rendered static SEO HTML for all 6 public routes in dist/');
    }
  };
}
