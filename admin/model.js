/* Static demo rules. Production identity, authorization and storage must be enforced by a server. */
(function(root){
const MAX_FILE=500*1024*1024;
const roles={admin:'系统管理员',editor:'内容管理员',reviewer:'评论审核员',employee:'普通员工'};
const actions={upload:'上传',download:'下载',share:'分享',comment:'评论'};
const departments=['产品部','市场部','销售部','技术服务部','运营部'];
const roleActions={admin:['dashboard','ranking','content','employees','review','permissions'],editor:['dashboard','ranking','content'],reviewer:['dashboard','ranking','review'],employee:[]};
const uid=prefix=>prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
function seed(){
 const names=['林晓','陈敏','周宁','张悦','李晨','王璐','赵宇','沈佳','刘洋','许安','孙琪','郑川'];
 const employees=names.map((name,i)=>({id:'e'+(i+1),name,phone:'139000000'+String(i+1).padStart(2,'0'),number:'EMP'+String(i+1).padStart(3,'0'),department:departments[i%5],role:i===0?'admin':i===1?'editor':i===2?'reviewer':'employee',enabled:i!==11,deleted:false,created:'2026-11-01'}));
 const folders=[{id:'care',name:'清洁保养',parent:'',scope:'all',targets:[]},{id:'installation',name:'安装施工',parent:'',scope:'all',targets:[]},{id:'product',name:'产品知识',parent:'',scope:'all',targets:[]},{id:'carpet',name:'地毯养护',parent:'care',scope:'all',targets:[]},{id:'daily-care',name:'日常清洁',parent:'carpet',scope:'all',targets:[]},{id:'layout',name:'铺装指引',parent:'installation',scope:'all',targets:[]}];
 const contents=[
 ['carpet-care','地毯日常清洁与保养指南','pdf','daily-care','carpet','地毯日常清洁与保养指南.pdf','日常吸尘、局部污渍处理与定期保养。'],
 ['wood-care','木地板保养操作手册','word','care','wood','木地板保养操作手册.docx','木地板日常清洁、环境维护和使用保护。'],
 ['installation-check','项目现场安装检查表','excel','installation','checklist','项目现场安装检查表.xlsx','覆盖基层、铺装及完工验收的检查清单。'],
 ['tile-layout','方块地毯铺装示意图','image','layout','layout','方块地毯铺装示意图.png','直铺与转向铺装的方向参考。'],
 ['installation-video','地毯安装要点演示','video','layout','video','地毯安装要点演示.webm','通过动画了解地毯铺装方向与基础排版。'],
 ['well-leed','WELL 与 LEED 认证速查','pdf','product','certification','WELL与LEED认证速查.pdf','建筑认证关注重点及项目应用提示。']
 ].map((a,i)=>({id:a[0],title:a[1],kind:a[2],folder:a[3],asset:a[4],fileName:a[5],description:a[6],size:0,enabled:i!==5,scope:i===2?'departments':'inherit',targets:i===2?['技术服务部','产品部']:[],allowDownload:a[2]!=='video',allowShare:a[2]!=='video',allowComment:true,updated:'2026-11-'+(20-i),updatedBy:'林晓',owner:'e2'}));
 const events=[];
 for(let day=0;day<30;day++)for(let e=0;e<11;e++)for(let k=0;k<4;k++){
  const count=(day*3+e*5+k*2+(e%3)*day)%7;
  const total=k===0?(e<2&&count===1?1:0):count;
  for(let n=0;n<total;n++){const eligible=(k===1||k===2)?contents.filter(c=>c.kind!=='video'):contents;const target=eligible[(day+e+n)%eligible.length];events.push({id:'ev-'+day+'-'+e+'-'+k+'-'+n,actorType:'employee',employeeId:employees[e].id,name:employees[e].name,department:employees[e].department,action:Object.keys(actions)[k],contentId:target.id,contentTitle:target.title,date:new Date(Date.UTC(2026,10,21-day,8+n)).toISOString()});}
 }
 events.push({id:'visitor-demo',actorType:'visitor',name:'访客',action:'download',date:'2026-11-21T08:00:00Z'});
 const comments=[
 {id:'c1',employeeId:'e4',name:'张悦',contentId:'carpet-care',text:'入口区域是否需要根据客流增加深层清洁频次？希望补充一个判断标准。',status:'pending',date:'2026-11-21T01:25:00Z',reason:''},
 {id:'c2',employeeId:'e6',name:'王璐',contentId:'tile-layout',text:'现场铺装前建议先核对背部箭头，这张示意图很清楚。',status:'pending',date:'2026-11-21T02:10:00Z',reason:''},
 {id:'c3',employeeId:'e7',name:'赵宇',contentId:'installation-check',text:'建议检查表增加施工日期和验收人员字段，方便留档。',status:'pending',date:'2026-11-20T06:40:00Z',reason:''},
 {id:'c4',employeeId:'e5',name:'李晨',contentId:'wood-care',text:'已把家具脚垫检查加入日常巡检，感谢分享。',status:'approved',date:'2026-11-19T03:15:00Z',reviewer:'林晓',reviewed:'2026-11-19T04:00:00Z',reason:''},
 {id:'c5',employeeId:'e8',name:'沈佳',contentId:'well-leed',text:'有兴趣的朋友可以加群领取优惠券。',status:'rejected',date:'2026-11-18T08:00:00Z',reviewer:'周宁',reviewed:'2026-11-18T09:00:00Z',reason:'与知识内容无关，含推广信息。'}
 ];
 return {version:1,employees,folders,contents,events,comments,logs:[]};
}
function path(state,id){const out=[];while(id){const f=state.folders.find(x=>x.id===id);if(!f||out.some(x=>x.id===id)||out.length>=3)throw Error('目录无效或超过三级');out.unshift(f);id=f.parent;}return out;}
function validateFolder(state,folder){
 if(!folder.name.trim())throw Error('请填写文件夹名称');
 if(state.folders.some(f=>f.id!==folder.id&&f.parent===folder.parent&&f.name===folder.name.trim()))throw Error('同级文件夹名称不能重复');
 const draft={...state,folders:[...state.folders.filter(f=>f.id!==folder.id),folder]};
 for(const f of draft.folders)path(draft,f.id);
 validateScope(state,folder);
}
function validateScope(state,item){
 if(!['all','inherit','departments','employees'].includes(item.scope))throw Error('请选择有效的可见范围');
 if(['departments','employees'].includes(item.scope)){
  if(!item.targets.length)throw Error('至少选择一个部门或员工');
  const allowed=item.scope==='departments'?departments:state.employees.filter(e=>!e.deleted).map(e=>e.id);
  if(item.targets.some(x=>!allowed.includes(x)))throw Error('所选部门或员工已不存在');
 }
}
function matchesScope(item,employee){return ['all','inherit'].includes(item.scope)||(item.scope==='departments'?item.targets.includes(employee.department):item.targets.includes(employee.id));}
function canView(state,item,employee){return Boolean(employee&&!employee.deleted&&employee.enabled&&item.enabled&&path(state,item.folder).every(f=>matchesScope(f,employee))&&matchesScope(item,employee));}
function canAct(state,item,employee,action){if(!canView(state,item,employee))return false;if(action==='view')return true;if(action==='download')return item.kind!=='video'&&item.allowDownload;if(action==='share')return item.kind!=='video'&&item.allowShare;if(action==='comment')return item.allowComment;return false;}
function allowed(employee,page){return Boolean(employee?.enabled&&!employee.deleted&&roleActions[employee.role]?.includes(page));}
function validateEmployee(state,e){
 if(!e.name.trim()||!e.number.trim())throw Error('姓名、工号不能为空');
 if(!/^1[3-9]\d{9}$/.test(e.phone))throw Error('请输入正确的 11 位手机号');
 if(!departments.includes(e.department)||!roles[e.role])throw Error('部门或角色无效');
 if(state.employees.some(x=>x.id!==e.id&&!x.deleted&&(x.phone===e.phone||x.number===e.number)))throw Error('手机号或工号重复');
}
function fileKind(name){const ext=name.toLowerCase().split('.').pop();return ['png','jpg','jpeg','gif','webp'].includes(ext)?'image':['mp4','webm','mov'].includes(ext)?'video':ext==='pdf'?'pdf':['doc','docx'].includes(ext)?'word':['xls','xlsx'].includes(ext)?'excel':null;}
function validateFile(file){if(!file||file.size<=0)throw Error('请选择非空附件');if(file.size>MAX_FILE)throw Error('单个文件不能超过 500MB');if(!fileKind(file.name))throw Error('仅支持图片、视频、PDF、Word、Excel 文件');}
function filteredEvents(state,{from,to,department='all'}={}){return state.events.filter(e=>e.actorType==='employee'&&state.employees.some(x=>x.id===e.employeeId)&&(!from||e.date.slice(0,10)>=from)&&(!to||e.date.slice(0,10)<=to)&&(department==='all'||e.department===department));}
function totals(events){return Object.fromEntries(Object.keys(actions).map(k=>[k,events.filter(e=>e.action===k).length]));}
function ranking(state,events,metric='total'){
 const rows=state.employees.filter(e=>events.some(v=>v.employeeId===e.id)).map(e=>{const counts=totals(events.filter(v=>v.employeeId===e.id));return {...e,...counts,total:Object.values(counts).reduce((a,b)=>a+b,0)};});
 return rows.sort((a,b)=>b[metric]-a[metric]||a.number.localeCompare(b.number));
}
function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted)quoted=false;else if(!cell)quoted=true;else throw Error('CSV 引号格式不正确');}else if(!quoted&&ch===','){row.push(cell);cell='';}else if(!quoted&&(ch==='\n'||ch==='\r')){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=ch;}
 if(quoted)throw Error('CSV 引号未闭合');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
