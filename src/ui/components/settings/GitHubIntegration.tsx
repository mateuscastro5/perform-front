import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";
import { Badge } from "@/ui/components/ui/badge";
import { Label } from "@/ui/components/ui/label";
import { Checkbox } from "@/ui/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select";
import { Github, Check, X, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/ui/components/ui/alert";

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
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [dataRange, setDataRange] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const mockRepositories: Repository[] = [
    { id: 1, name: "perform-front", fullName: "company/perform-front", private: false, description: "Frontend application" },
    { id: 2, name: "perform-api", fullName: "company/perform-api", private: false, description: "Backend API" },
    { id: 3, name: "ai-squad-glow", fullName: "company/ai-squad-glow", private: true, description: "AI Dashboard" },
    { id: 4, name: "mobile-app", fullName: "company/mobile-app", private: false, description: "Mobile application" },
  ];

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    try {
      // TODO: Chamar API para verificar se está conectado
      // const response = await api.get('/github/status');
      // setIsConnected(response.data.connected);
      // if (response.data.connected) {
      //   setRepositories(response.data.repositories);
      //   setSelectedRepos(response.data.selectedRepos);
      //   setDataRange(response.data.dataRange);
      // }
    } catch (error) {
      console.error("Error checking GitHub connection:", error);
    }
  };

  const handleConnectGitHub = async () => {
    setIsLoading(true);
    try {
      // TODO: Iniciar fluxo OAuth do GitHub
      // const response = await api.get('/github/oauth-url');
      // window.location.href = response.data.url;
      
      // Mock: simular conexão após 1 segundo
      setTimeout(() => {
        setIsConnected(true);
        setRepositories(mockRepositories);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
      setIsLoading(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      // TODO: Chamar API para desconectar
      // await api.delete('/github/disconnect');
      
      setIsConnected(false);
      setRepositories([]);
      setSelectedRepos([]);
    } catch (error) {
      console.error("Error disconnecting GitHub:", error);
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
    
    try {
      // TODO: Chamar API para salvar configurações
      // await api.post('/github/configure', {
      //   repositories: selectedRepos,
      //   dataRange: parseInt(dataRange)
      // });
      
      // Mock: simular salvamento
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 1000);
    } catch (error) {
      console.error("Error saving configuration:", error);
      setIsSaving(false);
    }
  };

  const getDataRangeLabel = (months: string) => {
    const labels: Record<string, string> = {
      "1": "1 mês (Processamento rápido)",
      "3": "3 meses (Balanceado)",
      "6": "6 meses (Análise detalhada)",
      "12": "12 meses (Análise completa)",
    };
    return labels[months] || months;
  };

  return (
    <div className="space-y-6">
      {/* GitHub Connection Card */}
      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Integração com GitHub
              </CardTitle>
              <CardDescription className="mt-2">
                Conecte sua conta do GitHub para monitorar repositórios e coletar métricas de desenvolvimento
              </CardDescription>
            </div>
            {isConnected && (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" />
                Conectado
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
                  Ao conectar sua conta do GitHub, você permitirá que o Perform acesse seus repositórios e colete dados de commits, pull requests e revisões de código.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleConnectGitHub} 
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4" />
                    Conectar com GitHub
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
                    <p className="text-sm font-semibold text-foreground">Conta Conectada</p>
                    <p className="text-xs text-muted-foreground">Acesso aos repositórios autorizado</p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDisconnectGitHub}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Desconectar
                </Button>
              </div>

              {saveSuccess && (
                <Alert className="border-success bg-success/10">
                  <Check className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Configurações salvas com sucesso!
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
              <CardTitle>Selecionar Repositórios</CardTitle>
              <CardDescription>
                Escolha quais repositórios serão monitorados pelo Perform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <Label className="text-sm font-semibold">
                  {selectedRepos.length} de {repositories.length} selecionados
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAll}
                >
                  {selectedRepos.length === repositories.length ? "Desmarcar todos" : "Selecionar todos"}
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {repositories.map((repo) => (
                  <div 
                    key={repo.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      checked={selectedRepos.includes(repo.id)}
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
                            Privado
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
            </CardContent>
          </Card>

          {/* Data Range Configuration Card */}
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Período de Coleta de Dados</CardTitle>
              <CardDescription>
                Defina quantos meses de histórico serão analisados pela IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="data-range" className="text-sm font-semibold">
                  Período de análise
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
                  Períodos mais longos fornecem análises mais precisas, mas levarão mais tempo para processar inicialmente.
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
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Salvar Configurações
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
