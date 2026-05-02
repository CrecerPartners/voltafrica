import { toast } from "sonner";
import { Button } from "@digihire/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@digihire/shared";
import {
  useAdminPendingMemberships,
  useApproveMembership,
  useRejectMembership,
} from "@/hooks/useAdminCampaigns";

export default function AdminCampaignMemberships() {
  const { data: memberships = [], isLoading } = useAdminPendingMemberships();
  const approve = useApproveMembership();
  const reject = useRejectMembership();

  function handleApprove(m: (typeof memberships)[number]) {
    approve.mutate(
      {
        membershipId: m.id,
        sellerId: m.seller.id,
        trackingLinkBase: m.campaign.tracking_link_base,
      },
      {
        onSuccess: () => toast.success(`${m.seller.name} approved.`),
        onError: () => toast.error("Approval failed."),
      }
    );
  }

  function handleReject(membershipId: string) {
    reject.mutate(
      { membershipId },
      {
        onSuccess: () => toast.success("Request rejected."),
        onError: () => toast.error("Rejection failed."),
      }
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Membership Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Pending join requests for approval-required campaigns.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      ) : memberships.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No pending membership requests.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <p className="font-medium">{m.seller.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.seller.email}
                  </p>
                </TableCell>
                <TableCell>{m.campaign.title}</TableCell>
                <TableCell>
                  {new Date(m.joined_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(m)}
                      disabled={approve.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(m.id)}
                      disabled={reject.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}


