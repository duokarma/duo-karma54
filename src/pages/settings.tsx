import { Moon, Sun, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/shared/avatar";
import { useTheme } from "@/hooks/use-theme";
import { team } from "@/data/misc";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifs, setNotifs] = useState({ email: true, push: false, weekly: true, mentions: true });

  return (
    <div>
      <PageHeader title="Settings" description="Manage your workspace, appearance, and preferences" />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This information is for display purposes in this template only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar seed="Admin User" size="lg" />
                <Button variant="secondary" size="sm">
                  Change avatar
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Full name</label>
                  <Input defaultValue="Admin User" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Role</label>
                  <Input defaultValue="Workspace Owner" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Email</label>
                  <Input defaultValue="admin@duokarrma.com" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Phone</label>
                  <Input defaultValue="+1 (415) 555-0100" />
                </div>
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose how DuoKarrma looks across your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => theme !== "dark" && toggleTheme()}
                  className={cn(
                    "rounded-[var(--radius-card)] border p-4 text-left transition-colors",
                    theme === "dark" ? "border-electric/50 bg-electric/5" : "border-edge hover:bg-white/[0.03]"
                  )}
                >
                  <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-void">
                    <Moon className="h-6 w-6 text-ink-dim" />
                  </div>
                  <p className="text-sm font-medium text-ink">Dark Mode</p>
                  <p className="text-xs text-ink-faint">Deep black, graphite, electric accents</p>
                </button>
                <button
                  onClick={() => theme !== "light" && toggleTheme()}
                  className={cn(
                    "rounded-[var(--radius-card)] border p-4 text-left transition-colors",
                    theme === "light" ? "border-electric/50 bg-electric/5" : "border-edge hover:bg-white/[0.03]"
                  )}
                >
                  <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-pearl">
                    <Sun className="h-6 w-6 text-ink-dark-dim" />
                  </div>
                  <p className="text-sm font-medium text-ink">Light Mode</p>
                  <p className="text-xs text-ink-faint">Pearl, mist, refined contrast</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control what you're notified about and how.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { key: "email" as const, label: "Email notifications", desc: "Invoice updates, payment receipts" },
                { key: "push" as const, label: "Push notifications", desc: "Real-time alerts on this device" },
                { key: "weekly" as const, label: "Weekly digest", desc: "A summary every Monday morning" },
                { key: "mentions" as const, label: "Mentions & comments", desc: "When someone tags you" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between border-b border-edge/60 py-3.5 last:border-0">
                  <div>
                    <p className="text-sm text-ink">{item.label}</p>
                    <p className="text-xs text-ink-faint">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifs[item.key]}
                    onCheckedChange={(checked) => setNotifs((prev) => ({ ...prev, [item.key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>{team.length} people in your workspace</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Invite
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {team.map((member) => (
                <div key={member.id} className="flex items-center gap-3 border-b border-edge/60 py-3 last:border-0">
                  <Avatar seed={member.avatarSeed} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{member.name}</p>
                    <p className="text-xs text-ink-faint">{member.email}</p>
                  </div>
                  <span className="text-xs text-ink-faint">{member.role}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Subscription and payment details for your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-edge bg-gradient-to-r from-electric/10 to-violet/10 p-4">
                <div>
                  <p className="text-sm font-medium text-ink">Premium Plan</p>
                  <p className="text-xs text-ink-faint">$249/month · renews Jul 15, 2026</p>
                </div>
                <Button variant="secondary" size="sm">
                  Manage plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
