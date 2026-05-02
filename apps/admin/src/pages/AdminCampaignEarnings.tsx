import { toast } from "sonner";
import { Button } from "@digihire/shared";
import { Badge } from "@digihire/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@digihire/shared";
import {
  useAdminPendingSubmissions,
  useApproveSubmission,
  useRejectSubmission,
  useAdminPendingEarnings,
  useApproveEarning,
  useRejectEarning,
} from "@/hooks/useAdminCampaigns";
import { formatNaira } from "@digihire/shared";

export default function AdminCampaignEarnings() {
  const { data: submissions = [], isLoading: subLoading } =
    useAdminPendingSubmissions();
  const approveSubmission = useApproveSubmission();
  const rejectSubmission = useRejectSubmission();

  const { data: earnings = [], isLoading: earnLoading } =
    useAdminPendingEarnings();
  const approveEarning = useApproveEarning();
  const rejectEarning = useRejectEarning();

  function handleApproveSubmission(s: (typeof submissions)[number]) {
    approveSubmission.mutate(
      {
        submissionId: s.id,
        campaignId: s.campaign_id,
        sellerId: s.seller.id,
        commissionType: s.campaign.commission_type,
        commissionValue: s.campaign.commission_value,
        saleAmount: s.amount,
      },
      {
        onSuccess: () =>
          toast.success(
            `Submission approved. Earning created for ${s.seller.name}.`
          ),
        onError: () => toast.error("Approval failed."),
      }
    );
  }

  function handleApproveEarning(e: (typeof earnings)[number]) {
    approveEarning.mutate(
      {
        earningId: e.id,
        sellerUserId: e.seller.user_id,
        amount: e.amount,
        campaignTitle: e.campaign.title,
      },
      {
        onSuccess: () =>
          toast.success(
            `${formatNaira(e.amount)} paid out to ${e.seller.name}.`
          ),
        onError: () => toast.error("Payout failed."),
      }
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* SECTION 1: Submission Review */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Submission Review</h1>
          <p className="text-muted-foreground mt-1">
            Review seller-submitted sales. Approving creates a pending earning.
          </p>
        </div>

        {subLoading ? (
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
        ) : submissions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No pending submissions.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{s.seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.seller.email}
                    </p>
                  </TableCell>
                  <TableCell>{s.campaign.title}</TableCell>
                  <TableCell>{formatNaira(s.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {s.submission_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.evidence_url ? (
                      <a
                        href={s.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline text-blue-500"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                    {s.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveSubmission(s)}
                        disabled={approveSubmission.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          rejectSubmission.mutate(s.id, {
                            onSuccess: () =>
                              toast.success("Submission rejected."),
                            onError: () => toast.error("Rejection failed."),
                          })
                        }
                        disabled={rejectSubmission.isPending}
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

      {/* SECTION 2: Earnings Approval */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Earnings Approval</h2>
          <p className="text-muted-foreground mt-1">
            Approve pending earnings to credit seller wallets.
          </p>
        </div>

        {earnLoading ? (
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
        ) : earnings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No pending earnings.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="font-medium">{e.seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.seller.email}
                    </p>
                  </TableCell>
                  <TableCell>{e.campaign.title}</TableCell>
                  <TableCell className="font-semibold">
                    {formatNaira(e.amount)}
                  </TableCell>
                  <TableCell>
                    {e.submission?.evidence_url ? (
                      <a
                        href={e.submission.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline text-blue-500"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                    {e.submission?.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {e.submission.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveEarning(e)}
                        disabled={approveEarning.isPending}
                      >
                        Approve & Pay
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          rejectEarning.mutate(e.id, {
                            onSuccess: () =>
                              toast.success("Earning rejected."),
                            onError: () => toast.error("Rejection failed."),
                          })
                        }
                        disabled={rejectEarning.isPending}
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
    </div>
  );
}


