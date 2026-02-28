import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { walletSummary, transactions as initialTransactions, formatNaira, Transaction } from "@/data/mockData";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, DollarSign, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { ManualSaleDialog } from "@/components/ManualSaleDialog";

const typeLabels: Record<string, string> = {
  commission: "Commission",
  referral_bonus: "Referral Bonus",
  signup_bonus: "Signup Bonus",
  performance_bonus: "Performance Bonus",
  payout: "Payout",
  manual_sale: "Manual Sale",
};

const WalletPage = () => {
  const [manualSaleOpen, setManualSaleOpen] = useState(false);
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);

  const allTransactions = [...manualTransactions, ...initialTransactions];

  const handleManualSale = (tx: Transaction) => {
    setManualTransactions((prev) => [tx, ...prev]);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Wallet & Earnings</h1>
          <p className="text-muted-foreground mt-1">Track your earnings and payouts</p>
        </div>
        <Button className="volt-gradient" onClick={() => setManualSaleOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Log a Sale
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/30 volt-glow">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <WalletIcon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Available Balance</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-display">{formatNaira(walletSummary.availableBalance)}</p>
            <Button size="sm" className="mt-3 volt-gradient w-full" onClick={() => toast.success("Payout requested!")}>
              Request Payout
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Pending Earnings</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-display">{formatNaira(walletSummary.pendingEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-3">Clears every Friday</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Total Earned (Lifetime)</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-display">{formatNaira(walletSummary.totalEarned)}</p>
            <p className="text-xs text-muted-foreground mt-3">{formatNaira(walletSummary.totalPaidOut)} paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="border-border/50">
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="all">
            <TabsList className="bg-secondary mb-4 overflow-x-auto w-full justify-start">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="commission">Commissions</TabsTrigger>
              <TabsTrigger value="manual_sale">Manual Sales</TabsTrigger>
              <TabsTrigger value="referral_bonus">Referral</TabsTrigger>
              <TabsTrigger value="payout">Payouts</TabsTrigger>
            </TabsList>

            {["all", "commission", "manual_sale", "referral_bonus", "payout"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-2">
                {allTransactions
                  .filter((t) => tab === "all" || t.type === tab)
                  .map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${t.amount > 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                          {t.amount > 0 ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.description}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground">{typeLabels[t.type]} · {t.date}</p>
                            {t.proofFileName && (
                              <Badge variant="outline" className="text-[10px] text-primary border-primary/20">📎 {t.proofFileName}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-destructive"}`}>
                          {t.amount > 0 ? "+" : "-"}{formatNaira(t.amount)}
                        </p>
                        <Badge variant="outline" className={`text-[10px] ${t.status === "paid" ? "text-success border-success/20" : "text-warning border-warning/20"}`}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <ManualSaleDialog open={manualSaleOpen} onOpenChange={setManualSaleOpen} onSubmit={handleManualSale} />
    </div>
  );
};

export default WalletPage;
