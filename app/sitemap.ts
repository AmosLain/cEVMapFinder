import { MetadataRoute } from "next";

const SITE = "https://www.evmapfinder.com";

const CITY_SLUGS = [
  // Israel
  "tel-aviv", "jerusalem", "haifa", "rishon-lezion", "petah-tikva",
  "beer-sheva", "netanya", "ashdod", "eilat",

  // United States — California
  "los-angeles", "san-francisco", "san-diego", "san-jose", "sacramento",
  "fresno", "long-beach", "oakland", "anaheim", "santa-ana",
  "irvine", "palo-alto", "santa-monica", "pasadena", "berkeley",

  // United States — Texas
  "austin", "houston", "dallas", "san-antonio", "fort-worth",
  "el-paso", "plano",

  // United States — Florida
  "miami", "orlando", "tampa", "jacksonville", "fort-lauderdale", "st-petersburg",

  // United States — New York & Northeast
  "new-york", "buffalo", "boston", "philadelphia", "washington-dc",
  "baltimore", "newark",

  // United States — Midwest
  "chicago", "detroit", "indianapolis", "columbus", "cleveland",
  "minneapolis", "milwaukee", "kansas-city", "st-louis", "omaha",

  // United States — Pacific Northwest & Mountain
  "seattle", "portland", "denver", "phoenix", "tucson",
  "las-vegas", "salt-lake-city", "albuquerque", "boise",

  // United States — Southeast
  "atlanta", "charlotte", "raleigh", "nashville", "memphis",
  "new-orleans", "louisville", "richmond", "virginia-beach",

  // United Kingdom
  "london", "manchester", "birmingham",

  // Netherlands
  "amsterdam", "rotterdam", "utrecht", "the-hague",

  // Germany
  "berlin", "munich", "hamburg", "frankfurt", "cologne",

  // France
  "paris", "lyon", "marseille", "toulouse",

  // Norway
  "oslo", "bergen",

  // Sweden
  "stockholm", "gothenburg",

  // Denmark
  "copenhagen",

  // Switzerland
  "zurich", "geneva",

  // Italy
  "milan", "rome", "turin",

  // Spain
  "madrid", "barcelona", "valencia",

  // Portugal
  "lisbon",

  // Ireland
  "dublin",

  // Belgium
  "brussels",

  // Poland
  "warsaw", "krakow",

  // Czech Republic
  "prague",

  // Austria
  "vienna",

  // Finland
  "helsinki",

  // Canada
  "toronto", "vancouver", "montreal",

  // Australia
  "sydney", "melbourne", "brisbane",

  // Japan
  "tokyo", "osaka", "nagoya",

  // South Korea
  "seoul", "busan",

  // Singapore
  "singapore",

  // Hong Kong
  "hong-kong",

  // China
  "shanghai", "beijing", "shenzhen", "guangzhou", "hangzhou",

  // UAE
  "dubai", "abu-dhabi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${SITE}/city/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...cityPages,
  ];
}
