import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import logo from '@/assets/logo.png';

interface SidebarProps {
  className?: string;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-primary' },
  { path: '/workers', icon: Users, label: 'Workers', color: 'text-accent' },
  { path: '/payroll', icon: CreditCard, label: 'Payroll', color: 'text-success' },
  { path: '/reports', icon: FileText, label: 'Reports', color: 'text-warning' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'text-muted-foreground' },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen sidebar-gradient border-r border-sidebar-border/50 backdrop-blur-xl transition-all duration-300 ease-out',
        collapsed ? 'w-20' : 'w-72',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg overflow-hidden">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">
                Kalvayal
              </h1>
              <p className="text-xs text-sidebar-foreground/50 font-medium">Samugaseevaka Sangam</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto custom-scrollbar">
          <p className={cn(
            "text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold mb-3 px-3",
            collapsed && "hidden"
          )}>
            Main Menu
          </p>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary-foreground/20"
                    : "bg-sidebar-accent group-hover:bg-sidebar-foreground/10"
                )}>
                  <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : item.color)} />
                </div>
                {!collapsed && (
                  <span className="animate-fade-in font-medium">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <Sparkles className="h-3 w-3 ml-auto text-sidebar-primary-foreground/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          {!collapsed && user && (
            <div className="p-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start h-8 text-xs bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border border-red-200/20"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 mr-2" />
                Sign Out
              </Button>
            </div>
          )}

          {collapsed && user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-500/10"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 mr-2" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </Button>

          {/* Developer Credit */}
          {!collapsed && (
            <div className="pt-2 text-center">
              <p className="text-[10px] text-sidebar-foreground/30 uppercase tracking-widest font-semibold hover:text-primary/50 transition-colors cursor-default">
                Developed by NES
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
