import { useAdminLeaderboard } from "@/hooks/useAdminData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export default function AdminLeaderboard() {
  const { data: leaderboard, isLoading } = useAdminLeaderboard();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Current ambassador standings</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Total Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard?.map((entry: any) => (
                <TableRow key={entry.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {entry.rank <= 3 ? (
                        <Trophy className={`h-4 w-4 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-orange-400"}`} />
                      ) : null}
                      <span className="font-medium">#{entry.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.university}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{entry.total_sales}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">₦{Number(entry.total_earnings || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No leaderboard data yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
