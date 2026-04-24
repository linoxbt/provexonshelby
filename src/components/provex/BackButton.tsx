import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const BackButton = ({ fallback = "/" }: { fallback?: string }) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (window.history.length > 1) navigate(-1);
        else navigate(fallback);
      }}
      className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4 mr-1" /> Back
    </Button>
  );
};
