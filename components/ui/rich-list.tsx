import parse, { domToReact } from "html-react-parser";
import { CheckCircle2 } from "lucide-react";

export function RichList({ html }: { html: string }) {
  return parse(html, {
    replace: (domNode: any) => {
      if (domNode.name === "li") {
        return (
          <li className="flex">
            {/* Icon */}
            <span className="flex-shrink-0 mt-0.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
            </span>

            {/* Text */}
            <span className="ml-2 break-words">
              {domToReact(domNode.children)}
            </span>
          </li>
        );
      }
    },
  });
}
