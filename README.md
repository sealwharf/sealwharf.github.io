# sealwharf.github.io

Project site of [Sealwharf](https://github.com/mauricioeluri/sealwharf), the bot that signs documents sent to a WhatsApp number. Published at https://sealwharf.github.io.

Static page, no build step: `index.html`, `assets/css/style.css` and three scripts in `assets/js/`. English is the text written in `index.html`; Portuguese and Spanish live in `assets/js/translations.js`, under the same `data-i18n` keys. A `?lang=pt` or `?lang=es` parameter in the address opens the page in that language.

To preview it locally, run `python3 -m http.server` in this folder and open http://localhost:8000.
