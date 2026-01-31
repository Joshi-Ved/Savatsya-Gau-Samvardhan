
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-dark-background">
      <div className="text-center max-w-lg mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-sawatsya-earth mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-medium text-sawatsya-wood dark:text-dark-foreground mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-dark-muted-foreground mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Button asChild className="btn-primary">
          <Link to="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
