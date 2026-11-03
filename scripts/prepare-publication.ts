/** Validate only by default; --stage explicitly stages the reviewed content paths. Never push. */
import { execFileSync } from 'node:child_process';
const run = (command: string, args: string[]) => execFileSync(command, args, { stdio: 'inherit' });
run('npm', ['run', 'content:validate']);
run('npm', ['run', 'check']);
run('npm', ['test']);
run('npm', ['run', 'test:studio']);
run('npm', ['run', 'test:e2e', '--', '--retries=0']);
run('git', ['status', '--short']);
run('git', ['diff', '--stat']);
if (process.argv.includes('--stage')) {
  run('git', ['add', '--', 'src/content/studio.generated.json', 'publication-approved.json']);
  // The approved manifest gate already verified every asset, including new uploads.
  run('git', ['add', '--', 'public']);
  run('python3', ['scripts/audit-staged.py']);
  run('git', ['diff', '--cached', '--check']);
  run('git', ['diff', '--cached', '--stat']);
}
console.log('Validation complete. Review the exact diff and media before your publication decision.');
console.log('To commit reviewed staged files: git commit -m "content: update approved portfolio content"');
console.log('No commit or push was performed. Use a branch and PR; never push unreviewed content.');
