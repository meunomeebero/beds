import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkConsumerPaths } from './check-consumer.mjs';
import { checkLibrary } from './check-library.mjs';
const withFixture = (body, run) => {
 const dir = mkdtempSync(path.join(tmpdir(), 'espaco-contract-'));
 try {
  for(const [name,source] of Object.entries(body)){const target=path.join(dir,name);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,source);}
  return run(dir);
 } finally { rmSync(dir,{recursive:true,force:true}); }
};
test('consumer guard accepts every declared public entry but rejects private token paths', () => {
 const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
 const imports = Object.keys(manifest.exports).map(entry => `import '${entry === '.' ? 'beds' : 'beds/' + entry.slice(2)}';`).join('\n');
 withFixture({
  'public.ts': imports,
  'private.ts': "import { geometry } from 'beds/src/tokens'; export { typography } from 'beds/dist/tokens.js';",
  'token-usage.tsx': "import { typography } from 'beds/tokens'; export const App=()=> <main style={{fontSize:typography.body.size}}>Owned composition</main>;",
 }, dir => {
  assert.deepEqual(checkConsumerPaths([path.join(dir, 'public.ts'), path.join(dir, 'token-usage.tsx')]).issues, []);
  assert.equal(checkConsumerPaths([path.join(dir, 'private.ts')]).issues.filter(issue => issue.code === 'PRIVATE_LIBRARY_IMPORT').length, 2);
 });
});
test('CSS motion guard permits disabling transitions but still rejects authored transitions',()=>withFixture({
 'src/index.ts':'export function Example(){return null;}',
 'src/tokens.css':'.es-root{--es-bg:#191919}',
 'src/example.css':'.off{transition:none!important}.also-off{transition: none;}.on{transition:color 150ms}.property{transition-property:color}'
},dir=>{
 const result=checkLibrary({root:dir,tokens:['src/tokens.css']});
 assert.equal(result.issues.filter(issue=>issue.code==='CSS_MOTION').length,2);
}));
test('rejects legacy package imports even without rendering a component',()=>withFixture({
 'App.tsx':"import {Text} from '@espaco/ui'; import '@espaco/ui/styles.css'; export {Text};"
},dir=>assert.equal(checkConsumerPaths([dir]).issues.filter(issue=>issue.code==='LEGACY_PACKAGE_IMPORT').length,2)));
test('accepts constrained composition, one brand, reset and transitive local components',()=>withFixture({
 'App.tsx':"import {DesignSystemProvider} from 'beds'; import 'beds/styles.css'; import 'beds/reset.css'; import {Content} from './Content'; const accent='#ffa133'; export const App=()=> <DesignSystemProvider theme='dark' brandColor={accent}><Content/></DesignSystemProvider>",
 'Content.tsx':"import {Stack,Text} from 'beds'; export const Content=()=> <Stack gap='tight'><Text>user#code</Text></Stack>"
},dir=>{const result=checkConsumerPaths([dir]);assert.equal(result.issues.length,0,JSON.stringify(result.issues));assert.equal(result.files,2);}));
test('accepts app-owned native composition through a transitive component',()=>withFixture({
 'App.tsx':"import {Content} from './Content'; export const App=()=> <Content/>",
 'Content.tsx':"export const Content=()=> <div className='custom' style={{padding:48,color:'#ff0000'}}>Escape</div>"
},dir=>{const result=checkConsumerPaths([dir]);assert.deepEqual(result.issues,[]);}));
test('feature card accepts content and callbacks without permitting visual overrides',()=>withFixture({
 'good.tsx':"import {FeatureCard} from 'beds'; export const Good=()=> <FeatureCard image={{src:'/onboarding.svg',alt:'Example'}} title='Start here' description='Your next step' primaryAction={{label:'Continue',onClick:()=>{}}} secondaryAction={{label:'Learn more',onClick:()=>{}}}/>",
 'bad.tsx':"import {FeatureCard} from 'beds'; export const Bad=()=> <FeatureCard style={{borderRadius:4}} image={{src:'/image.svg',alt:''}} title='Example' description='Example' primaryAction={{label:'Continue',onClick:()=>{}}}/>"
},dir=>{
 assert.equal(checkConsumerPaths([path.join(dir,'good.tsx')]).issues.length,0);
 assert.ok(checkConsumerPaths([path.join(dir,'bad.tsx')]).issues.length>0);
}));
test('allows app styles and icons but rejects BEDS spread props and invalid brand',()=>withFixture({
 'App.tsx':"import {Text,DesignSystemProvider} from 'beds'; import {Sun} from 'lucide-react'; import './custom.css'; const props={style:{color:'red'}}; export const App=()=> <DesignSystemProvider theme='dark' brandColor='#fff'><Text {...props}/><Sun/></DesignSystemProvider>",
 'custom.css':".custom{font-family:serif}"
},dir=>{const result=checkConsumerPaths([dir]);assert.deepEqual(new Set(result.issues.map(item=>item.code)),new Set(['JSX_SPREAD','BRAND_CONTRACT']));}));
test('rejects typography, spacing, color and icon overrides with named violations',()=>withFixture({
 'App.tsx':"import {Icon,Text} from 'beds'; import {House} from 'lucide-react'; const localStyle={fontFamily:'serif',color:'#ff0000'}; export const App=()=> <><Text fontStyle='italic' padding={24} color='#ff0000'>Blocked</Text><Icon name='Home' size={24} strokeWidth={2}/><House/></>"
},dir=>{
 const codes=new Set(checkConsumerPaths([dir]).issues.map(issue=>issue.code));
 for(const code of ['FONT_OVERRIDE','SPACING_OVERRIDE','COLOR_OVERRIDE','ICON_OVERRIDE']) assert.ok(codes.has(code),`Expected ${code}; got ${[...codes]}`);
}));
test('allows only declared semantic spacing variants',()=>withFixture({
 'App.tsx':"import {Stack,Text} from 'beds'; const semanticGap='section'; export const Good=()=> <Stack gap={semanticGap}><Text>Good</Text></Stack>; export const Bad=()=> <Stack gap='48px'><Text>Bad</Text></Stack>"
},dir=>{
 const issues=checkConsumerPaths([dir]).issues;
 assert.equal(issues.filter(issue=>issue.code==='SEMANTIC_VARIANT_CONTRACT').length,1,JSON.stringify(issues));
}));
test('fails closed on absent audit scope',()=>{assert.throws(()=>checkConsumerPaths([]));assert.ok(checkConsumerPaths(['/tmp/espaco-no-such-ui-root']).issues.some(issue=>issue.code==='MISSING_PATH'));});
test('fails closed on an explicit but empty consumer scope',()=>withFixture({},dir=>assert.ok(checkConsumerPaths([dir]).issues.some(issue=>issue.code==='EMPTY_SCOPE'))));
test('consumer CLI runs through a symlink and rejects a private BEDS override',()=>withFixture({'bad.tsx':"import {Button} from 'beds'; export const Bad=()=> <Button label='Save' style={{color:'red'}}/>"},dir=>{
 const link=path.join(dir,'consumer-link.mjs');
 symlinkSync(fileURLToPath(new URL('./check-consumer.mjs',import.meta.url)),link);
 const result=spawnSync(process.execPath,[link,path.join(dir,'bad.tsx')],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stdout,/Espaço consumer contract/);assert.match(result.stderr,/VISUAL_PROP/);
}));
test('app layout CSS can read tokens but not style private BEDS selectors',()=>withFixture({
 'App.tsx':"import './layout.css'; export const App=()=> <main className='page'><img src='/brand.svg' alt='Example'/></main>",
 'layout.css':'.page{display:grid;gap:var(--es-space-8);max-width:70rem}',
 'bad.css':'.page .es-button{outline:none}.page{--es-focus:transparent}'
},dir=>{
 assert.deepEqual(checkConsumerPaths([path.join(dir,'App.tsx')]).issues,[]);
 assert.ok(checkConsumerPaths([path.join(dir,'bad.css')]).issues.some(item=>item.code==='PRIVATE_LIBRARY_STYLE'));
}));
test('pseudo-element selectors do not declare CSS tokens',()=>withFixture({
 'src/index.ts':'export function Example(){return null;}',
 'src/tokens.css':'.es-root{--es-bg:#191919}',
 'src/layout.css':'.es-nav-item--active::before{color:var(--active)}'
},dir=>{
 const result=checkLibrary({root:dir,tokens:['src/tokens.css']});
 assert.equal(result.tokens,3);
 assert.ok(result.issues.some(issue=>issue.code==='UNDECLARED_TOKEN' && issue.message.includes('--active')));
}));
