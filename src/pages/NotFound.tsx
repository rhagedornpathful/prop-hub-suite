import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Track 404s in dev for audit purposes
    try {
      const key = '404_paths';
      const list = JSON.parse(sessionStorage.getItem(key) || '[]');
      list.push({ path: location.pathname, ts: Date.now() });
      sessionStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      // ignore storage errors
    }
    logger.error("404: attempted to access non-existent route", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <Link to="/" className="text-primary underline hover:opacity-80">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
