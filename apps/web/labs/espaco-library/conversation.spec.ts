import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`conversation semantics and reflow ${theme}`, async ({ page }) => {
    await page.goto(`/?view=conversation&theme=${theme}`);
    const conversation = page.getByRole('region', { name: 'Conversa com Lucy' });
    await expect(conversation).toBeVisible();
    await expect(conversation.getByRole('article', { name: 'Mensagem da assistente' })).toHaveCount(2);
    await expect(conversation.getByRole('article', { name: 'Sua mensagem' })).toHaveCount(1);
    await expect(conversation.getByText('10:14')).toBeVisible();
    await expect(conversation.getByRole('group', { name: 'Reações' })).toBeVisible();
    await conversation.getByRole('button', { name: 'Útil' }).focus();
    await expect(conversation.getByRole('button', { name: 'Útil' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/beds-conversation-${theme}-${test.info().project.name}.png` });
  });
}
