/**
 * Verified public Northgate buyer experience.
 *
 * The URL was recovered from the published repository's deployment evidence:
 * docs/ACCEPTANCE_STATUS.md and docs/architecture/BUYER_EXPERIENCE.md name the
 * six `/owners/s/buyer…` routes. The authenticated Owner Portal (`/owners/s/`)
 * is deliberately excluded.
 *
 * Checked 2026-11-02:
 *   GET /owners/s/buyer -> 200
 *   Content-Security-Policy: frame-ancestors 'self'
 *   X-Frame-Options: SAMEORIGIN
 *
 * No Salesforce setting is changed by ArjunOS. The portfolio presents genuine
 * screenshots and links out; it does not proxy or imitate the live application.
 */

const origin = 'https://orgfarm-25065ad46a-dev-ed.develop.my.site.com';
const appBase = `${origin}/owners/s`;

export interface NorthgateLiveView {
  id: 'home' | 'inventory' | 'studio' | 'about' | 'contact';
  label: string;
  url: string;
  pathLabel: string;
  src: string;
  thumb: string;
  alt: string;
  caption: string;
}

export const northgateLive = {
  name: 'Northgate Motors',
  origin,
  appBase,
  verifiedAt: '2 November 2026',
  framing: {
    embeddable: false,
    summary:
      'The published Salesforce site refuses third-party framing with both X-Frame-Options: SAMEORIGIN and Content-Security-Policy: frame-ancestors “self”.',
    xFrameOptions: 'SAMEORIGIN',
    csp: "frame-ancestors 'self'",
    checkedUrl: `${appBase}/buyer`,
  },
  proposal:
    'Allow framing only if the owner explicitly approves a Salesforce security change for this Experience Cloud site. A proposed change is documented in docs/NORTHGATE_LIVE.md; it has not been applied.',
  views: [
    {
      id: 'home',
      label: 'Home',
      url: `${appBase}/buyer`,
      pathLabel: '/owners/s/buyer',
      src: '/projects/northgate-motors-demo/home.webp',
      thumb: '/projects/northgate-motors-demo/home-800.webp',
      alt: 'Northgate Motors buyer home page with an orange coupe and the headline “Drive something worth arriving in.”',
      caption:
        'The published buyer home: fictional inventory, a cinematic hero and a guest-safe catalogue entry point.',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      url: `${appBase}/buyer-inventory`,
      pathLabel: '/owners/s/buyer-inventory',
      src: '/projects/northgate-motors-demo/inventory.webp',
      thumb: '/projects/northgate-motors-demo/inventory-800.webp',
      alt: 'Northgate Motors inventory page with six dependent filters and a three-column listing grid.',
      caption:
        'Inventory: six dependent filters, paginated listings and deep-linkable vehicle records.',
    },
    {
      id: 'studio',
      label: '3D Studio',
      url: `${appBase}/buyer-studio`,
      pathLabel: '/owners/s/buyer-studio',
      src: '/projects/northgate-motors-demo/studio-3d.webp',
      thumb: '/projects/northgate-motors-demo/studio-3d-800.webp',
      alt: 'The Apex Concept 3D studio with a red concept car and paint finish controls.',
      caption:
        '3D Studio: the Apex Concept with illustrative Carmine, Pearl and Graphite finishes.',
    },
    {
      id: 'about',
      label: 'About',
      url: `${appBase}/buyer-about`,
      pathLabel: '/owners/s/buyer-about',
      src: '/projects/northgate-motors-demo/about.webp',
      thumb: '/projects/northgate-motors-demo/about-800.webp',
      alt: 'The Northgate Motors about page, an editorial layout in cream and black.',
      caption: 'About: the fictional dealership story, kept separate from product claims.',
    },
    {
      id: 'contact',
      label: 'Contact',
      url: `${appBase}/buyer-contact`,
      pathLabel: '/owners/s/buyer-contact',
      src: '/projects/northgate-motors-demo/contact.webp',
      thumb: '/projects/northgate-motors-demo/contact-800.webp',
      alt: 'The Northgate Motors contact page with a guest inquiry form.',
      caption:
        'Contact: inquiry intake with a synthetic-email rule, queue routing and draft-preserving guards.',
    },
  ] satisfies NorthgateLiveView[],
} as const;

export const northgateLiveHome = northgateLive.views[0];
