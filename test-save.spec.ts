import { test } from '@playwright/test';

test('create request', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  await page.goto('http://localhost:5173/login');
  await page.click('text=Администратор');
  await page.waitForTimeout(500);
  
  await page.click('text=Заявки на подбор персонала');
  await page.waitForTimeout(500);

  await page.click('text=Создать новую заявку');
  await page.waitForTimeout(500);

  const selects = await page.locator('select').all();
  if (selects.length >= 2) {
    await selects[0].selectOption({ index: 1 });
    await selects[1].selectOption({ index: 1 });
  }

  await page.click('text=Сохранить запись');
  await page.waitForTimeout(1000);
  
  const localStorageContent = await page.evaluate(() => localStorage.getItem('hr_requests'));
  console.log('LC HR_REQUESTS length:', localStorageContent ? JSON.parse(localStorageContent).length : 0);
});
