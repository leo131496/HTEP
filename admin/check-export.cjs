const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const Zip=require('./jszip.min.js');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const output=path.join(__dirname,'test-results');await fs.mkdir(output,{recursive:true});
  await page.goto('http://127.0.0.1:4188/admin/#dashboard');await page.locator('[data-action=export-dashboard]').waitFor();
  const parse=xml=>page.evaluate(text=>{const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw Error('Invalid workbook XML');return [...doc.querySelectorAll('sheetData row')].map(r=>[...r.querySelectorAll('c')].map(c=>c.getAttribute('t')==='inlineStr'?c.querySelector('t').textContent:Number(c.querySelector('v').textContent)));},xml);
  async function download(name){
   const downloading=page.waitForEvent('download');await page.locator('[data-action=export-dashboard]').click();const file=await downloading;assert(file.suggestedFilename().endsWith('.xlsx'));await file.saveAs(path.join(output,name+'.xlsx'));
   const zip=await Zip.loadAsync(await fs.readFile(await file.path())),rows=[];
   const workbook=await zip.file('xl/workbook.xml').async('string');assert.deepEqual(await page.evaluate(text=>[...new DOMParser().parseFromString(text,'application/xml').querySelectorAll('sheet')].map(s=>s.getAttribute('name')),workbook),['看板汇总','每日趋势','部门贡献','员工贡献排名','行为明细']);
   for(let i=1;i<=5;i++)rows.push(await parse(await zip.file(`xl/worksheets/sheet${i}.xml`).async('string')));
   assert.equal(await page.locator('[data-action=export-dashboard]').isEnabled(),true);return {rows,zip,name:file.suggestedFilename()};
  }
  let report=await download('dashboard-all');const expected=await page.evaluate(()=>({counts:M.totals(stats()),total:stats().length,rank:M.ranking(S,stats()),days:Math.round((new Date(range.to)-new Date(range.from))/86400000)+1}));
  const summary=Object.fromEntries(report.rows[0]);assert.equal(summary['贡献总次数'],expected.total);assert.deepEqual(report.rows[0].slice(4,8).map(r=>r[1]),Object.values(expected.counts));assert.equal(report.rows[1].length,expected.days+1);assert.equal(report.rows[4].length,expected.total+1);assert.equal(report.rows[3].length,expected.rank.length+1);assert(report.rows[4].slice(1).every(r=>r[0]!=='访客'&&r[0]!=='后台管理员'));assert.equal(report.rows[1].slice(1).reduce((sum,r)=>sum+r[5],0),expected.total);assert.equal(report.rows[2].slice(1).reduce((sum,r)=>sum+r[5],0),expected.total);assert.equal(report.rows[3].slice(1).reduce((sum,r)=>sum+r[9],0),expected.total);assert.equal(typeof report.rows[3][1][3],'string');
  await page.locator('#date-filter [name=department]').selectOption('产品部');assert.equal(await page.locator('[data-action=export-dashboard]').isDisabled(),true);assert.match(await page.locator('#date-filter-hint').innerText(),/先应用/);await page.locator('#date-filter [name=from]').fill('2026-11-20');await page.locator('#date-filter [name=to]').fill('2026-11-21');await page.locator('#date-filter button[type=submit]').click();
  report=await download('dashboard-filtered');assert.match(report.name,/2026-11-20_2026-11-21_产品部/);assert.equal(report.rows[4].length,(await page.evaluate(()=>stats().length))+1);assert.equal(report.rows[2].length,2);assert.equal(report.rows[2][1][0],'产品部');assert(report.rows[4].slice(1).every(r=>r[1]==='产品部'&&r[4].slice(0,10)>='2026-11-20'&&r[4].slice(0,10)<='2026-11-21'));assert.equal(report.rows[1].length,3);assert.equal(Object.fromEntries(report.rows[0])['员工部门'],'产品部');
  await page.locator('#date-filter [name=from]').fill('2026-01-01');await page.locator('#date-filter [name=to]').fill('2026-01-03');await page.locator('#date-filter button[type=submit]').click();report=await download('dashboard-empty');assert.equal(Object.fromEntries(report.rows[0])['贡献总次数'],0);assert.equal(report.rows[4].length,1);assert.equal(report.rows[3].length,1);assert.equal(report.rows[1].length,4);assert(report.rows[1].slice(1).every(row=>row.slice(1).every(n=>n===0)));
  await page.locator('[data-action=reset-range]').click();await page.evaluate(()=>{S.employees[0].name='=SUM(1,1) <员工&测试>';const e=S.events.find(e=>e.employeeId==='e1');e.name=S.employees[0].name;e.contentTitle='素材 <测试> & "引用"';});report=await download('dashboard-text');assert(report.rows[3].some(r=>r[1]==='=SUM(1,1) <员工&测试>'));assert(report.rows[4].some(r=>r[3]==='素材 <测试> & "引用"'));assert(!(await report.zip.file('xl/worksheets/sheet4.xml').async('string')).includes('<f>'));
  await page.evaluate(()=>{dashboardWorkbook=async()=>{throw Error('test export failure');};});await page.locator('[data-action=export-dashboard]').click();assert.match(await page.locator('#toast').innerText(),/导出失败/);assert.equal(await page.locator('[data-action=export-dashboard]').isEnabled(),true);
  assert.deepEqual(errors,[]);console.log('PASS: Excel sheets and numeric totals match dashboard; complete data, date/department filters, empty ranges, phone text, XML escaping, formula-safe text and export failure recovery.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
