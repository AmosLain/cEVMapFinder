export const metadata = { title: "Privacy Policy | EVMapFinder" };

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> {new Date().toISOString().slice(0, 10)}</p>

      <p>
        EVMapFinder (“we”, “our”, “the website”) respects your privacy.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Approximate location (only if you click “Find near me” and allow it)</li>
        <li>Usage data via analytics/advertising tools</li>
        <li>Cookies and similar technologies</li>
      </ul>

      <h2>Location</h2>
      <p>
        Location is accessed only with your permission through your browser, and used to show nearby charging stations.
        We do not store your precise location.
      </p>

      <h2>Third-party services</h2>
      <p>
        We may use third-party services such as Google Maps, OpenChargeMap, analytics providers, and advertising providers.
        These services may process data under their own policies.
      </p>

      <h2>Cookies</h2>
      <p>
        Cookies may be used for analytics and advertising. You can manage cookies in your browser settings.
      </p>

      <h2>GDPR / EEA users</h2>
      <p>
        If you are in the EEA, you may have rights such as access, deletion, objection, and portability.
        Since we do not provide user accounts, many requests can be handled by clearing your browser data.
      </p>

      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:support@evmapfinder.com">support@evmapfinder.com</a>
      </p>
    </main>
  );
}