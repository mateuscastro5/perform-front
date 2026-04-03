import { useState } from "react";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { GitHubIntegration } from "@/ui/components/settings/GitHubIntegration";
import { User, Bell, Plug } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_85%_8%,hsl(var(--primary)/0.1),transparent_36%),radial-gradient(circle_at_45%_84%,hsl(var(--secondary)/0.12),transparent_42%)]" />
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pl-[316px] pr-6 md:pr-10 pt-[122px] pb-10 relative z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your preferences and integrations
          </p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Under development...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <GitHubIntegration />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Under development...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
