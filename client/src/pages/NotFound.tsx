import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Link href="/">
          <a className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity inline-block">
            Go back home
          </a>
        </Link>
      </div>
    </div>
  );
}

