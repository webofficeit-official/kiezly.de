 import * as Icons from "lucide-react";

 export function getIcon(name: string): React.ElementType {
  return (Icons[name] as React.ElementType) || Icons.FileText;
}