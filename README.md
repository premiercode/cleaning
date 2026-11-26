# Bur Oak Home Cleaning Co. homepage design preview

Design preview prepared by Premier Code Inc.

**Preview URL:** https://cleaning.premiercodeinc.com/

This is a generic demo for North Texas house cleaning businesses. **Bur Oak Home Cleaning Co. is a
fictional company.** Every price, credential, phone number and email on these pages is a labeled
sample. Nothing on the page works: the quote widget only shows sample prices, and the forms send nothing.

## The three options

Switch between them with the Option A / B / C control at the bottom-left of every page.

| Option | URL | Concept |
|---|---|---|
| Option A | https://cleaning.premiercodeinc.com/option-a/ | Fresh and bright: white space, mint and sky accents, small sparkle animations, rounded friendly type. The instant quote card is the hero. |
| Option B | https://cleaning.premiercodeinc.com/option-b/ | Boutique concierge: linen and charcoal, a refined serif, an editorial hotel-like layout with a calm estimate card. |
| Option C | https://cleaning.premiercodeinc.com/option-c/ | Playful checklist: bold color blocks, hand-drawn check marks, and a tabbed room-by-room checklist as the signature section. |

The root URL redirects to Option A. Photo credits: https://cleaning.premiercodeinc.com/credits.html

## Confirm with the client before launch

Each item below is marked `<!-- PLACEHOLDER -->` in the HTML.

- **Company name, phone and email.** The name is invented. (469) 555-0176 is a reserved fictional number and hello@example.com is a reserved domain. Use separate addresses for transactional and marketing email.
- **Prices.** All prices, recurring discounts (15/10/5%) and add-on fees are samples based on public 2025–2026 cost guides. Replace them with the client's real price list. Keep "plus applicable sales tax", because Texas taxes house cleaning done by a company.
- **Quote logic** (Option A notes it in a comment). The base price uses the larger of the bedroom and bathroom tier; the recurring discount applies to standard cleans only; the range runs from the base price to about +25%; very large homes show "Custom quote".
- **Trust claims.** The background check provider and what it covers, the bond carrier and amount, the general liability insurer, and the same-team policy as the client actually runs it.
- **Re-clean promise conditions.** The 24-hour window, what's covered and how a customer reports a miss. It is a re-clean, not a refund. Don't call it a "satisfaction guarantee" unless the client refunds on request (16 CFR 239.3).
- **Form.** The endpoint and email routing (there's no `action` in the preview), plus the reCAPTCHA v3 site key and script. The honeypot field is already in place.
- **Photos.** All photos are royalty-free stock from Unsplash and Pexels (see credits.html). Replace them with the client's own photos, with model releases where people appear.
- **Words left out on purpose.** "Licensed", "fully insured", "fully vetted", "eco-friendly", "non-toxic", star ratings, review counts and badges. Add any of these back only if the client can back them up.

## Remove at launch

- [ ] The option switcher: the `<!-- REMOVE AT LAUNCH: option switcher -->` block before `</body>` on every page, including its `<style class="pv-style">`.
- [ ] The two unused options, and the root redirect page (`index.html` should become the chosen option).
- [ ] The "Design preview" bar at the top of each page and every "Sample" label (after replacing sample content with real content).
- [ ] `<meta name="robots" content="noindex, nofollow">` on every page.
- [ ] The `Disallow: /` block in `robots.txt`.
- [ ] `credits.html`, once the stock photos are replaced.

Do not remove `noindex` or the `robots.txt` block until the client has signed.
