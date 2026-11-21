async function dashboardWorkbook(state,filters){
 const model=AdminModel,events=model.filteredEvents(state,filters),counts=model.totals(events),ranking=model.ranking(state,events);
 const metrics=['upload','download','share','comment'];
 const metricHeaders=['上传次数','下载次数','分享次数','审核通过的评论次数','贡献总次数'];
 const values=rows=>{const totals=model.totals(rows);return [...metrics.map(key=>totals[key]),rows.length];};
 const days=[];
 for(let date=new Date(filters.from+'T00:00:00Z');date<=new Date(filters.to+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+1)){
  const day=date.toISOString().slice(0,10);days.push([day,...values(events.filter(e=>e.date.slice(0,10)===day))]);
 }
 const departments=(filters.department==='all'?model.departments:[filters.department]).map(name=>[name,...values(events.filter(e=>e.department===name))]).sort((a,b)=>b[5]-a[5]);
 const sheets=[
  {name:'看板汇总',widths:[26,65],rows:[['统计项目','统计结果'],['开始日期',filters.from],['结束日期',filters.to],['员工部门',filters.department==='all'?'全部部门':filters.department],...metrics.map((key,i)=>[metricHeaders[i],counts[key]]),['贡献总次数',events.length],['参与员工数',ranking.length],['统计口径','仅员工行为，排除访客和后台管理操作；评论审核通过后计入。'],['导出范围','采用看板已应用的筛选条件；包含所选周期内的全部记录。']]},
  {name:'每日趋势',widths:[16,16,16,16,25,18],rows:[['日期',...metricHeaders],...days]},
  {name:'部门贡献',widths:[20,16,16,16,25,18],rows:[['部门',...metricHeaders],...departments]},
  {name:'员工贡献排名',widths:[10,20,20,18,35,16,16,16,25,18],rows:[['排名','员工','部门','手机号','邮箱',...metricHeaders],...ranking.map((e,i)=>[i+1,e.name+(e.deleted?'（已删除）':''),e.department,e.phone,e.email||'',...metrics.map(key=>e[key]),e.total])]},
  {name:'行为明细',widths:[20,20,16,50,24],rows:[['员工','部门','行为','素材','时间'],...events.toSorted((a,b)=>b.date.localeCompare(a.date)).map(e=>[e.name,e.department,model.actions[e.action],e.contentTitle,e.date.replace('T',' ').slice(0,16)])]}
 ];
 const zip=new JSZip(),ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main',rels='http://schemas.openxmlformats.org/package/2006/relationships',office='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
 const xml=value=>String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const document=body=>'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+body;
 zip.file('[Content_Types].xml',document(`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`));
 zip.file('_rels/.rels',document(`<Relationships xmlns="${rels}"><Relationship Id="rId1" Type="${office}/officeDocument" Target="xl/workbook.xml"/></Relationships>`));
 zip.file('xl/workbook.xml',document(`<workbook xmlns="${ns}" xmlns:r="${office}"><sheets>${sheets.map((sheet,i)=>`<sheet name="${xml(sheet.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`));
 zip.file('xl/_rels/workbook.xml.rels',document(`<Relationships xmlns="${rels}">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${office}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="styles" Type="${office}/styles" Target="styles.xml"/></Relationships>`));
 zip.file('xl/styles.xml',document(`<styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2455D9"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`));
 for(const [i,sheet] of sheets.entries()){
  const last=String.fromCharCode(64+sheet.widths.length)+sheet.rows.length;
  zip.file(`xl/worksheets/sheet${i+1}.xml`,document(`<worksheet xmlns="${ns}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="22"/><cols>${sheet.widths.map((width,c)=>`<col min="${c+1}" max="${c+1}" width="${width}" customWidth="1"/>`).join('')}</cols><sheetData>${sheet.rows.map((row,r)=>`<row r="${r+1}"${r===0?' ht="32" customHeight="1"':''}>${row.map((value,c)=>`<c r="${String.fromCharCode(65+c)}${r+1}" s="${r===0?1:0}"${typeof value==='number'?'':' t="inlineStr"'}>${typeof value==='number'?`<v>${value}</v>`:`<is><t xml:space="preserve">${xml(value)}</t></is>`}</c>`).join('')}</row>`).join('')}</sheetData>${i>0?`<autoFilter ref="A1:${last}"/>`:''}</worksheet>`));
 }
 return zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
