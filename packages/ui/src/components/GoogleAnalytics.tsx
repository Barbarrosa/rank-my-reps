import * as React from "react";

const loadGoogleAnalytics = (() => {
  let loaded: boolean = false;
  return () => {
    if (loaded) {
      return;
    }

    // Global site tag (gtag.js) - Google Analytics
    React.useEffect(() => {
      if (loaded) {
        return;
      }

      (window as typeof window & { dataLayer: any[] }).dataLayer = [
        ["js", new Date()],
        ["config", "UA-134246645-1"]
      ];

      const doc = window.document;
      const script = doc.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=UA-134246645-1";
      doc.body.appendChild(script);
      loaded = true;
    }, [true]);
  };
})();

export default function GoogleAnalytics(): JSX.Element {
  loadGoogleAnalytics();
  return <React.Fragment />;
}
