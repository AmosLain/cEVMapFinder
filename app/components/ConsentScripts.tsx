use client;

import { useEffect, useState } from react;
import Script from nextscript;
import { CONSENT_KEY } from .CookieBanner;

export default function ConsentScripts() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() = {
    const existing = localStorage.getItem(CONSENT_KEY);
    setAllowed(existing === accepted);
י
    const handler = (e any) = setAllowed(e.detail === accepted);
    window.addEventListener(evmf-cookie-consent, handler);
    return () = window.removeEventListener(evmf-cookie-consent, handler);
  }, []);

  if (!allowed) return null;

  return (
    
      { Google AdSense }
      Script
        async
        strategy=afterInteractive
        src=httpspagead2.googlesyndication.compageadjsadsbygoogle.jsclient=ca-pub-6510652100353402
        crossOrigin=anonymous
      

      { Google Ads Tag }
      Script
        src=httpswww.googletagmanager.comgtagjsid=AW-17199339752
        strategy=afterInteractive
      
      Script id=google-ads-tag strategy=afterInteractive
        {`
          window.dataLayer = window.dataLayer  [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17199339752');
        `}
      Script
    
  );
}