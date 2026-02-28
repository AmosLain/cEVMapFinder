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

  // United States — California
  { slug: "los-angeles", name: "Los Angeles", countryName: "United States", lat: 34.0522, lng: -118.2437, radiusKm: 25 },
  { slug: "san-francisco", name: "San Francisco", countryName: "United States", lat: 37.7749, lng: -122.4194, radiusKm: 20 },
  { slug: "san-diego", name: "San Diego", countryName: "United States", lat: 32.7157, lng: -117.1611, radiusKm: 25 },
  { slug: "san-jose", name: "San Jose", countryName: "United States", lat: 37.3382, lng: -121.8863, radiusKm: 20 },
  { slug: "sacramento", name: "Sacramento", countryName: "United States", lat: 38.5816, lng: -121.4944, radiusKm: 20 },
  { slug: "fresno", name: "Fresno", countryName: "United States", lat: 36.7378, lng: -119.7871, radiusKm: 20 },
  { slug: "long-beach", name: "Long Beach", countryName: "United States", lat: 33.7701, lng: -118.1937, radiusKm: 15 },
  { slug: "oakland", name: "Oakland", countryName: "United States", lat: 37.8044, lng: -122.2712, radiusKm: 15 },
  { slug: "anaheim", name: "Anaheim", countryName: "United States", lat: 33.8366, lng: -117.9143, radiusKm: 15 },
  { slug: "santa-ana", name: "Santa Ana", countryName: "United States", lat: 33.7455, lng: -117.8677, radiusKm: 15 },
  { slug: "irvine", name: "Irvine", countryName: "United States", lat: 33.6846, lng: -117.8265, radiusKm: 15 },
  { slug: "palo-alto", name: "Palo Alto", countryName: "United States", lat: 37.4419, lng: -122.1430, radiusKm: 15 },
  { slug: "santa-monica", name: "Santa Monica", countryName: "United States", lat: 34.0195, lng: -118.4912, radiusKm: 15 },
  { slug: "pasadena", name: "Pasadena", countryName: "United States", lat: 34.1478, lng: -118.1445, radiusKm: 15 },
  { slug: "berkeley", name: "Berkeley", countryName: "United States", lat: 37.8716, lng: -122.2727, radiusKm: 15 },

  // United States — Texas
  { slug: "austin", name: "Austin", countryName: "United States", lat: 30.2672, lng: -97.7431, radiusKm: 25 },
  { slug: "houston", name: "Houston", countryName: "United States", lat: 29.7604, lng: -95.3698, radiusKm: 25 },
  { slug: "dallas", name: "Dallas", countryName: "United States", lat: 32.7767, lng: -96.7970, radiusKm: 25 },
  { slug: "san-antonio", name: "San Antonio", countryName: "United States", lat: 29.4241, lng: -98.4936, radiusKm: 25 },
  { slug: "fort-worth", name: "Fort Worth", countryName: "United States", lat: 32.7555, lng: -97.3308, radiusKm: 20 },
  { slug: "el-paso", name: "El Paso", countryName: "United States", lat: 31.7619, lng: -106.4850, radiusKm: 20 },
  { slug: "plano", name: "Plano", countryName: "United States", lat: 33.0198, lng: -96.6989, radiusKm: 15 },

  // United States — Florida
  { slug: "miami", name: "Miami", countryName: "United States", lat: 25.7617, lng: -80.1918, radiusKm: 20 },
  { slug: "orlando", name: "Orlando", countryName: "United States", lat: 28.5383, lng: -81.3792, radiusKm: 20 },
  { slug: "tampa", name: "Tampa", countryName: "United States", lat: 27.9506, lng: -82.4572, radiusKm: 20 },
  { slug: "jacksonville", name: "Jacksonville", countryName: "United States", lat: 30.3322, lng: -81.6557, radiusKm: 25 },
  { slug: "fort-lauderdale", name: "Fort Lauderdale", countryName: "United States", lat: 26.1224, lng: -80.1373, radiusKm: 15 },
  { slug: "st-petersburg", name: "St. Petersburg", countryName: "United States", lat: 27.7676, lng: -82.6403, radiusKm: 15 },

  // United States — New York & Northeast
  { slug: "new-york", name: "New York", countryName: "United States", lat: 40.7128, lng: -74.0060, radiusKm: 20 },
  { slug: "buffalo", name: "Buffalo", countryName: "United States", lat: 42.8864, lng: -78.8784, radiusKm: 20 },
  { slug: "boston", name: "Boston", countryName: "United States", lat: 42.3601, lng: -71.0589, radiusKm: 20 },
  { slug: "philadelphia", name: "Philadelphia", countryName: "United States", lat: 39.9526, lng: -75.1652, radiusKm: 20 },
  { slug: "washington-dc", name: "Washington DC", countryName: "United States", lat: 38.9072, lng: -77.0369, radiusKm: 20 },
  { slug: "baltimore", name: "Baltimore", countryName: "United States", lat: 39.2904, lng: -76.6122, radiusKm: 20 },
  { slug: "newark", name: "Newark", countryName: "United States", lat: 40.7357, lng: -74.1724, radiusKm: 15 },

  // United States — Midwest
  { slug: "chicago", name: "Chicago", countryName: "United States", lat: 41.8781, lng: -87.6298, radiusKm: 25 },
  { slug: "detroit", name: "Detroit", countryName: "United States", lat: 42.3314, lng: -83.0458, radiusKm: 20 },
  { slug: "indianapolis", name: "Indianapolis", countryName: "United States", lat: 39.7684, lng: -86.1581, radiusKm: 20 },
  { slug: "columbus", name: "Columbus", countryName: "United States", lat: 39.9612, lng: -82.9988, radiusKm: 20 },
  { slug: "cleveland", name: "Cleveland", countryName: "United States", lat: 41.4993, lng: -81.6944, radiusKm: 20 },
  { slug: "minneapolis", name: "Minneapolis", countryName: "United States", lat: 44.9778, lng: -93.2650, radiusKm: 20 },
  { slug: "milwaukee", name: "Milwaukee", countryName: "United States", lat: 43.0389, lng: -87.9065, radiusKm: 20 },
  { slug: "kansas-city", name: "Kansas City", countryName: "United States", lat: 39.0997, lng: -94.5786, radiusKm: 20 },
  { slug: "st-louis", name: "St. Louis", countryName: "United States", lat: 38.6270, lng: -90.1994, radiusKm: 20 },
  { slug: "omaha", name: "Omaha", countryName: "United States", lat: 41.2565, lng: -95.9345, radiusKm: 20 },

  // United States — Pacific Northwest & Mountain
  { slug: "seattle", name: "Seattle", countryName: "United States", lat: 47.6062, lng: -122.3321, radiusKm: 20 },
  { slug: "portland", name: "Portland", countryName: "United States", lat: 45.5051, lng: -122.6750, radiusKm: 20 },
  { slug: "denver", name: "Denver", countryName: "United States", lat: 39.7392, lng: -104.9903, radiusKm: 20 },
  { slug: "phoenix", name: "Phoenix", countryName: "United States", lat: 33.4484, lng: -112.0740, radiusKm: 25 },
  { slug: "tucson", name: "Tucson", countryName: "United States", lat: 32.2226, lng: -110.9747, radiusKm: 20 },
  { slug: "las-vegas", name: "Las Vegas", countryName: "United States", lat: 36.1699, lng: -115.1398, radiusKm: 20 },
  { slug: "salt-lake-city", name: "Salt Lake City", countryName: "United States", lat: 40.7608, lng: -111.8910, radiusKm: 20 },
  { slug: "albuquerque", name: "Albuquerque", countryName: "United States", lat: 35.0844, lng: -106.6504, radiusKm: 20 },
  { slug: "boise", name: "Boise", countryName: "United States", lat: 43.6150, lng: -116.2023, radiusKm: 20 },

  // United States — Southeast
  { slug: "atlanta", name: "Atlanta", countryName: "United States", lat: 33.7490, lng: -84.3880, radiusKm: 20 },
  { slug: "charlotte", name: "Charlotte", countryName: "United States", lat: 35.2271, lng: -80.8431, radiusKm: 20 },
  { slug: "raleigh", name: "Raleigh", countryName: "United States", lat: 35.7796, lng: -78.6382, radiusKm: 20 },
  { slug: "nashville", name: "Nashville", countryName: "United States", lat: 36.1627, lng: -86.7816, radiusKm: 20 },
  { slug: "memphis", name: "Memphis", countryName: "United States", lat: 35.1495, lng: -90.0490, radiusKm: 20 },
  { slug: "new-orleans", name: "New Orleans", countryName: "United States", lat: 29.9511, lng: -90.0715, radiusKm: 20 },
  { slug: "louisville", name: "Louisville", countryName: "United States", lat: 38.2527, lng: -85.7585, radiusKm: 20 },
  { slug: "richmond", name: "Richmond", countryName: "United States", lat: 37.5407, lng: -77.4360, radiusKm: 20 },
  { slug: "virginia-beach", name: "Virginia Beach", countryName: "United States", lat: 36.8529, lng: -75.9780, radiusKm: 20 },

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

  const radius = city.radiusKm ?? 20;
  const title = `EV Charging Stations in ${city.name}, ${city.countryName} | EVMapFinder`;
  const description = `Find electric vehicle charging stations in ${city.name}, ${city.countryName}. Browse up to ${radius}km of EV charging points with directions via Google Maps. Updated hourly.`;
  const canonical = `https://www.evmapfinder.com/city/${city.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical },
    robots: { index: true, follow: true },
  };
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
          text: `EVMapFinder currently lists ${stations.length} EV charging stations within ${radius}km of ${city.name} city center, sourced from OpenChargeMap. Data is refreshed hourly.`,
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

export default async function CityPage({ params }: { params: { slug: string } }) {
  const city = getCity(params.slug);
  if (!city) notFound();

  const stations = await fetchStationsForCity(city);
  const radius = city.radiusKm ?? 20;

  const nearbyCities = CITIES.filter(
    (c) => c.slug !== city.slug && c.countryName === city.countryName
  ).slice(0, 8);

  return (
    <>
      <CityJsonLd city={city} stations={stations} />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">

          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-400">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-slate-200">EV Charging in {city.name}</li>
            </ol>
          </nav>

          <header className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              EV Charging Stations in {city.name}
            </h1>
            <p className="text-slate-400 mt-2">
              {city.countryName} · Within ~{radius}km of the city center
            </p>
          </header>

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

          <section className="mb-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-300">
                💡 Tip: use the{" "}
                <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">
                  &quot;Find near me&quot;
                </Link>{" "}
                button on the homepage for real-time sorting by your exact current location.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">
              Nearby stations ({stations.length})
            </h2>
            {stations.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-300">
                No stations found for this area right now. Try another city or use the homepage &quot;Find near me&quot;.
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((s) => (
                  <li key={s.id} className="bg-slate-800 rounded-xl p-4">
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-slate-400 text-sm">{s.address}</p>
                    <p className="text-slate-400 text-sm">
                      {s.city}{s.city && s.country ? ", " : ""}{s.country}
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

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <dl className="space-y-6">
              <div>
                <dt className="font-medium text-white">How many EV charging stations are in {city.name}?</dt>
                <dd className="mt-1 text-slate-400 text-sm leading-relaxed">
                  EVMapFinder currently lists {stations.length} charging stations within {radius}km of {city.name} city center, sourced from OpenChargeMap. Data is refreshed hourly.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-white">How do I find EV charging stations near me in {city.name}?</dt>
                <dd className="mt-1 text-slate-400 text-sm leading-relaxed">
                  Use the &quot;Find near me&quot; button on the{" "}
                  <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">EVMapFinder homepage</Link>{" "}
                  to auto-detect your location and sort results by distance in real time.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-white">Are the EV charging stations in {city.name} free to use?</dt>
                <dd className="mt-1 text-slate-400 text-sm leading-relaxed">
                  Pricing varies by network and operator. Some stations in {city.name} offer free charging; others require a membership or per-kWh payment. Check the individual station or its operator&apos;s app for current pricing.
                </dd>
              </div>
            </dl>
          </section>

          {nearbyCities.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-4">More cities in {city.countryName}</h2>
              <ul className="flex flex-wrap gap-3">
                {nearbyCities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/city/${c.slug}`}
                      className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      EV Charging in {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="mt-4 text-sm text-slate-500">
            <p>Data source: OpenChargeMap (public endpoint). Results may vary by availability. Last updated: hourly.</p>
          </footer>

        </div>
      </main>
    </>
  );
}
