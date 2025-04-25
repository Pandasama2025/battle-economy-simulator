
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "gradient";
  badge?: string;
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  className, 
  onClick,
  variant = "default",
  badge
}: FeatureCardProps) {
  const getVariantClass = () => {
    switch (variant) {
      case "outline":
        return "bg-transparent border-2 hover:bg-card/5";
      case "gradient":
        return "bg-gradient-to-br from-card to-secondary/50 border-0";
      default:
        return "bg-card hover:bg-card/80 border";
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "h-full overflow-hidden rounded-xl transition-all hover:shadow-md", 
          getVariantClass(),
          onClick ? "cursor-pointer" : "",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="flex flex-col p-5 space-y-2 relative">
          {badge && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-bl-lg">
              {badge}
            </div>
          )}
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            {icon}
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
