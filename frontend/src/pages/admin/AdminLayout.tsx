import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Activity, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
    const { pathname } = useLocation();
    const { logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Activity, label: 'Live Activity', path: '/admin/live-activity' },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    const NavLinks = ({ onClick }: { onClick?: () => void }) => (
        <>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClick}
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            isActive
                                ? "bg-sawatsya-earth/10 text-sawatsya-earth dark:bg-blue-900/30 dark:text-blue-300"
                                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                        )}
                    >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                    </Link>
                );
            })}
        </>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#1e1e1e] flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#252526] border-r border-gray-200 dark:border-gray-700 fixed h-full z-10 hidden md:block">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/" className="text-xl font-serif font-bold text-sawatsya-wood dark:text-gray-100">
                        SAWATSYA
                    </Link>
                </div>

                <nav className="p-4 space-y-1">
                    <NavLinks />
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-50">
                <Link to="/" className="text-xl font-serif font-bold text-sawatsya-wood dark:text-gray-100">
                    SAWATSYA
                </Link>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="dark:text-gray-200">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-[#252526]">
                        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xl font-serif font-bold text-sawatsya-wood dark:text-gray-100">
                                SAWATSYA
                            </span>
                        </div>
                        <nav className="p-4 space-y-1">
                            <NavLinks onClick={() => setMobileMenuOpen(false)} />
                        </nav>
                        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => {
                                    logout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
