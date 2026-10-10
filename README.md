# VIGNOVATE website (static HTML / CSS / JS)

Pure static site: no framework, no build step, no backend, no database, no Node/React at runtime.

```
index.html  about.html  services.html  portfolio.html  contact.html
robots.txt  sitemap.xml
assets/css/style.css      (single bundled stylesheet)
assets/js/site.js         (interactions only: menu, reveal, filter, FAQ, form, slider)
assets/img/*.svg|png      (original AI visuals, OG image)
assets/favicon.svg, favicon-32.png, apple-touch-icon.png
```

## Before you publish - 4 things to set
1. **Domain**: canonical/OG/sitemap URLs use the custom domain `https://vignovate.in/`.
2. **Email**: contact email is `vignovate@gmail.com` (search the project to change it).
3. **Contact form**: put your free key from web3forms.com in the hidden `access_key` input. Until then the form opens the visitor's email app instead.
4. **Social links**: the old footer icons pointed to generic facebook.com / instagram.com / linkedin.com homepages, so they were removed. Add your real profile URLs when ready.

## Odoo Online
Odoo does not import a ZIP of a static site. Recommended workflow:
1. Create the pages in Website Builder (Home, About, Services, Portfolio, Contact) and set each page's title + meta description from the `<title>` / `<meta name="description">` in the matching HTML file.
2. Add `assets/css/style.css` via Website > Site > Theme > Custom code (or a custom CSS file), and upload `assets/img/*` to the media library.
3. For each page: Edit > drop an **Embed Code** block and paste the content between `<main>` and `</main>` (header/footer can stay Odoo's own or be pasted too). Replace `assets/img/...` paths with the uploaded image URLs.
4. Paste `assets/js/site.js` into Website > Site > Theme > Custom code > Before `</body>` (only needed for the animations/filter/FAQ).
5. Replace the contact form with Odoo's native **Form** block (leads go straight to CRM). Add the JSON-LD blocks in each page's `<head>` custom code if you want structured data.
