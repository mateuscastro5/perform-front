import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";
import { Badge } from "@/ui/components/ui/badge";
import { Label } from "@/ui/components/ui/label";
import { Input } from "@/ui/components/ui/input";
import { Checkbox } from "@/ui/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select";
import { Github, Check, X, RefreshCw, AlertCircle, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/ui/components/ui/alert";
import { githubService } from "@/ui/services/github.service";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description?: string;
}

export const GitHubIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [dataRange, setDataRange] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const response = await githubService.getStatus();
      setIsConnected(response.connected);
      setGithubUsername(response.githubUsername || "");
      
      if (response.connected) {
        const allRepos = await githubService.listRepositories();
        setRepositories(allRepos);
        setSelectedRepos(response.selectedRepos || []);
        setDataRange(response.dataRange?.toString() || "1");
      }
    } catch (error) {
      console.error("Error checking GitHub connection:", error);
      setIsConnected(false);
    }
  };

  const handleConnectGitHub = async () => {
    setIsLoading(true);
    setConnectionError("");
    
    try {
      if (!githubToken.trim()) {
        setConnectionError("Please enter your Personal Access Token");
        setIsLoading(false);
        return;
      }

      if (!githubToken.startsWith("ghp_") && !githubToken.startsWith("github_pat_")) {
        setConnectionError("Invalid token. Token must start with 'ghp_' or 'github_pat_'");
        setIsLoading(false);
        return;
      }

      const response = await githubService.connectWithToken(githubToken);
      
      setIsConnected(true);
      setGithubUsername(response.username);
      setGithubToken("");
      
      const repos = await githubService.listRepositories();
      setRepositories(repos);
      
    } catch (error: unknown) {
      console.error("Error connecting to GitHub:", error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : undefined;
      setConnectionError(errorMessage || "Error connecting to GitHub. Check if the token is valid and has the necessary permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    setIsLoading(true);
    try {
      await githubService.disconnect();
      
      setIsConnected(false);
      setRepositories([]);
      setSelectedRepos([]);
      setGithubUsername("");
      setGithubToken("");
      setConnectionError("");
    } catch (error) {
      console.error("Error disconnecting GitHub:", error);
      setConnectionError("Error disconnecting from GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRepo = (repoId: number) => {
    setSelectedRepos(prev => 
      prev.includes(repoId) 
        ? prev.filter(id => id !== repoId)
        : [...prev, repoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRepos.length === repositories.length) {
      setSelectedRepos([]);
    } else {
      setSelectedRepos(repositories.map(r => r.id));
    }
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setConnectionError("");
    
    try {
      await githubService.saveConfiguration({
        repositories: selectedRepos,
        dataRange: parseInt(dataRange)
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving configuration:", error);
      setConnectionError("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getDataRangeLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      "1": "Last month",
      "3": "Last 3 months", 
      "6": "Last 6 months",
      "12": "Last year"
    };
    return labels[value] || "Last month";
  };

  const filteredRepositories = repositories.filter((repo: Repository) =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const selectedRepositories = filteredRepositories.filter((repo: Repository) => selectedRepos.includes(repo.id));
  const unselectedRepositories = filteredRepositories.filter((repo: Repository) => !selectedRepos.includes(repo.id));

  return (
    <div className="space-y-6">
      {/* GitHub Connection Card */}
      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Integration
              </CardTitle>
              <CardDescription className="mt-2">
                Connect your GitHub account to monitor repositories and collect development metrics
              </CardDescription>
            </div>
            {isConnected && (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To connect your desktop application, you need to create a <strong>Personal Access Token (PAT)</strong> on GitHub.
                  This token will allow Perform to access your repositories and collect data on commits, pull requests, and code reviews.
                </AlertDescription>
              </Alert>

              {/* Instructions Card */}
              <Card className="bg-muted/30 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">How to create your Personal Access Token</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Access GitHub settings</li>
                    <li>Go to <span className="text-foreground font-mono text-xs">Developer settings → Personal access tokens → Tokens (classic)</span></li>
                    <li>Click on <span className="text-foreground font-medium">Generate new token (classic)</span></li>
                    <li>Select the permissions: <span className="text-foreground font-mono text-xs">repo</span>, <span className="text-foreground font-mono text-xs">read:user</span>, <span className="text-foreground font-mono text-xs">admin:repo_hook</span></li>
                    <li>Copy the generated token (you won't be able to see it again)</li>
                  </ol>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 w-full mt-3"
                    onClick={() => window.open('https://github.com/settings/tokens/new', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Create Token on GitHub
                  </Button>
                </CardContent>
              </Card>

              {/* Token Input */}
              <div className="space-y-2">
                <Label htmlFor="github-token">Personal Access Token</Label>
                <div className="relative">
                  <Input
                    id="github-token"
                    type={showToken ? "text" : "password"}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The token must start with <span className="font-mono">ghp_</span> or <span className="font-mono">github_pat_</span>
                </p>
              </div>

              {connectionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleConnectGitHub} 
                disabled={isLoading || !githubToken.trim()}
                className="gap-2 w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4" />
                    Connect to GitHub
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Github className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {githubUsername ? `@${githubUsername}` : "Connected Account"}
                    </p>
                    <p className="text-xs text-muted-foreground">Repository access authorized</p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDisconnectGitHub}
                  className="gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </div>

              {connectionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              {saveSuccess && (
                <Alert className="border-success bg-success/10">
                  <Check className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Settings saved successfully!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repository Selection Card */}
      {isConnected && (
        <>
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Select Repositories</CardTitle>
              <CardDescription>
                Choose which repositories will be monitored by Perform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <Label className="text-sm font-semibold">
                  {selectedRepos.length} of {repositories.length} selected
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAll}
                >
                  {selectedRepos.length === repositories.length ? "Deselect all" : "Select all"}
                </Button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {/* Selected Repositories Section */}
                {selectedRepositories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">
                      Selected ({selectedRepositories.length})
                    </Label>
                    {selectedRepositories.map((repo: Repository) => (
                      <div 
                        key={repo.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
                      >
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => handleToggleRepo(repo.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {repo.fullName}
                            </p>
                            {repo.private && (
                              <Badge variant="secondary" className="text-[10px] h-5">
                                Private
                              </Badge>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {repo.description}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a 
                            href={`https://github.com/${repo.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Unselected Repositories Section */}
                {unselectedRepositories.length > 0 && (
                  <div className="space-y-2">
                    {selectedRepositories.length > 0 && (
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mt-4 block">
                        Available ({unselectedRepositories.length})
                      </Label>
                    )}
                    {unselectedRepositories.map((repo: Repository) => (
                      <div 
                        key={repo.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleToggleRepo(repo.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {repo.fullName}
                            </p>
                            {repo.private && (
                              <Badge variant="secondary" className="text-[10px] h-5">
                                Private
                              </Badge>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {repo.description}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a 
                            href={`https://github.com/${repo.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {filteredRepositories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {searchQuery ? `No repositories found matching "${searchQuery}"` : "No repositories available"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Range Configuration Card */}
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data Collection Period</CardTitle>
              <CardDescription>
                Set how many months of history will be analyzed by the AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="data-range" className="text-sm font-semibold">
                  Analysis period
                </Label>
                <Select value={dataRange} onValueChange={setDataRange}>
                  <SelectTrigger id="data-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      {getDataRangeLabel("1")}
                    </SelectItem>
                    <SelectItem value="3">
                      {getDataRangeLabel("3")}
                    </SelectItem>
                    <SelectItem value="6">
                      {getDataRangeLabel("6")}
                    </SelectItem>
                    <SelectItem value="12">
                      {getDataRangeLabel("12")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Longer periods provide more accurate analysis, but will take longer to process initially.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button 
                  onClick={handleSaveConfiguration}
                  disabled={isSaving || selectedRepos.length === 0}
                  className="w-full gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
