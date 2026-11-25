const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const root='http://127.0.0.1:4188/';const mobile=page.frameLocator('#frame-mobile'),admin=page.frameLocator('#frame-admin');
  const tab=async name=>{await page.getByRole('tab',{name,exact:true}).click();};
  await page.goto(root);await mobile.locator('#mobile-login-form').waitFor();assert.equal(await page.locator('header h1').innerText(),'霍尼技术交流平台');assert.equal(await mobile.locator('.brand img').getAttribute('alt'),'Honeywell Technologies');assert.equal(await mobile.locator('.mobile-login-submit').innerText(),'登录素材库');assert.equal(await page.getByRole('tab').count(),2);assert.equal(await page.getByRole('tab',{name:'手机端',exact:true}).getAttribute('aria-selected'),'true');
  const phoneBox=await page.locator('.phone-frame').boundingBox();assert.equal(phoneBox.width,393);assert.equal(phoneBox.height,852);
  await page.screenshot({path:path.join(__dirname,'admin/test-results/showcase-login.png'),animations:'disabled'});
  await mobile.locator('#mobile-phone').fill('13900000004');await mobile.locator('#mobile-code').fill('654321');
  await tab('管理后台');await admin.locator('.sidebar').waitFor();assert.equal(await admin.locator('#login-form').count(),0);await admin.locator('.sidebar nav a[href="#employees"]').click();await admin.locator('#employee-filter').waitFor();
  assert.equal(new URL(page.url()).searchParams.get('view'),'admin');await page.screenshot({path:path.join(__dirname,'admin/test-results/unified-admin.png'),animations:'disabled'});
  await tab('手机端');assert.equal(await mobile.locator('#mobile-phone').inputValue(),'13900000004');assert.equal(await mobile.locator('#mobile-code').inputValue(),'654321');
  await mobile.locator('[data-mobile-action=send-code]').click();await mobile.locator('#mobile-code').fill('123456');await mobile.locator('#mobile-login-form button[type=submit]').click();await mobile.locator('#list-body').waitFor();await page.screenshot({path:path.join(__dirname,'preview.png'),animations:'disabled'});
  await mobile.locator('#mobile-bottom-nav a[href="#my"]').click();await mobile.locator('[data-action=my-favorites]').click();await mobile.locator('#personal-records').waitFor();await page.waitForFunction(()=>location.hash==='#my-favorites');
  await tab('管理后台');await admin.locator('#employee-filter').waitFor();await admin.locator('[data-action=switch-mobile-demo]').click();await page.waitForFunction(()=>document.querySelector('#tab-mobile').getAttribute('aria-selected')==='true');await mobile.locator('#personal-records').waitFor();
  await tab('管理后台');await admin.locator('#employee-filter').waitFor();await page.waitForFunction(()=>location.hash==='#employees');await page.reload();await admin.locator('#employee-filter').waitFor();assert.equal(await page.getByRole('tab',{name:'管理后台',exact:true}).getAttribute('aria-selected'),'true');
  await tab('手机端');await mobile.locator('#list-body').waitFor();assert.equal(await mobile.locator('#mobile-login-form,#mobile-account').count(),0);
  await page.goBack();await admin.locator('#employee-filter').waitFor();assert.equal(await page.getByRole('tab',{name:'管理后台',exact:true}).getAttribute('aria-selected'),'true');await page.goForward();await mobile.locator('#list-body').waitFor();
  await page.getByRole('tab',{name:'手机端',exact:true}).focus();await page.keyboard.press('ArrowRight');await admin.locator('#employee-filter').waitFor();await page.keyboard.press('Home');await mobile.locator('#list-body').waitFor();
  await page.goto(root+'#knowledge/carpet-care');await mobile.locator('.detail-card').waitFor();assert.match(await mobile.locator('.detail-card h1').innerText(),/地毯日常清洁/);
  const downloading=page.waitForEvent('download');await mobile.locator('.detail-actions [data-action=download]').click();const download=await downloading;assert(download.suggestedFilename().endsWith('.pdf'));
  await page.setViewportSize({width:393,height:852});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await tab('管理后台');await admin.locator('.sidebar').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.setViewportSize({width:1600,height:1000});await page.goto(root+'?view=admin#content/comments/carpet-care');await admin.locator('.comments-table').waitFor();await admin.locator('[data-comment-detail=c6]').click();await admin.locator('.replies-table').waitFor();await page.waitForFunction(()=>location.hash==='#content/comments/carpet-care/c6');await page.screenshot({path:path.join(__dirname,'admin/test-results/unified-comment-detail.png'),animations:'disabled'});await page.reload();await admin.locator('.replies-table').waitFor();await tab('手机端');await mobile.locator('#list-body').waitFor();await tab('管理后台');await admin.locator('.replies-table').waitFor();await admin.locator('.page-heading a').click();await admin.locator('.comments-table').waitFor();await page.waitForFunction(()=>location.hash==='#content/comments/carpet-care');
  assert.deepEqual(errors,[]);console.log('PASS: comment deep links, refresh and tab-state preservation.');console.log('PASS: shared URL/two tabs, 393×852 phone viewport, input/navigation/session retention, direct admin, admin-to-mobile tab link, refresh/history/keyboard, legacy detail links, iframe downloads and mobile width.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
