import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));

for (const theme of ['light','dark'] as const) {
 test(`brand changes only emphasis and source geometry stays fixed in ${theme}`,async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/?view=chat&theme='+theme);
  const input=page.getByRole('textbox',{name:'Chat message',exact:true});
  await expect(input).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const before=await page.locator('.es-root').evaluate(e=>{
   const s=getComputedStyle(e);const panel=e.querySelector('.es-composer')!.getBoundingClientRect();
   return {colors:['--es-bg','--es-text','--es-secondary','--es-surface','--es-border','--es-info','--es-success'].map(k=>s.getPropertyValue(k)),width:panel.width,height:panel.height,font:s.fontFamily};
  });
  expect(before.font).toContain('Espaco Inter');
  expect(before.width).toBe(info.project.name==='mobile'?358:640);
  expect(before.height).toBe(156);
  await expect(page.locator('.es-composer form')).toHaveCSS('background-color',theme==='dark'?'rgb(25, 25, 25)':'rgb(255, 255, 255)');
  await expect(page.locator('.es-composer')).toHaveCSS('background-color',theme==='dark'?'rgb(34, 34, 34)':'rgb(251, 250, 249)');
  await expect(page.getByRole('button',{name:'Working mode: Auto'})).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await expect(page.getByRole('button',{name:'Working mode: Auto'})).toContainText('Routes each request');
  await expect(input).toHaveCSS('font-size','14px');
  await expect(input).toHaveCSS('line-height','22.4px');
  await expect(page.locator('.es-root')).toHaveCSS('background-color',theme==='dark'?'rgb(25, 25, 25)':'rgb(255, 255, 255)');
  await page.getByRole('button',{name:'Cor da marca: Referência'}).click();
  await page.getByRole('option',{name:'Curriculol',exact:true}).click();
  const after=await page.locator('.es-root').evaluate(e=>{
   const s=getComputedStyle(e);const panel=e.querySelector('.es-composer')!.getBoundingClientRect();
   return {colors:['--es-bg','--es-text','--es-secondary','--es-surface','--es-border','--es-info','--es-success'].map(k=>s.getPropertyValue(k)),width:panel.width,height:panel.height,font:s.fontFamily,brand:s.getPropertyValue('--es-brand')};
  });
  expect(after.brand.trim()).toBe('#ffa133');
  expect(after.colors).toEqual(before.colors);
  expect(after.width).toBe(before.width);expect(after.height).toBe(before.height);
  await expect(page.locator('.es-chat-layout .es-brand-mark')).toHaveCSS('fill','rgb(255, 161, 51)');
  const fontLoaded=await page.evaluate(()=>document.fonts.check('13px "Espaco Inter"'));expect(fontLoaded).toBe(true);
  await page.screenshot({path:evidence+'library-'+theme+'-'+info.project.name+'.png'});
  expect(errors).toEqual([]);
 });
 test(`composer suggestion, newline, IME and submit in ${theme}`,async({page})=>{
  await page.goto('/?view=chat&theme='+theme);
  const input=page.getByRole('textbox',{name:'Chat message',exact:true});
  const send=page.getByRole('button',{name:'Send message',exact:true});
  await expect(send).toBeDisabled();
  await input.fill('   ');await expect(send).toBeDisabled();
  await page.getByRole('button',{name:'Research Research competitors’ ads',exact:true}).click();
  await expect(input).toHaveValue('Research competitors’ ads');
  await input.press('End');await input.press('Shift+Enter');await input.press('a');
  await expect(input).toHaveValue('Research competitors’ ads\na');
  await input.dispatchEvent('keydown',{key:'Enter',code:'Enter',isComposing:true});
  await expect(page.getByRole('article',{name:'Your message'})).toHaveCount(0);
  await input.press('Enter');
  await expect(page.getByRole('article',{name:'Your message'})).toHaveCount(1);
  await expect(input).toHaveValue('');await expect(send).toBeDisabled();
 });
 test(`missing meter values and copying recover in ${theme}`,async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/?view=components&theme='+theme);
  await page.getByRole('button',{name:'Sem dado',exact:true}).click();
  await expect(page.getByRole('img',{name:'Medidor de marca: unavailable',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Zero',exact:true}).click();
  await expect(page.getByRole('meter',{name:'Medidor de marca',exact:true})).toHaveAttribute('aria-valuenow','0');
  await page.getByRole('button',{name:'Máximo',exact:true}).click();
  await expect(page.getByRole('meter',{name:'Medidor de marca',exact:true})).toHaveAttribute('aria-valuenow','100');
  await page.getByRole('button',{name:'Testar falha de cópia',exact:true}).click();
  const copy=page.getByRole('button',{name:'Copy Configuração sintética',exact:true});
  await copy.click();
  await expect(page.getByRole('alert').filter({hasText:'Copy failed.'})).toBeVisible();
  await page.getByRole('button',{name:'Restaurar cópia',exact:true}).click();await copy.click();
  await expect(copy).toContainText('Copied');
  await expect(page.getByRole('alert').filter({hasText:'Copy failed.'})).toHaveCount(0);
  await expect(page.locator('.es-code-snippet')).toHaveCSS('height','42px');
  await expect(page.locator('.es-code-snippet')).toHaveCSS('border-radius','12px');
  await expect(page.locator('.es-code-snippet>code')).toHaveCSS('font-size','11px');
  expect(await page.evaluate(()=>document.fonts.check('11px "Espaco Geist Mono"'))).toBe(true);
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('https://example.com/api');
  await page.getByRole('textbox',{name:'Endereço do exemplo',exact:true}).fill('https://example.com/next');
  await expect(copy).toHaveText('Copy');
  await copy.click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('https://example.com/next');
 });
}
