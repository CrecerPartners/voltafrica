import { Button } from "@digihire/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function AdminTablePagination({ page, totalPages, onPageChange, totalItems, pageSize }: Props) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <p className="text-xs text-muted-foreground">
        {start}â€“{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <Button key={p} variant={p === page ? "default" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => onPageChange(p)}>
              {p}
            </Button>
          );
        })}
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function usePagination<T>(items: T[] | undefined, pageSize = 20) {
  const total = items?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { totalPages, pageSize, total };
}

export function paginateItems<T>(items: T[] | undefined, page: number, pageSize = 20): T[] {
  if (!items) return [];
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

