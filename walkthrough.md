# MedicareCostGuide — Project Walkthrough

**Domain:** medicarecostguides.com  
**Total HTML Pages:** 77  
**Generator:** generate.js (Node.js)  
**Last Updated:** 2026-04-14

## Site Identity
- **Name:** MedicareCostGuide
- **Tagline:** Medicare costs explained for every budget
- **Author:** Dr. Patricia Wells, Medicare Benefits Researcher
- **Audience:** U.S. seniors 65+ and families comparing Medicare options

## Architecture
```
medicarecostguide/
├── index.html              # Homepage
├── about.html              # About page
├── contact.html            # Contact page
├── privacy-policy.html     # Privacy policy
├── terms.html              # Terms of use
├── disclaimer.html         # Medical/financial disclaimer
├── how-we-research.html    # Editorial methodology
├── sitemap.html            # HTML sitemap
├── 404.html                # Error page (noindex)
├── styles.css              # Complete design system
├── main.js                 # JS: nav, cookies, calculators
├── favicon.svg             # SVG favicon
├── ads.txt                 # AdSense ads.txt
├── robots.txt              # Crawling rules + sitemap
├── sitemap.xml             # XML sitemap (77 URLs)
├── _redirects              # Domain canonicalization
├── _headers                # Security headers
├── generate.js             # Site generator script
├── walkthrough.md          # This file
└── pages/                  # 68 content pages
    ├── [12 Medicare Parts articles]
    ├── [10 Medicare Advantage articles]
    ├── [10 Medigap articles]
    ├── [8 Part D / Drug articles]
    ├── [8 Enrollment articles]
    ├── [10 Costs / Planning articles]
    ├── [7 Conditions articles]
    ├── medicare-premium-calculator.html
    ├── medicare-vs-advantage-calculator.html
    └── drug-cost-estimator.html
```

## SEO Compliance
- ✅ AdSense script in ALL 77 HTML pages
- ✅ No canonical URLs contain .html
- ✅ Favicon link in ALL pages
- ✅ No noindex tags (except 404.html)
- ✅ No Product schema anywhere
- ✅ No extensionless files (except _headers, _redirects)
- ✅ 2+ static JSON-LD schemas in index.html
- ✅ Static Article + FAQPage schemas in all content pages
- ✅ OG and Twitter meta tags on all pages

## Calculators
1. **Premium Calculator** — Part A, B (IRMAA), D, Medigap
2. **Coverage Comparison** — Original Medicare vs Advantage
3. **Drug Cost Estimator** — Part D coverage phases

## Color Palette
- Primary (Trust Blue): #1B4F72
- Secondary (Health Green): #1E8449
- Accent: #2E86C1
- Background: #F8F9FA

## Dominio Final
El dominio final del proyecto es: **medicarecostguides.com** (con S al final).
Actualizado el 2026-04-14.
