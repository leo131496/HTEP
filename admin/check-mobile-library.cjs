const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 MicroMessenger/8.0'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4188/mobile/');
  await page.locator('#mobile-phone').fill('13900000004');await page.locator('[data-mobile-action=send-code]').click();await page.locator('#mobile-code').fill('123456');await page.locator('#mobile-login-form [type=submit]').click();await page.locator('#list-body').waitFor();
  assert.equal(await page.locator('#folder-total').innerText(),'共 6 条素材');assert(!/最多三级目录/.test(await page.locator('#app').innerText()));assert(await page.locator('#load-more').isHidden());
  assert(await page.locator('#library-hero').isVisible());assert.equal(await page.locator('.category-card').count(),3);
  assert.deepEqual(await page.locator('#latest-materials [data-action=detail]').evaluateAll(es=>es.map(e=>e.dataset.id)),['carpet-care','wood-care','installation-check']);
  await page.locator('#latest-materials [data-action=detail]').first().click();await page.locator('.detail-card').waitFor();await page.locator('.back-row').click();await page.locator('#library-hero').waitFor();
  await page.locator('#latest-materials [data-mode=all]').click();assert(await page.locator('#library-hero').isHidden());assert(await page.locator('#latest-materials').isHidden());assert.equal(await page.locator('#list-body [data-action=detail]').count(),6);await page.locator('[data-mode=folders]').click();
  // Fixtures stay in this browser page and never become published demo content.
  await page.evaluate(()=>{
   for(let n=0;n<53;n++)uploads.push({...seed[0],id:'batch-'+n,folderId:'',title:'分页样例 '+String(n).padStart(2,'0'),fileName:'分页样例 '+String(n).padStart(2,'0')+(n%2?'.docx':'.pdf'),kind:n%2?'word':'pdf',date:'2026-11-23'});
   for(let n=0;n<23;n++)folders.push({id:'batch-folder-'+n,name:'样例目录 '+String(n).padStart(2,'0'),parent:''});
   renderList();
  });
  const rows=page.locator('#list-body>article'),files=page.locator('#list-body [data-action=detail]'),more=page.locator('#load-more');
  const ids=()=>files.evaluateAll(nodes=>nodes.map(e=>e.dataset.id));
  assert.equal(await rows.count(),20);assert.equal(await page.locator('.folder-row').count(),20);assert.match(await page.locator('#list-end').innerText(),/20 \/ 79/);
  await more.click();assert.equal(await rows.count(),40);assert.equal(await page.locator('.folder-row').count(),26);assert.equal(await files.count(),14);
  await more.click();assert.equal(await rows.count(),60);await more.click();assert.equal(await rows.count(),79);assert(await more.isHidden());assert.equal(new Set(await ids()).size,53);assert.match(await page.locator('#list-end').innerText(),/全部 79 项/);
  await page.locator('.browse-modes [data-action=browse][data-mode=all]').click();assert.equal(await rows.count(),20);assert.equal(await page.locator('.folder-row').count(),0);assert.equal(await page.locator('#result-count').innerText(),'共 59 条素材');
  await more.click();assert.equal(await files.count(),40);
  const selected=files.nth(24);const selectedId=await selected.getAttribute('data-id');await selected.scrollIntoViewIfNeeded();const before=await page.locator('#app').evaluate(e=>e.scrollTop);
  await selected.click();await page.locator('.detail-card').waitFor();await page.locator('.back-row').click();await page.locator('#list-body').waitFor();assert.equal(await files.count(),40);assert(Math.abs(await page.locator('#app').evaluate(e=>e.scrollTop)-before)<2);
  await page.locator(`[data-action=favorite][data-id="${selectedId}"]`).click();assert.equal(await files.count(),40);
  await page.locator('#mobile-bottom-nav a[href="#my"]').click();await page.locator('.profile-card').waitFor();await page.locator('#mobile-bottom-nav a').first().click();await page.locator('#list-body').waitFor();assert.equal(await files.count(),40);assert.equal(await page.locator('[data-mode=all]').getAttribute('aria-pressed'),'true');
  await more.click();assert.equal(await files.count(),59);assert.equal(new Set(await ids()).size,59);assert(await more.isHidden());
  await page.locator('#search').fill('分页样例');assert.equal(await files.count(),20);assert.equal(await page.locator('#result-count').innerText(),'找到 53 条素材');await more.click();assert.equal(await files.count(),40);
  await page.locator('[data-action=filter][data-kind=pdf]').click();assert.equal(await files.count(),20);assert.equal(await page.locator('#result-count').innerText(),'找到 27 条素材');await more.click();assert.equal(await files.count(),27);assert(await more.isHidden());
  await page.locator('#sort').selectOption('name');assert.equal(await files.count(),20);assert.deepEqual(await ids(),Array.from({length:20},(_,n)=>'batch-'+n*2));await more.click();assert.equal(await files.count(),27);assert.equal(new Set(await ids()).size,27);
  await page.locator('#search').fill('无匹配的测试关键词');assert.equal(await files.count(),0);assert(await page.locator('#list-footer').isHidden());await page.locator('[data-action=reset-list]').click();assert.equal(await files.count(),20);
  await page.locator('#toast').evaluate(e=>e.classList.remove('visible'));await fs.mkdir(path.join(__dirname,'test-results'),{recursive:true});await page.locator('#app').evaluate(e=>e.scrollTo(0,0));await page.screenshot({path:path.join(__dirname,'test-results/library-many-top.png')});await more.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'test-results/library-many-more.png')});
  await page.locator('[data-mode=folders]').click();await page.locator('[data-action=folder][data-folder=care]').click();await page.waitForURL('**/#folder/care');await page.locator('.folder-breadcrumbs a[aria-current=page]').waitFor();assert.equal(await rows.count(),2);assert(await more.isHidden());assert.equal(await page.locator('#folder-total').innerText(),'共 2 条素材');
  await page.locator('[data-kind=pdf]').click();assert.equal(await files.count(),1);assert.deepEqual(await ids(),['carpet-care']);assert.match(await page.locator('#result-count').innerText(),/含子目录/);
  for(const width of [320,393,430]){await page.setViewportSize({width,height:852});assert.equal(await page.locator('#app').evaluate(e=>e.scrollWidth>e.clientWidth),false);const nav=await page.locator('#mobile-bottom-nav').boundingBox(),app=await page.locator('#app').boundingBox();assert(app.y+app.height<=nav.y+1);assert.equal((await page.locator('.mobile-app').boundingBox()).width,width);}
  assert.deepEqual(errors,[]);console.log('PASS: 79 mixed entries; 20-item batches; no duplicates; browse modes; exact totals and end states; search/type/sort resets; detail and profile return; nested search; WeChat-sized layouts.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
