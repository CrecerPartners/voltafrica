import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@digihire/shared";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold font-display">404</h1>
        <p className="text-lg text-muted-foreground">Oops! Page not found</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="volt-gradient gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


