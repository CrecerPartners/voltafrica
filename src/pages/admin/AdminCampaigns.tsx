import { useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAdminCampaigns,
  useUpdateCampaign,
  type Campaign,
} from "@/hooks/useAdminCampaigns";
import AdminCampaignForm from "./AdminCampaignForm";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "secondary",
  active: "default",
  paused: "outline",
  ended: "destructive",
};

export default function AdminCampaigns() {
  const { data: campaigns = [], isLoading } = useAdminCampaigns();
  const update = useUpdateCampaign();
  const [formOpen, setFormOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | undefined>();

  function changeStatus(id: string, status: string) {
    update.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Campaign ${status}.`),
        onError: () => toast.error("Status update failed."),
      }
    );
  }

  function openCreate() {
    setEditCampaign(undefined);
    setFormOpen(true);
  }

  function openEdit(c: Campaign) {
    setEditCampaign(c);
    setFormOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No campaigns yet. Create one to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Join Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.brand_name}</TableCell>
                <TableCell>
                  {c.commission_type === "percentage"
                    ? `${c.commission_value}%`
                    : `₦${c.commission_value}`}{" "}
                  / {c.commission_per}
                </TableCell>
                <TableCell className="capitalize">{c.join_type}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status]}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}>
                        Edit
                      </DropdownMenuItem>
                      {c.status === "draft" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "active")}
                        >
                          Publish
                        </DropdownMenuItem>
                      )}
                      {c.status === "active" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "paused")}
                        >
                          Pause
                        </DropdownMenuItem>
                      )}
                      {c.status === "paused" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "active")}
                        >
                          Resume
                        </DropdownMenuItem>
                      )}
                      {c.status !== "ended" && (
                        <DropdownMenuItem
                          onClick={() => changeStatus(c.id, "ended")}
                        >
                          End Campaign
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AdminCampaignForm
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editCampaign}
      />
    </div>
  );
}
