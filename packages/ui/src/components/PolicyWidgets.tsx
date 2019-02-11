import * as React from "react";

const loadPolicyLib = (() => {
  let loaded: boolean = false;
  return () => {
    if (loaded) {
      return;
    }
    React.useEffect(() => {
      if (loaded) {
        return;
      }
      const doc = window.document;
      const script = doc.createElement("script");
      script.async = true;
      script.src = "https://cdn.iubenda.com/iubenda.js";
      doc.body.appendChild(script);
      loaded = true;
    }, [true]);
  };
})();

export function PrivacyWidget(): JSX.Element {
  loadPolicyLib();
  return (
    <div>
      <a
        href="https://www.iubenda.com/privacy-policy/22411524"
        className="iubenda-white no-brand iubenda-embed"
        title="Privacy Policy "
      >
        Privacy Policy
      </a>
    </div>
  );
}

export function CookieWidget(): JSX.Element {
  loadPolicyLib();
  return (
    <div>
      <a
        href="https://www.iubenda.com/privacy-policy/22411524/cookie-policy"
        className="iubenda-white no-brand iubenda-embed"
        title="Cookie Policy "
      >
        Cookie Policy
      </a>
    </div>
  );
}
