import { useDashboard } from '../contexts/DashboardContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { RefreshCw, Database } from 'lucide-react';
import { useState } from 'react';

export function RepositoryFilter() {
  const {
    repositories,
    selectedRepository,
    setSelectedRepository,
    isGithubConnected,
    triggerDataCollection,
  } = useDashboard();

  const [isCollecting, setIsCollecting] = useState(false);

  const handleCollectData = async () => {
    setIsCollecting(true);
    try {
      await triggerDataCollection();
    } catch (error) {
      console.error('Error collecting data:', error);
    } finally {
      setIsCollecting(false);
    }
  };

  if (!isGithubConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database className="h-4 w-4" />
        <span>GitHub não conectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedRepository || 'all'}
        onValueChange={(value) =>
          setSelectedRepository(value === 'all' ? null : value)
        }
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="All repositories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>All repositories</span>
            </div>
          </SelectItem>
          {repositories.map((repo) => (
            <SelectItem key={repo.id} value={repo.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{repo.name}</span>
                <span className="text-xs text-muted-foreground">
                  {repo.fullName}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCollectData}
        disabled={isCollecting}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isCollecting ? 'animate-spin' : ''}`} />
        {isCollecting ? 'Collecting...' : 'Refresh Data'}
      </Button>
    </div>
  );
}
