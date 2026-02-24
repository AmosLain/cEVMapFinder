import { MetadataRoute } from "next";

const SITE = "https://www.evmapfinder.com";

const CITY_SLUGS = [
  // Israel
  "tel-aviv", "jerusalem", "haifa", "rishon-lezion", "petah-tikva",
  "beer-sheva", "netanya", "ashdod", "eilat",

  // United States
  "new-york", "los-angeles", "san-francisco", "san-diego", "seattle",
  "austin", "chicago", "miami",

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
    changeFrequency: "daily",
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
