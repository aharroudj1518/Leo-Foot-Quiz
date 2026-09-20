import {it,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
it('runs the validation build hook in plain Node without relying on bundler module resolution',()=>{
 const result=spawnSync(process.execPath,['scripts/check-release.mjs','--if-production'],{cwd:fileURLToPath(new URL('..',import.meta.url)),env:{...process.env,EAS_BUILD_PROFILE:'validation'},encoding:'utf8'});
 expect(result.error).toBeUndefined();
 expect(result.status,result.stderr).toBe(0);
 expect(result.stdout).toContain('development/validation build; independent review still required for production');
});
