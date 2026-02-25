export const metadata = { title: "Terms of Use | EVMapFinder" };

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Terms of Use</h1>

      <h2>Service</h2>
      <p>
        EVMapFinder provides EV charging station information based on third-party sources.
      </p>

      <h2>No guarantee</h2>
      <p>
        Information is provided “AS IS” without warranties of accuracy, availability, or station functionality.
      </p>

      <h2>User responsibility</h2>
      <p>
        You are responsible for verifying station availability, compatibility, access rules, pricing, and operating hours before relying on it.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        EVMapFinder is not liable for any damages (direct or indirect) resulting from use of the website, inaccurate data, or third-party service issues.
      </p>

      <h2>Third-party services</h2>
      <p>
        The website integrates services like Google Maps and OpenChargeMap. We are not responsible for their availability or policies.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed exclusively by the laws of the State of Israel.</p>

      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:support@evmapfinder.com">support@evmapfinder.com</a>
      </p>
    </main>
  );
}