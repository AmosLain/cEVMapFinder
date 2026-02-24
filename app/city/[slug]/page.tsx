import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type City = {
  slug: string;
  name: string;
  countryName: string;
  lat: number;
  lng: number;
  radiusKm?: number;
};

type Station = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
};

const CITIES: City[] = [
  // Israel
  { slug: "tel-aviv", name: "Tel Aviv", countryName: "Israel", lat: 32.0853, lng: 34.7818, radiusKm: 20 },
  { slug: "jerusalem", name: "Jerusalem", countryName: "Israel", lat: 31.7683, lng: 35.2137, radiusKm: 20 },
  { slug: "haifa", name: "Haifa", countryName: "Israel", lat: 32.7940, lng: 34.9896, radiusKm: 25 },
  { slug: "rishon-lezion", name: "Rishon LeZion", countryName: "Israel", lat: 31.9730, lng: 34.7925, radiusKm: 20 },
  { slug: "petah-tikva", name: "Petah Tikva", countryName: "Israel", lat: 32.0887, lng: 34.8864, radiusKm: 20 },
  { slug: "beer-sheva", name: "Be'er Sheva", countryName: "Israel", lat: 31.2520, lng: 34.7915, radiusKm: 25 },
  { slug: "netanya", name: "Netanya", countryName: "Israel", lat: 32.3215, lng: 34.8532, radiusKm: 25 },
  { slug: "ashdod", name: "Ashdod", countryName: "Israel", lat: 31.8044, lng: 34.6553, radiusKm: 25 },
  { slug: "eilat", name: "Eilat", countryName: "Israel", lat: 29.5577, lng: 34.9519, radiusKm: 25 },

  // United States
  { slug: "new-york", name: "New York", countryName: "United States", lat: 40.7128, lng: -74.0060 },
  { slug: "los-angeles", name: "Los Angeles", countryName: "United States", lat: 34.0522, lng: -118.2437 },
  { slug: "san-francisco", name: "San Francisco", countryName: "United States", lat: 37.7749, lng: -122.4194 },
  { slug: "san-diego", name: "San Diego", countryName: "United States", lat: 32.7157, lng: -117.1611 },
  { slug: "seattle", name: "Seattle", countryName: "United States", lat: 47.6062, lng: -122.3321 },
  { slug: "austin", name: "Austin", countryName: "United States", lat: 30.2672, lng: -97.7431 },
  { slug: "chicago", name: "Chicago", countryName: "United States", lat: 41.8781, lng: -87.6298 },
  { slug: "miami", name: "Miami", countryName: "United States", lat: 25.7617, lng: -80.1918 },

  // United Kingdom
  { slug: "london", name: "London", countryName: "United Kingdom", lat: 51.5072, lng: -0.1276 },
  { slug: "manchester", name: "Manchester", countryName: "United Kingdom", lat: 53.4808, lng: -2.2426 },
  { slug: "birmingham", name: "Birmingham", countryName: "United Kingdom", lat: 52.4862, lng: -1.8904 },

  // Netherlands
  { slug: "amsterdam", name: "Amsterdam", countryName: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { slug: "rotterdam", name: "Rotterdam", countryName: "Netherlands", lat: 51.9244, lng: 4.4777 },
  { slug: "utrecht", name: "Utrecht", countryName: "Netherlands", lat: 52.0907, lng: 5.1214 },
  { slug: "the-hague", name: "The Hague", countryName: "Netherlands", lat: 52.0705, lng: 4.3007 },

  // Germany
  { slug: "berlin", name: "Berlin", countryName: "Germany", lat: 52.5200, lng: 13.4050 },
  { slug: "munich", name: "Munich", countryName: "Germany", lat: 48.1351, lng: 11.5820 },
  { slug: "hamburg", name: "Hamburg", countryName: "Germany", lat: 53.5511, lng: 9.9937 },
  { slug: "frankfurt", name: "Frankfurt", countryName: "Germany", lat: 50.1109, lng: 8.6821 },
  { slug: "cologne", name: "Cologne", countryName: "Germany", lat: 50.9375, lng: 6.9603 },

  // France
  { slug: "paris", name: "Paris", countryName: "France", lat: 48.8566, lng: 2.3522 },
  { slug: "lyon", name: "Lyon", countryName: "France", lat: 45.7640, lng: 4.8357 },
  { slug: "marseille", name: "Marseille", countryName: "France", lat: 43.2965, lng: 5.3698 },
  { slug: "toulouse", name: "Toulouse", countryName: "France", lat: 43.6047, lng: 1.4442 },

  // Norway
  { slug: "oslo", name: "Oslo", countryName: "Norway", lat: 59.9139, lng: 10.7522 },
  { slug: "bergen", name: "Bergen", countryName: "Norway", lat: 60.3913, lng: 5.3221 },

  // Sweden
  { slug: "stockholm", name: "Stockholm", countryName: "Sweden", lat: 59.3293, lng: 18.0686 },
  { slug: "gothenburg", name: "Gothenburg", countryName: "Sweden", lat: 57.7089, lng: 11.9746 },

  // Denmark
  { slug: "copenhagen", name: "Copenhagen", countryName: "Denmark", lat: 55.6761, lng: 12.5683 },

  // Switzerland
  { slug: "zurich", name: "Zurich", countryName: "Switzerland", lat: 47.3769, lng: 8.5417 },
  { slug: "geneva", name: "Geneva", countryName: "Switzerland", lat: 46.2044, lng: 6.1432 },

  // Italy
  { slug: "milan", name: "Milan", countryName: "Italy", lat: 45.4642, lng: 9.1900 },
  { slug: "rome", name: "Rome", countryName: "Italy", lat: 41.9028, lng: 12.4964 },
  { slug: "turin", name: "Turin", countryName: "Italy", lat: 45.0703, lng: 7.6869 },

  // Spain
  { slug: "madrid", name: "Madrid", countryName: "Spain", lat: 40.4168, lng: -3.7038 },
  { slug: "barcelona", name: "Barcelona", countryName: "Spain", lat: 41.3851, lng: 2.1734 },
  { slug: "valencia", name: "Valencia", countryName: "Spain", lat: 39.4699, lng: -0.3763 },

  // Portugal
  { slug: "lisbon", name: "Lisbon", countryName: "Portugal", lat: 38.7223, lng: -9.1393 },

  // Ireland
  { slug: "dublin", name: "Dublin", countryName: "Ireland", lat: 53.3498, lng: -6.2603 },

  // Belgium
  { slug: "brussels", name: "Brussels", countryName: "Belgium", lat: 50.8476, lng: 4.3572 },

  // Poland
  { slug: "warsaw", name: "Warsaw", countryName: "Poland", lat: 52.2297, lng: 21.0122 },
  { slug: "krakow", name: "Krakow", countryName: "Poland", lat: 50.0647, lng: 19.9450 },

  // Czech Republic
  { slug: "prague", name: "Prague", countryName: "Czech Republic", lat: 50.0755, lng: 14.4378 },

  // Austria
  { slug: "vienna", name: "Vienna", countryName: "Austria", lat: 48.2082, lng: 16.3738 },

  // Finland
  { slug: "helsinki", name: "Helsinki", countryName: "Finland", lat: 60.1699, lng: 24.9384 },

  // Canada
  { slug: "toronto", name: "Toronto", countryName: "Canada", lat: 43.6532, lng: -79.3832 },
  { slug: "vancouver", name: "Vancouver", countryName: "Canada", lat: 49.2827, lng: -123.1207 },
  { slug: "montreal", name: "Montreal", countryName: "Canada", lat: 45.5017, lng: -73.5673 },

  // Australia
  { slug: "sydney", name: "Sydney", countryName: "Australia", lat: -33.8688, lng: 151.2093 },
  { slug: "melbourne", name: "Melbourne", countryName: "Australia", lat: -37.8136, lng: 144.9631 },
  { slug: "brisbane", name: "Brisbane", countryName: "Australia", lat: -27.4698, lng: 153.0251 },

  // Japan
  { slug: "tokyo", name: "Tokyo", countryName: "Japan", lat: 35.6762, lng: 139.6503 },
  { slug: "osaka", name: "Osaka", countryName: "Japan", lat: 34.6937, lng: 135.5023 },
  { slug: "nagoya", name: "Nagoya", countryName: "Japan", lat: 35.1815, lng: 136.9066 },

  // South Korea
  { slug: "seoul", name: "Seoul", countryName: "South Korea", lat: 37.5665, lng: 126.9780 },
  { slug: "busan", name: "Busan", countryName: "South Korea", lat: 35.1796, lng: 129.0756 },

  // Singapore
  { slug: "singapore", name: "Singapore", countryName: "Singapore", lat: 1.3521, lng: 103.8198 },

  // Hong Kong
  { slug: "hong-kong", name: "Hong Kong", countryName: "Hong Kong", lat: 22.3193, lng: 114.1694 },

  // China
  { slug: "shanghai", name: "Shanghai", countryName: "China", lat: 31.2304, lng: 121.4737 },
  { slug: "beijing", name: "Beijing", countryName: "China", lat: 39.9042, lng: 116.4074 },
  { slug: "shenzhen", name: "Shenzhen", countryName: "China", lat: 22.5431, lng: 114.0579 },
  { slug: "guangzhou", name: "Guangzhou", countryName: "China", lat: 23.1291, lng: 113.2644 },
  { slug: "hangzhou", name: "Hangzhou", countryName: "China", lat: 30.2741, lng: 120.1551 },

  // UAE
  { slug: "dubai", name: "Dubai", countryName: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { slug: "abu-dhabi", name: "Abu Dhabi", countryName: "United Arab Emirates", lat: 24.4539, lng: 54.3773 },
];

function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

async function fetchStationsForCity(city: City): Promise<Station[]> {
  const radius = city.radiusKm ?? 20;
  const url =
    `https://api.openchargemap.io/v3/poi/?output=json` +
    `&latitude=${encodeURIComponent(city.lat)}` +
    `&longitude=${encodeURIComponent(city.lng)}` +
    `&distance=${encodeURIComponent(radius)}` +
    `&distanceunit=KM` +
    `&maxresults=60` +
    `&compact=true` +
    `&verbose=false`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    return items.map((item: any) => ({
      id: String(item.ID),
      name: String(item.AddressInfo?.Title ?? "Unknown Station"),
      address: String(item.AddressInfo?.AddressLine1 ?? ""),
      city: String(item.AddressInfo?.Town ?? ""),
      country: String(item.AddressInfo?.Country?.Title ?? ""),
      lat: item.AddressInfo?.Latitude,
      lng: item.AddressInfo?.Longitude,
    }));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const city = getCity(params.slug);
  if (!city) return {};

  const title = `EV Charging Stations in ${city.name} (${city.countryName}) | EVMapFinder`;
  const description = `Find all EV charging stations in ${city.name}, ${city.countryName}. Browse up to ${city.radiusKm ?? 20}km of charging points and get directions instantly via Google Maps.`;
  const canonical = `https://www.evmapfinder.com/city/${city.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical },
    robots: { index: true, follow: true },
  };
}

// ─── JSON-LD Structured Data ─────────────────────────────────────────────────

function CityJsonLd({ city, stations }: { city: City; stations: Station[] }) {
  const canonical = `https://www.evmapfinder.com/city/${city.slug}`;
  const radius = city.radiusKm ?? 20;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.evmapfinder.com" },
      { "@type": "ListItem", position: 2, name: `EV Charging in ${city.name}`, item: canonical },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `EV Charging Stations in ${city.name}`,
    description: `List of EV charging points within ${radius}km of ${city.name} city center.`,
    numberOfItems: stations.length,
    itemListElement: stations.slice(0, 10).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      item: {
        "@type": "LocalBusiness",
        name: s.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: s.address,
          addressLocality: s.city || city.name,
          addressCountry: city.countryName,
        },
        ...(typeof s.lat === "number" && typeof s.lng === "number"
          ? { geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng } }
          : {}),
      },
    })),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many EV charging stations are in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `EVMapFinder currently lists ${stations.length} EV charging stations within ${radius}km of ${city.name} city center, sourced from OpenChargeMap.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I find EV charging stations near me in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Use the "Find near me" button on the EVMapFinder homepage to automatically detect your location and sort charging stations by distance in real time.`,
        },
      },
      {
        "@type": "Question",
        name: `Are the EV charging stations in ${city.name} free to use?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Charging costs vary by network and operator. Some stations in ${city.name} offer free charging while others require payment. Check the individual station or its operator's app for current pricing.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CityPage({ params }: { params: { slug: string } }) {
  const city = getCity(params.slug);
  if (!city) notFound();

  const stations = await fetchStationsForCity(city);
  const radius = city.radiusKm ?? 20;

  return (
    <>
      <CityJsonLd city={city} stations={stations} />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-400">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li className="text-slate-200">EV Charging in {city.name}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              EV Charging Stations in {city.name}
            </h1>
            <p className="text-slate-400 mt-2">
              {city.countryName} · Within ~{radius}km of the city center
            </p>
          </header>

          {/* Intro paragraph — helps SEO with unique text per city */}
          <section className="mb-8">
            <p className="text-slate-300 leading-relaxed">
              Looking for electric vehicle charging stations in{" "}
              <strong>{city.name}</strong>? EVMapFinder lists{" "}
              <strong>{stations.length} charging points</strong> within {radius}km
              of {city.name} city center, sourced live from OpenChargeMap. Each
              result includes the station name, address, and a one-tap link to
              open it in Google Maps — so you can navigate there instantly from
              your phone.
            </p>
          </section>

          {/* Tip banner */}
          <section className="mb-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-300">
                💡 Tip: use the{" "}
                <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">
                  "Find near me"
                </Link>{" "}
                button on the homepage for real-time sorting by your exact
                current location.
              </p>
            </div>
          </section>

          {/* Station list */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">
              Nearby stations ({stations.length})
            </h2>

            {stations.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-300">
                No stations found for this area right now. Try another city or
                use the homepage "Find near me".
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((s) => (
                  <li key={s.id} className="bg-slate-800 rounded-xl p-4">
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-slate-400 text-sm">{s.address}</p>
                    <p className="text-slate-400 text-sm">
                      {s.city}
                      {s.city && s.country ? ", " : ""}
                      {s.country}
                    </p>
                    {typeof s.lat === "number" && typeof s.lng === "number" ? (
                      <a
                        className="inline-block mt-3 text-sm text-emerald-300 hover:text-emerald-200"
                        href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Google Maps →
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* FAQ section — JSON-LD above matches these questions */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-6">
              <div>
                <dt className="font-medium text-white">
                  How many EV charging stations are in {city.name}?
                </dt>
                <dd className="mt-1 text-slate-400 text-sm leading-relaxed">
                  EVMapFinder currently lists {stations.length} charging stations
                  within {radius}km of {city.name} city center, sourced from
                  OpenChargeMap. Data is refreshed hourly.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-white">
                  How do I find EV charging stations near me in {city.name}?
                </dt>
                <dd className="mt-1 text-slate-400 text-sm leading-relaxed">
                  Use the "Find near me" button on the{" "}
                  <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">
                    EVMapFinder homepage
                  </Link>{" "}
                  to auto-detect your location and sort results by distance in
                  real time.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-white">
                  Are the EV charging stations in {city.name} free to use?
                </dt>
                <dd className="mt-1 text-slate-400 text-sm leading-relaxed">
                  Pricing varies by network and operator. Some stations in{" "}
                  {city.name} offer free charging; others require a membership or
                  per-kWh payment. Check the individual station or its operator's
                  app for current pricing.
                </dd>
              </div>
            </dl>
          </section>

          {/* Footer */}
          <footer className="mt-4 text-sm text-slate-500">
            <p>
              Data source: OpenChargeMap (public endpoint). Results may vary by
              availability. Last updated: hourly.
            </p>
          </footer>

        </div>
      </main>
    </>
  );
}
