// A store build runs only from a clean tree at the tag v<expo.version>.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const version = JSON.parse(readFileSync('app.json', 'utf8')).expo.version;
const sh = (command) => execSync(command, { encoding: 'utf8' }).trim();
if (sh('git status --porcelain') || !sh('git tag --points-at HEAD').split('\n').includes(`v${version}`)) {
  console.error(`Release only from a clean tree at tag v${version}.`);
  process.exit(1);
}
