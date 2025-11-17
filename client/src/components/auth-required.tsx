/**
 * Authentication required component
 * Extracted from pages to follow CLAUDE C-4 (functions ≤20 lines)
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * Display when user is not authenticated
 */
export function AuthRequired() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Niet ingelogd</h1>
        <p className="text-muted-foreground mb-4">
          Je moet ingelogd zijn om deze pagina te bekijken.
        </p>
        <Link to="/login">
          <Button>Inloggen</Button>
        </Link>
      </div>
    </div>
  );
}