# ep.europa.kiwi

An independent English-language portal at **https://ep.europa.kiwi/**.

| Destination | Link |
| --- | --- |
| EP Learning Catalogue | https://modulow.github.io/ep-l-d-brochure/ |
| Time Table Generator | https://ep.europa.kiwi/jma-timetable/ |
| L&D IT Support | https://modulow.github.io/sharepoint-ticketing/ |

## Working on the portal

Open `index.html` in a browser. There is no build step, tracking,
external font request or runtime dependency. Update the three card `href`
attributes in `index.html` and this table when changing destinations.
`styles.css` defines the responsive layout, keyboard-visible focus, reduced
motion and forced-colour support. All links open in the same tab.
`hero.js` progressively enhances the decorative fruit and blob into separate
fixed scroll layers. A passive scroll listener schedules transform-only
movement with animation frames; geometry is measured only at setup/resize.
Clipping limits all layers to the hero below the compact sticky header.
The header becomes smaller after 48px of scrolling, reserving its original
layout space to avoid content jumps. Its subtitle meets the kiwi icon's base.
Reduced-motion users (and browsers without JavaScript) get static artwork.
On a fresh load at the top, the fruit rises from behind the blue band in
450ms. Its entrance offset shares the scroll transform and hero clipping;
scrolled loads and reduced-motion users skip this entrance.
The apps anchor leaves room for the sticky header and keyboard focus.
A one-second introductory loader pulses the kiwi mark once, then shrinks it
to nothing over 350ms. Only then does its white background fade out over
450ms to reveal the portal; the hero's one-second pause starts after this reveal.
It is absent without JavaScript, dismisses on keyboard focus and disables the
pulse, shrink and fade for reduced-motion users. The hero entrance waits one second after
the loader disappears before rising into the page.
The large half enters in 450ms; the upper and lower small kiwis each have
their own entrance speed (800ms and 1200ms). The blob starts only after
all three fruits have settled, rising and fading in over 650ms.
Separate aligned images preserve the original fruit composition
and share the existing scroll speed, hero clipping and reduced-motion fallback.
Cards rise into view once with a brisk 380ms scroll entrance, progressively
enhanced with IntersectionObserver. Keyboard focus reveals a card immediately;
reduced-motion users and browsers without JavaScript see all cards normally.

GitHub Pages serves assets with a ten-minute browser cache. The stylesheet
and script/hero image references in `index.html` include a `?v=` content revision so
returning browsers fetch the changed assets with a fresh page. When editing
either file, update its revision (for example, the first 12 characters of its
SHA-256 hash). A page refresh may still be needed for cached HTML; adding a
new `?v=` revision to the page URL bypasses that older document.

## Visual identity and artwork

The design follows the supplied **Annex VIII - European Parliament Brand
Book_V1.pdf** as a visual reference, not as a claim of institutional authorship:

- Primary palette (p.32): Reflex Blue `#0C4DA2`, Yellow `#FDE021`, white
  `#FFFFFF`, black `#1E1E1E` and Cool Grey `#C8C8C8`. Card accents use secondary
  sky blue `#65E2FF`; the supplied kiwi contributes greens `#00B464` and
  `#28DC78`, keeping the surrounding design to three secondary colours.
- Hierarchy (pp.52–54): strong headings, lighter body copy and deliberate
  differences in size, weight and placement. The font stack is
  `"Myriad Pro", Arial, sans-serif`. **No licensed webfont was supplied**, so
  visitors without Myriad Pro see Arial. Typography is therefore not
  guaranteed to match the institutional typeface.
- Graphic language (p.58): purposeful horizontal dialogue strokes.
  Supporting icons use simple geometric shapes and rounded line ends,
  without shadows or 3D effects (pp.61–62).
