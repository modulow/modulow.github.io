# Europa.kiwi

An independent English-language portal at **https://ep.europa.kiwi/**.

| Destination | Link |
| --- | --- |
| Brochure | https://modulow.github.io/ep-l-d-brochure/ |
| Timetable | https://ld-europa.eu/ |
| IT support / ticketing | https://modulow.github.io/sharepoint-ticketing/ |

## Working on the portal

Open `index.html` in a browser. There is no build step, JavaScript, tracking,
external font request or runtime dependency. Update the three card `href`
attributes in `index.html` and this table when changing destinations.
`styles.css` defines the responsive layout, keyboard-visible focus, reduced
motion and forced-colour support. All links open in the same tab.

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
is a 1400px-wide web rendering (about 66 KB); `assets/kiwi-mark.webp` and
`favicon.png` crop the original `kiwi-half` group without redrawing or
recolouring it. The originals in the supplied kit are never modified.
The full illustration has descriptive English alt text; the repeated brand
accent is decorative. The kiwi appears in the identity, hero and favicon,
with "fresh start" copy connecting it to the portal's purpose.

**Intentional exceptions:** the kiwi's original brown fruit colours and
background are preserved as the requested playful departure. The book
restricts naturalistic skin/hair colours to people in institutional
illustrations (pp.31/50); this supplied fruit artwork is therefore not claimed
to comply fully with that palette rule. No European Parliament logo, seal or
institutional word mark is added: those identify Parliament-authored
communications (pp.18–24), whereas this portal is independent. The footer
states that no endorsement is implied. These exceptions and the font
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
A/AAAA records on `ep`, change other subdomains or modify `ld-europa.eu`.
GitHub has provisioned the certificate and **Enforce HTTPS** is enabled.
If reconfiguring the domain, verify DNS first, wait for certificate issuance,
then enable HTTPS enforcement.

Project sites without their own custom domain inherit the user-site domain.
The brochure and ticketing GitHub URLs redirect to `ep.europa.kiwi` with the
same paths. Verify those redirect chains after any domain change; the timetable
keeps its own domain, `ld-europa.eu`. Adding `CNAME` in Git does not configure
OVH DNS.
