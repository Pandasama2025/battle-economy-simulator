
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Info, History, Moon, Sun, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GlassPanel } from "./ui/glass-panel";
import { cn } from "@/lib/utils";

interface MainNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowIntro: (show: boolean) => void;
  showIntro: boolean;
}

export function MainNav({ activeTab, setActiveTab, setShowIntro, showIntro }: MainNavProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(true);

  // Handle window resize for responsive title
  useEffect(() => {
    const handleResize = () => {
      setShowFullTitle(window.innerWidth > 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[56px] animate-pulse rounded-md bg-muted/50"></div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 mb-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className={cn(
          "scroll-m-20 font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
          showFullTitle ? "text-3xl lg:text-4xl" : "text-2xl truncate"
        )}>
          {showFullTitle ? "自走棋设计工具" : "设计工具"}
        </h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-secondary/80">
                {theme === "light" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : theme === "dark" ? (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Monitor className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">切换主题</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-in">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>亮色模式</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>暗色模式</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>系统设置</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <GlassPanel intensity="low" className="p-1 animate-in">
        <Breadcrumb className="p-1 rounded-lg">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/" 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>主页</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>自走棋设计工具</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbItem className="ml-auto">
              <Button 
                variant={showIntro ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setShowIntro(!showIntro)} 
                className="flex items-center gap-1 h-7 text-xs"
              >
                <Info className="w-3 h-3" />
                <span>工具介绍</span>
              </Button>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Button 
                variant={activeTab === 'updates' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setActiveTab('updates')} 
                className="flex items-center gap-1 h-7 text-xs"
              >
                <History className="w-3 h-3" />
                <span>更新日志</span>
              </Button>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </GlassPanel>
    </div>
  );
}
