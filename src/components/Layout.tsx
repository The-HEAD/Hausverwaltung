import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Building, User, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Immobilien",
      path: "/properties",
      icon: <Building className="h-5 w-5" />
    },
    {
      title: "Wohnungen",
      path: "/apartments",
      icon: <Home className="h-5 w-5" />
    },
    {
      title: "Mieter",
      path: "/tenants",
      icon: <User className="h-5 w-5" />
    },
    {
      title: "Verträge",
      path: "/contracts",
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar / Navigation */}
      <aside className="flex flex-col bg-slate-800 text-white md:w-64">
        {/* Logo/Header */}
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold">HausVerwaltung</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-lg p-3 transition-colors hover:bg-slate-700",
                    isActive(item.path) ? "bg-slate-700 font-semibold" : ""
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 text-center text-sm">
          <p>© 2025 HausVerwaltung</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow bg-slate-100 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
