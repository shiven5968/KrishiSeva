// SEO & Meta Tag Management Engine for KrishiSeva (कृषि सेवा)
// Ensures unique titles, meta descriptions, canonical URLs, OG images, and structured breadcrumbs per route

export const ROUTE_SEO_CONFIG = {
  landing: {
    title: 'KrishiSeva | कृषि सेवा - On-Demand Agricultural Machinery & Heavy Farm Fleet',
    description: 'Book nearby tractors, combine harvesters, drone sprayers & rotavators with GPS field tracking and fair regional bigha rates. Integrated with UP Bhulekh & AgriStack.',
    canonical: 'https://krishiseva.in/',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' }
    ]
  },
  farmer: {
    title: 'Farmer Cockpit & GPS Plot Booking | KrishiSeva (कृषि सेवा)',
    description: 'Select your field plot via satellite GPS radar or UP Bhulekh Khasra. Instant tractor and machinery booking with verified driver dispatch.',
    canonical: 'https://krishiseva.in/#farmer',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' },
      { name: 'Farmer Cockpit', item: 'https://krishiseva.in/#farmer' }
    ]
  },
  driver: {
    title: 'Driver Partner & Machinery Telemetry Portal | KrishiSeva',
    description: 'Register your farm machinery, view nearby booking requests, live field navigation and receive instant direct payments.',
    canonical: 'https://krishiseva.in/#driver',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' },
      { name: 'Driver Partner Portal', item: 'https://krishiseva.in/#driver' }
    ]
  },
  admin: {
    title: 'Super Admin Console & Live Telemetry | KrishiSeva',
    description: 'Centralized telemetry, driver KYC audits, real-time dispatch monitoring and regional pricing multipliers.',
    canonical: 'https://krishiseva.in/#admin',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' },
      { name: 'Admin Console', item: 'https://krishiseva.in/#admin' }
    ]
  },
  contact: {
    title: 'Contact Us & 24x7 Kisan CHC Helpline | KrishiSeva',
    description: 'Get in touch with KrishiSeva support for machinery bookings, CHC onboarding, technical assistance, or call toll-free 1800-KRISHI.',
    canonical: 'https://krishiseva.in/#contact',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' },
      { name: 'Contact & Support', item: 'https://krishiseva.in/#contact' }
    ]
  },
  privacy: {
    title: 'Privacy Policy & Data Security (DPDP 2023) | KrishiSeva',
    description: 'KrishiSeva privacy policy and data governance practices compliant with India DPDP Act 2023 for AgriStack and UIDAI eKYC land records.',
    canonical: 'https://krishiseva.in/#privacy',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' },
      { name: 'Privacy Policy', item: 'https://krishiseva.in/#privacy' }
    ]
  },
  terms: {
    title: 'Terms of Service & Rental Conditions | KrishiSeva',
    description: 'Terms of service and fair usage guidelines for farmers, machinery operators, and Custom Hiring Centers (CHCs).',
    canonical: 'https://krishiseva.in/#terms',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' },
      { name: 'Terms of Service', item: 'https://krishiseva.in/#terms' }
    ]
  },
  not_found: {
    title: '404 - Page Not Found | KrishiSeva (कृषि सेवा)',
    description: 'The requested agricultural machinery page or field plot was not found. Return to KrishiSeva home or call the Kisan helpline.',
    canonical: 'https://krishiseva.in/#404',
    ogImage: 'https://krishiseva.in/images/krishiseva-og-banner.png',
    breadcrumbs: [
      { name: 'Home', item: 'https://krishiseva.in/' },
      { name: '404 Not Found', item: 'https://krishiseva.in/#404' }
    ]
  }
};

/**
 * Updates DOM title, meta description, canonical link, and Open Graph tags dynamically
 */
export function updatePageSEO(routeKey = 'landing') {
  if (typeof document === 'undefined') return;

  const config = ROUTE_SEO_CONFIG[routeKey] || ROUTE_SEO_CONFIG.landing;

  // 1. Update Title Tag
  document.title = config.title;

  // 2. Update or Create Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Update or Create Canonical Tag
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', config.canonical);

  // 4. Update Open Graph Meta Tags
  const setMeta = (attrName, attrValue, content) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('property', 'og:title', config.title);
  setMeta('property', 'og:description', config.description);
  setMeta('property', 'og:url', config.canonical);
  setMeta('property', 'og:image', config.ogImage);
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);
  setMeta('name', 'twitter:image', config.ogImage);

  // 5. Update Dynamic JSON-LD Breadcrumbs
  updateBreadcrumbSchema(config.breadcrumbs);
}

/**
 * Updates or injects JSON-LD BreadcrumbList structured data
 */
function updateBreadcrumbSchema(breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length === 0) return;

  let scriptEl = document.getElementById('krishi-breadcrumbs-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'krishi-breadcrumbs-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((bc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: bc.name,
      item: bc.item
    }))
  };

  scriptEl.textContent = JSON.stringify(schema);
}
