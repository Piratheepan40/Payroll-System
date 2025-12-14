
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
            <Link
                to="/"
                className="flex items-center hover:text-primary transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>

            {pathnames.length > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}

            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const formattedName = value.charAt(0).toUpperCase() + value.slice(1);

                return (
                    <div key={to} className="flex items-center space-x-1">
                        {isLast ? (
                            <span className="font-semibold text-foreground">{formattedName}</span>
                        ) : (
                            <>
                                <Link
                                    to={to}
                                    className="hover:text-primary transition-colors"
                                >
                                    {formattedName}
                                </Link>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                            </>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
