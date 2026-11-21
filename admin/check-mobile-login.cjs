const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext();const admin=await context.newPage(),phone=await context.newPage();const errors=[];
  for(const p of [admin,phone])p.on('pageerror',e=>errors.push(e.message));
  await admin.setViewportSize({width:1440,height:1000});await phone.setViewportSize({width:393,height:852});
  await admin.goto('http://127.0.0.1:4188/admin/');await admin.locator('.sidebar').waitFor();
  assert.equal(await admin.locator('#login-form,[data-action=logout]').count(),0);assert.equal(await admin.locator('.sidebar nav a').count(),6);
  await admin.reload();await admin.locator('.kpi').first().waitFor();await admin.screenshot({path:path.join(__dirname,'preview.png'),fullPage:true});
  await phone.goto('http://127.0.0.1:4188/#knowledge/carpet-care');await phone.locator('#mobile-login-form').waitFor();assert.equal(await phone.locator('.detail-card,#list-body').count(),0);
  await fs.mkdir(path.join(__dirname,'test-results'),{recursive:true});await phone.screenshot({path:path.join(__dirname,'test-results/mobile-login.png')});
  const login=async number=>{await phone.locator('#mobile-phone').fill(number);await phone.locator('[data-mobile-action=send-code]').click();await phone.locator('#mobile-code').fill('123456');await phone.locator('#mobile-login-form button[type=submit]').click();};
  await phone.locator('#mobile-phone').fill('123');await phone.locator('[data-mobile-action=send-code]').click();assert.match(await phone.locator('#mobile-login-feedback').innerText(),/11 位/);
  await phone.locator('#mobile-phone').fill('13900000012');await phone.locator('[data-mobile-action=send-code]').click();assert.match(await phone.locator('#mobile-login-feedback').innerText(),/停用/);
  await phone.locator('#mobile-phone').fill('13900000004');await phone.locator('[data-mobile-action=send-code]').click();await phone.locator('#mobile-code').fill('000000');await phone.locator('#mobile-login-form button[type=submit]').click();assert.match(await phone.locator('#mobile-login-feedback').innerText(),/有效/);
  await login('13900000004');await phone.locator('.detail-card').waitFor();assert.match(await phone.locator('#mobile-account').innerText(),/张悦/);assert.equal(await phone.locator('.sidebar,[data-action=new-content],[data-action=upload]').count(),0);
  await phone.locator('.detail-actions [data-action=favorite]').click();const firstKey=await phone.evaluate(()=>storeKey);assert.equal(firstKey,'htep-mobile-profile-e4');assert(await phone.evaluate(()=>isSaved('carpet-care')));
  await phone.reload();await phone.locator('.detail-card').waitFor();assert(await phone.evaluate(()=>isSaved('carpet-care')));
  await phone.locator('[data-mobile-action=logout]').click();await phone.locator('#mobile-login-form').waitFor();await phone.goto('http://127.0.0.1:4188/#knowledge/wood-care');await phone.locator('#mobile-login-form').waitFor();assert.equal(await phone.locator('.detail-card').count(),0);
  await login('13900000005');await phone.locator('#mobile-account').waitFor();assert.equal(await phone.evaluate(()=>MobileAuth.current()?.id),'e5');assert(!await phone.evaluate(()=>isSaved('carpet-care')));
  await phone.locator('[data-mobile-action=logout]').click();await phone.locator('#mobile-login-form').waitFor();await login('13900000004');await phone.waitForFunction(()=>MobileAuth.current()?.id==='e4'&&!document.querySelector('#mobile-login-form'));
  await admin.locator('.sidebar nav a[href="#employees"]').click();await admin.locator('[data-action=toggle-employee][data-id=e4]').click();await phone.locator('#mobile-login-form').waitFor();assert.equal(await phone.evaluate(()=>MobileAuth.current()),null);
  await login('13900000004');assert.match(await phone.locator('#mobile-login-feedback').innerText(),/停用/);await admin.locator('[data-action=toggle-employee][data-id=e4]').click();
  await admin.locator('[data-action=new-employee]').click();await admin.locator('#employee-form [name=name]').fill('手机端员工');await admin.locator('#employee-form [name=number]').fill('MOBILE001');await admin.locator('#employee-form [name=phone]').fill('13800000999');assert.equal(await admin.locator('#employee-form [name=role]').count(),0);await admin.locator('#employee-form .primary').click();await admin.waitForFunction(()=>!document.querySelector('#dialog').open);
  await login('13800000999');await phone.waitForFunction(()=>MobileAuth.current()?.phone==='13800000999'&&!document.querySelector('#mobile-login-form'));
  await phone.goto('http://127.0.0.1:4188/');await phone.locator('#list-body').waitFor();assert.equal(await phone.locator('.shortcut').count(),4);assert.equal(await phone.locator('.folder-row').count(),3);
  await phone.setViewportSize({width:320,height:750});assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await phone.locator('[data-mobile-action=logout]').click();await phone.locator('#mobile-login-form').waitFor();assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await admin.locator('.sidebar nav a[href="#permissions"]').click();await admin.locator('.permission-bottom').waitFor();assert(!/后台角色权限|系统管理员|内容管理员/.test(await admin.locator('#main').innerText()));
  assert.deepEqual(errors,[]);console.log('PASS: backend direct entry/no auth UI; phone-only login, invalid/disabled/code validation, deep-link protection, logout/refresh, per-employee data isolation, employee status revocation, new employee login, separate features and 320px layout.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
