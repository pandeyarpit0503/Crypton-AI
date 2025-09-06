import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Menu, X, TrendingUp } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        {/* Main navbar */}
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <TrendingUp className="h-6 w-6 text-crypto-green" />
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              Crypton AI
            </span>
          </NavLink>

          {/* Desktop Navigation - Hidden on mobile and small tablets */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/market"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Market
              </NavLink>
              <NavLink
                to="/trending"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Trending
              </NavLink>

              <NavLink
                to="/cryptonews"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Crypto News
              </NavLink>
              <NavLink
                to="/ai-chat"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                AI Chat
              </NavLink>
              <NavLink
                to="/portfolio"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Portfolio
              </NavLink>
              <NavLink
                to="/watchlist"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Watchlist
              </NavLink>
              <NavLink
                to="/simulator"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Simulator
              </NavLink>

            </nav>
          )}

          {/* Right side - Desktop */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Mobile menu button - Show on mobile and tablets */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2"
                  onClick={toggleMobileMenu}
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 bg-crypto-green/20 border border-crypto-green/30">
                        <AvatarFallback className="text-crypto-green font-medium text-xs">
                          {getInitials(user.email || '')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-foreground">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <NavLink to="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <div className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <NavLink to="/login">Sign In</NavLink>
                </Button>
                <Button asChild size="sm" className="bg-crypto-green hover:bg-crypto-green/90">
                  <NavLink to="/signup">Sign Up</NavLink>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu - Show on mobile and tablets */}
        {user && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2 px-2 py-4">
              <NavLink
                to="/"
                end
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/market"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Market
              </NavLink>
              <NavLink
                to="/trending"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Trending
              </NavLink>

              <NavLink
                to="/cryptonews"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Crypto News
              </NavLink>
              <NavLink
                to="/ai-chat"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                AI Chat
              </NavLink>
              <NavLink
                to="/portfolio"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Portfolio
              </NavLink>
              <NavLink
                to="/watchlist"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Watchlist
              </NavLink>
              <NavLink
                to="/simulator"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                Simulator
              </NavLink>


              {/* Mobile auth buttons for non-logged in users */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
                  <Button variant="ghost" asChild className="justify-start">
                    <NavLink to="/login" onClick={closeMobileMenu}>Sign In</NavLink>
                  </Button>
                  <Button asChild className="bg-crypto-green hover:bg-crypto-green/90 justify-start">
                    <NavLink to="/signup" onClick={closeMobileMenu}>Sign Up</NavLink>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}




