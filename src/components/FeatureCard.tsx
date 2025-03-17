
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FeatureCard({ title, description, icon, className, onClick }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "h-full overflow-hidden border transition-colors hover:bg-card/80 hover:shadow-sm", 
          onClick ? "cursor-pointer" : "",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="flex flex-col p-6 space-y-2">
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
