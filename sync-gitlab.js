import { execSync } from 'child_process';

const args = process.argv.slice(2);
const branch = args[0] || 'main';

try {
  console.log(`Syncing branch: ${branch}`);
  console.log(`Running: git pull origin ${branch}`);
  execSync(`git pull origin ${branch}`, { stdio: 'inherit' });
  
  console.log(`Running: git push gitlab ${branch}`);
  execSync(`git push gitlab ${branch}`, { stdio: 'inherit' });
  
  console.log('Sync complete.');
} catch (error) {
  console.error('Sync failed.');
  process.exit(1);
}