- The rendered [IT helpdesk](https://modulow.github.io/sharepoint-ticketing/)
  inspired the uppercase hierarchy, rectangular cards, blue panels and
  yellow accents. Its application navigation and functionality are not copied.

The kiwi is the actual user-supplied
`new_images/IL_2026.10.02_Themes_Kiwi.svg` from `EP_Illustrations_Kit`.
`assets/kiwi-original.svg` is a byte-for-byte copy. `assets/kiwi-hero.webp`
is a tightly framed 1400px-wide transparent web rendering (about 33 KB),
with the background and ground shadow omitted. `assets/kiwi-blob.webp`
separately renders the original textured blob group (about 189 KB), layered
behind the enlarged fruit on white. The
blob is oversized and deliberately bleeds past the right viewport edge;
only the full-width hero clips that bleed, not its inner grid container.
Original fruit shapes and colours are unchanged. The illustration sits on white,
enlarged so its lower edge extends behind the foreground blue Explore band.
The decorative composition has no feature heading or caption.
The header title reads `ep.europa.kiwi_`, with a decorative Yellow underscore
and the unchanged domain as its accessible home-link name.
`An L&D applications portal` sits directly
below it, justified to the title's left and right edges (excluding the underscore).
The hero headline uses a uniform font size
across two deliberate lines, with matching two-line supporting copy on
desktop/tablet (body copy wraps naturally on narrow phones to stay readable).
The foreground text has a white backing where it crosses the illustration.
The apps section and its navigation link are labelled `Apps`,
and a decorative yellow dialogue stroke follows the kiwi above the Explore
band, using the book's horizontal graphic-device principle (p.58).
`assets/kiwi-mark.webp` and
`favicon.png` crop the original `kiwi-half` group without redrawing or
recolouring it. The originals in the supplied kit are never modified.
The fruit, blob and repeated brand accent are decorative with empty alt text.
The home link retains its accessible name. The kiwi appears in the identity, hero and favicon,
with "fresh start" copy connecting it to the portal's purpose.

The compact footer community scene sits beside the slogan and uses ten complete
native character poses (`n3`, `n38`, `n54`, `n57`, `n58`, `n39`, `n64`,
`n73`, `n74`, `n70`) from the supplied toolkit's pose bank, together
with `Enhanced perspective scenes_EP Campus Brussels from side of Place Du Luxembourg.ai`.
No people or architecture
are invented or redrawn. Clothing and building accents use the existing
primary/sky-blue palette with neutral colours and native skin/hair tones.
One native kiwi half sits at the centre in its original colours, without the
two whole fruits. `assets/footer-community.webp` (1500 x 900) and its smaller
mobile rendition keep all ten characters and the detailed Parliament building
visible, without cropping. Incomplete native poses are deliberately excluded.
The transparent scene lets the roof rise above the footer's blue background,
into the preceding white space, without moving the footer copy.
The scene is decorative, lazy-loaded and separate from the hero motion layers;
the footer slogan remains accessible text rather than part of the image.

**Intentional exceptions:** the kiwi's original brown fruit colours
are preserved as the requested playful departure. The book
restricts naturalistic skin/hair colours to people in institutional
illustrations (pp.31/50); this supplied fruit artwork is therefore not claimed
to comply fully with that palette rule. No European Parliament logo, seal or
institutional word mark is added: those identify Parliament-authored
communications (pp.18–24), whereas this portal is independent. No
institutional endorsement is claimed. These exceptions and the font
fallback mean this is a **brandbook-informed independent design**, not an
unconditional claim of official brand compliance.

## GitHub Pages and domain

Pages deploys from branch `main`, root `/`. `.nojekyll` disables Jekyll
processing. Each push to `main` publishes the site.

The root `CNAME` file and Pages custom-domain setting must both contain
`ep.europa.kiwi`. The OVH DNS zone for `europa.kiwi` uses:

| Type | Subdomain | Target |
| --- | --- | --- |
| CNAME | `ep` | `modulow.github.io.` |

The target is a hostname, with no scheme or path. Do not add conflicting
A/AAAA records on `ep` or change other subdomains.
GitHub has provisioned the certificate and **Enforce HTTPS** is enabled.
If reconfiguring the domain, verify DNS first, wait for certificate issuance,
then enable HTTPS enforcement.

Project sites without their own custom domain inherit the user-site domain.
The brochure and ticketing GitHub URLs redirect to `ep.europa.kiwi` with the
same paths. The timetable project also uses the inherited domain at
`/jma-timetable/`, without its former `ld-europa.eu` custom domain.
Verify these destinations after any domain change. Adding `CNAME` in Git does not configure
OVH DNS.
