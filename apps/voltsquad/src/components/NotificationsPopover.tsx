import { Bell, ShoppingCart, Users, Banknote, Zap, Check } from "lucide-react";
import { Button } from "@digihire/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@digihire/shared";
import { ScrollArea } from "@digihire/shared";
import { useNotifications } from "@digihire/shared";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, typeof Bell> = {
  sale: ShoppingCart,
  referral: Users,
  payout: Banknote,
  transaction: Zap,
  info: Bell,
};

export function NotificationsPopover() {
  const { data: notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border-2 border-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllAsRead.mutate()}
            >
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {!notifications?.length ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = typeIcons[n.type] || Bell;
                return (
                  <button
                    key={n.id}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                    onClick={() => !n.read && markAsRead.mutate(n.id)}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? "bg-primary/15" : "bg-muted"}`}>
                      <Icon className={`h-3.5 w-3.5 ${!n.read ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}