function importEmployees(state,text){
 const rows=parseCSV(text);if(rows.length<2)throw Error('文件中没有员工数据');
 const expected=['姓名','手机号','工号','部门','角色'];if(rows[0].map(x=>x.trim()).join(',')!==expected.join(','))throw Error('表头应为：姓名,手机号,工号,部门,角色');
 if(rows.length>501)throw Error('每次最多导入 500 名员工');
 const result=[],draft={...state,employees:[...state.employees]};
 for(let i=1;i<rows.length;i++){try{if(rows[i].length!==5)throw Error('需要 5 列');const [name,phone,number,department,roleName]=rows[i].map(x=>x.trim());const role=Object.keys(roles).find(k=>roles[k]===roleName);const e={id:uid('employee'),name,phone,number,department,role,enabled:true,deleted:false,created:new Date().toISOString().slice(0,10)};validateEmployee(draft,e);draft.employees.push(e);result.push(e);}catch(error){throw Error('第 '+(i+1)+' 行：'+error.message);}}
 return result;
}
const api={MAX_FILE,roles,actions,departments,roleActions,uid,seed,path,validateFolder,validateScope,canView,canAct,allowed,validateEmployee,fileKind,validateFile,filteredEvents,totals,ranking,parseCSV,importEmployees};
if(typeof module!=='undefined')module.exports=api;root.AdminModel=api;
})(globalThis);
