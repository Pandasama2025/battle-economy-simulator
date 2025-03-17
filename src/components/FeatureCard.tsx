
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <Card className={cn("hover-scale h-full", className)}>
      <CardContent className="flex flex-col p-6 space-y-2">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
