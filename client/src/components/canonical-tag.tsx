import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

export function CanonicalTag() {
  const [location] = useLocation();
  const baseUrl = "https://whypals.com";
  
  // Clean path: ensure starts with /
  let path = location.startsWith("/") ? location : `/${location}`;
  
  // Remove trailing slash for non-root paths to match requirements
  // e.g. /videos instead of /videos/
  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  
  const canonicalUrl = `${baseUrl}${path}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
