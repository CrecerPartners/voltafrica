import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { leaderboardCampus, leaderboardNational, tiers, currentUser, formatNaira, dashboardStats } from "@/data/mockData";
import { Trophy, Medal, Crown } from "lucide-react";

const rankIcons = [Crown, Medal, Trophy];

const Leaderboard = () => {
  const currentTier = tiers.filter((t) => dashboardStats.totalEarnings >= t.minEarnings).pop()!;
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier
    ? ((dashboardStats.totalEarnings - currentTier.minEarnings) / (nextTier.minEarnings - currentTier.minEarnings)) * 100
    : 100;

  const renderBoard = (entries: typeof leaderboardCampus) => (
    <div className="space-y-2">
      {entries.map((entry) => {
        const RankIcon = entry.rank <= 3 ? rankIcons[entry.rank - 1] : null;
        return (
          <div
            key={entry.rank + entry.name}
            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${entry.isCurrentUser ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 text-center">
                {RankIcon ? (
                  <RankIcon className={`h-5 w-5 mx-auto ${entry.rank === 1 ? "text-warning" : entry.rank === 2 ? "text-muted-foreground" : "text-warning/60"}`} />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {entry.name} {entry.isCurrentUser && <span className="text-primary">(You)</span>}
                </p>
                <p className="text-xs text-muted-foreground">{entry.university}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{formatNaira(entry.earnings)}</p>
              <p className="text-xs text-muted-foreground">{entry.sales} sales</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">See how you rank among fellow agents</p>
      </div>

      {/* Tier Progress */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Tier</p>
              <p className="text-base sm:text-lg font-bold font-display" style={{ color: currentTier.color }}>{currentTier.name}</p>
            </div>
            {nextTier && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Next Tier</p>
                <p className="text-base sm:text-lg font-bold font-display" style={{ color: nextTier.color }}>{nextTier.name}</p>
              </div>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          {nextTier && (
            <p className="text-xs text-muted-foreground text-center">
              {formatNaira(nextTier.minEarnings - dashboardStats.totalEarnings)} more to reach {nextTier.name}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rankings */}
      <Card className="border-border/50">
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="campus">
            <TabsList className="bg-secondary mb-4">
              <TabsTrigger value="campus">Campus</TabsTrigger>
              <TabsTrigger value="national">National</TabsTrigger>
            </TabsList>
            <TabsContent value="campus">{renderBoard(leaderboardCampus)}</TabsContent>
            <TabsContent value="national">{renderBoard(leaderboardNational)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
