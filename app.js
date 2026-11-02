/* CareLoop · entirely local, synthetic-data product prototype. No network calls. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {
    leaf:'<path d="M20 4C10 3 3 9 6 16c5 4 14 0 14-12Z"/><path d="m4 21 11-12M10 16v-5m0 5h5"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    shield:'<path d="M12 3 3.5 6.5V12c0 5 8.5 9 8.5 9s8.5-4 8.5-9V6.5Z"/><path d="m8 12 3 3 5-6"/>',
    report:'<path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Z"/><path d="M14 2v7h7M7 17v-3m5 3v-6m5 6v-3"/>',
    wallet:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M17 5V3H5a2 2 0 0 0-2 2m18 6h-6v5h6"/><path d="M17 13.5h.01"/>',
    form:'<rect x="4" y="3" width="16" height="19" rx="2"/><path d="M9 3V1h6v2M8 9h8M8 13h8M8 17h4"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    down:'<path d="m6 9 6 6 6-6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7m0-11v1"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-12 12h6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    reset:'<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
    activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    trend:'<path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    book:'<path d="M12 5v16M12 5C8 2 4 3 2 4v16c3-2 7-2 10 1 3-3 7-3 10-1V4c-3-1-7-2-10 1Z"/>'
  };
  function icon(name, size=18) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.grid}</svg>`; }
  const STORE = 'careloop-demo-v1';
  const FIXED_DATE = '2026-11-02';
  const names = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
  const seedTexts = [
    '屏幕上的数字很清楚，希望说明书的字号可以更大一点。',
    '按键比较小，第一次使用时需要家属帮助，后来可以自己操作。',
    '还没有开始使用，目前只看过说明书。',
    '携带比较方便，暂时没有其他意见。',
    '操作步骤容易理解，希望增加语音提示。',
    '绑带有点难固定，家属协助后可以使用。',
    '每天都能找到记录入口，整体使用顺利。',
    '不记得具体型号，包装已经收起来了。',
    '显示效果挺好，目前没有遇到操作困难。',
    '使用时经常要重新看说明书，希望有更简短的步骤图。',
    '外出携带比较轻便，按钮的标识还能再明显一些。',
    '还没有填写完，稍后继续。'
  ];
  function seed() {
    const statuses=['approved','pending','pending','approved','approved','returned','approved','pending','approved','approved','approved','incomplete'];
    return { version:1, rules:{logic:true, duration:true, missing:true, duplicate:true}, records:statuses.map((status,i)=>({
      id:`CL-${String(i+1).padStart(3,'0')}`,participant:`P-${String(i+1).padStart(3,'0')}`,label:`参与者${names[i]}`,round:i%3===0?'基线记录':'第 1 次随访',
      date:`2026-11-0${i%2+1}`,time:`${9+i%8}:${i%2?'35':'12'}`,used:i===2?'no':'yes',product:i===7?'unknown':'M-01',frequency:i===2?'2':'1',rating:i===2?'3':String(3+i%3),
      text:seedTexts[i],by:i===5?'家属协助':'本人填写',consent:true,consentVersion:'V1.0',status,seconds:i===1?18:160+i*9,
      paid:i<3?'paid':i===11?'none':'registered',amount:20,source:i===7?'仅患者自述':'资格已核对 · 患者自述',
      history:[{at:`2026-11-0${i%2+1} ${9+i%8}:${i%2?'35':'12'}`,text:'参与者提交记录 · 授权说明 V1.0'},...(status==='approved'?[{at:'2026-11-02 14:20',text:'演示项目人员完成记录复核；主观感受保持原文'}]:status==='returned'?[{at:'2026-11-02 14:30',text:'请求补充型号信息；已告知不影响负面反馈的保留'}]:[])]
    })), activity:[{text:'体验反馈模板 V1.0 已启用',at:'11月02日 09:00'}] };
  }
  let state;
  try { state=JSON.parse(localStorage.getItem(STORE)); } catch (_) { /* file mode/private browsing fallback */ }
  if (!state || state.version!==1 || !Array.isArray(state.records)) state=seed();
  let page='overview', role='staff', filter='all', search='', toastTimer, draft={}, formStarted=Date.now(), lastFocus=null;
  try { draft=JSON.parse(localStorage.getItem(STORE+'-draft')) || {}; } catch (_) {}
  const statusText={approved:'已复核',pending:'待复核',returned:'待补充',incomplete:'草稿'};
  const statusColor={approved:'',pending:'amber',returned:'blue',incomplete:'gray'};
  const navs=[['overview','grid','项目概览'],['project','folder','随访项目'],['records','users','参与者与记录'],['quality','shield','数据质控'],['reports','report','企业报告'],['payouts','wallet','酬谢台账'],['patient','form','患者填写体验']];
  const titles={overview:'项目概览',project:'随访项目',records:'参与者与记录',quality:'数据质控',reports:'企业报告',payouts:'酬谢台账',patient:'患者填写体验'};
  function save() { try { localStorage.setItem(STORE,JSON.stringify(state)); } catch (_) { toast('当前浏览器不支持保存，记录仅在本次演示有效'); } }
  function stamp() { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date()); }
  function toast(message) { $('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200); }
  function badge(text, color='') { return `<span class="badge ${color}"><i class="dot"></i>${esc(text)}</span>`; }
  function flags(r) {
    const f=[];
    if(state.rules.logic && r.eventDate && r.eventDate>r.date) f.push({title:'事件日期晚于提交日期',text:'请核对是否误选日期；提交时间不等于实际发生时间。'});
    if(state.rules.logic && r.used==='no' && ((r.rating && r.rating!=='na') || Number(r.frequency)>0)) f.push({title:'使用状态与体验记录待确认',text:'选择了“尚未使用”，同时填写了使用次数或体验评分。可能是在描述既往使用，请先澄清。'});
    if(state.rules.duration && r.seconds<30) f.push({title:'填写时间较短',text:`本条演示记录用时 ${r.seconds} 秒，低于演示阈值30秒。仅提示复核，不据此认定乱填。实际阈值需要试填校准。`});
    if(state.rules.missing && r.product==='unknown') f.push({title:'产品型号尚未核实',text:'参与者选择了“不清楚”。仅影响型号相关分析，主观反馈仍予保留。'});
    return f;
  }
  const stats = () => {
    const submitted=state.records.filter(r=>r.status!=='incomplete');
    return {total:state.records.length,submitted:submitted.length,approved:submitted.filter(r=>r.status==='approved').length,pending:submitted.filter(r=>r.status==='pending').length,returned:submitted.filter(r=>r.status==='returned').length,flagged:submitted.filter(r=>flags(r).length).length};
  };
  function go(next) { if(next==='patient' && page!=='patient') formStarted=Date.now(); if(role==='enterprise' && !['reports','project'].includes(next)) next='reports';if(role==='patient')next='patient';page=next;filter='all';search='';render();window.scrollTo({top:0,behavior:'instant'}); }
  function render() {
    const s=stats(); document.title=`循访 CareLoop · ${titles[page]}`;
    const visibleNav=role==='enterprise'?navs.filter(n=>['reports','project'].includes(n[0])):role==='patient'?navs.filter(n=>n[0]==='patient'):navs;
    $('#app').innerHTML=`<div class="shell"><aside class="sidebar" aria-label="主要导航"><a class="brand" href="#" data-action="home"><div class="brand-mark">${icon('leaf',25)}</div><div><div class="brand-title">循访</div><div class="brand-sub">CARELOOP</div></div></a><div class="workspace-label">${role==='staff'?'项目工作空间':role==='enterprise'?'企业交付空间':'我的随访空间'}</div><nav class="nav">${visibleNav.map(([id,ic,name])=>`<button type="button" data-page="${id}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${icon(ic)}<span>${name}</span>${id==='quality'&&s.pending?`<span class="nav-count">${s.pending}</span>`:''}</button>`).join('')}</nav><div class="sidebar-footer"><div class="project-note"><span class="sprout">${icon('leaf',52)}</span><b>让每一份反馈，有迹可循。</b><p>从患者的真实表达出发，<br>把每一次随访认真记录。</p></div><div class="profile"><div class="avatar">${role==='staff'?'研':role==='enterprise'?'企':'患'}</div><div><strong>${role==='staff'?'演示项目组':role==='enterprise'?'演示合作企业':'演示参与者'}</strong><small>CareLoop · MVP 0.1</small></div></div></div></aside><div class="content"><header class="topbar"><div class="breadcrumb"><button class="icon-btn mobile-nav-toggle" data-action="mobile-nav" aria-label="打开导航">${icon('menu')}</button><span class="crumb-home">工作空间</span><span class="crumb-chevron">/</span><b>${titles[page]}</b></div><div class="top-actions"><span class="demo-pill">本地演示 · 模拟数据</span><div class="role-select">${icon('users',16)}<select aria-label="切换演示角色" id="role-select"><option value="staff" ${role==='staff'?'selected':''}>项目人员视角</option><option value="patient" ${role==='patient'?'selected':''}>患者视角</option><option value="enterprise" ${role==='enterprise'?'selected':''}>企业视角</option></select></div><button class="icon-btn" data-action="tour" aria-label="演示指南">${icon('help',17)}</button></div></header><main class="main animate-in" id="main" tabindex="-1">${({overview,project:projectPage,records:recordsPage,quality:qualityPage,reports:reportsPage,payouts:payoutsPage,patient:patientPage}[page])()}<footer class="footer"><span>循访 CareLoop　/　让患者反馈更有价值</span><span>全部信息为虚构示例 · 不用于真实患者或诊疗　 <button class="tiny-link" data-action="reset">重置演示</button></span></footer></main></div></div>`;
    if(page==='patient') hydrateForm();
  }
  function heading(title,desc,actions='') {return `<div class="page-heading"><div><h1>${title}</h1><p>${desc}</p></div><div class="heading-actions">${actions}</div></div>`;}
  function statCard(title,value,unit,ic,foot,accent=false) {return `<div class="stat"><div class="stat-top"><span>${title}</span><div class="stat-icon">${icon(ic,16)}</div></div><div class="stat-value num">${value}<span>${unit}</span></div><div class="stat-foot">${accent?`<span class="up">${icon('trend',12)}</span>`:''}${foot}</div></div>`;}
  function overview() {
    const s=stats(),rate=s.submitted?Math.round(s.approved/s.submitted*100):0;
    return `${heading('把每一次随访，连接起来。','你好，项目组。这里是你的随访工作台。',`<span class="date-chip">${icon('calendar',14)}2026年11月02日 · 演示日期</span><button class="button primary" data-action="tour">${icon('eye',15)}开始产品演示</button>`)}
      <section class="hero"><div><div class="eyebrow">PATIENT VOICES. BETTER INSIGHTS.</div><h2>从一份真实表达，到一份可信反馈。</h2><p>连接患者记录、专业复核与产品洞察。让每一份信息都有来源，<br>让每一次使用体验都能被认真听见。</p><button class="hero-link text-action" data-page="project">查看当前随访项目 ${icon('arrow',16)}</button></div><div class="hero-graphic" aria-hidden="true"><div class="orbit"><div class="center-mark">${icon('leaf',50)}</div></div><div class="floating one">${icon('shield',18)}来源清楚，反馈可循</div><div class="floating two">${icon('check',18)}专业复核 · 保留原意</div><div class="floating three">+</div></div></section>
      <section class="stats" aria-label="项目统计">${statCard('参与者记录',s.total,'份','users','项目 CL-2026-001')}${statCard('已提交随访',s.submitted,'份','form','草稿不计入提交',true)}${statCard('等待人工复核',s.pending,'份','shield','先核对，再决定使用范围')}${statCard('已完成复核',s.approved,'份','check',`占已提交记录 ${rate}%`,true)}</section>
      <div class="grid-main"><section class="card"><div class="card-head"><h2>随访收集进度</h2><div class="legend"><span><i class="dot"></i>已提交</span><span><i class="dot pale"></i>已复核</span></div></div><div class="card-body"><div class="chart-wrap"><div class="chart-y"><span>12</span><span>8</span><span>4</span><span>0</span></div><svg class="chart" viewBox="0 0 580 164" preserveAspectRatio="none" role="img" aria-label="示例趋势，10月28日至11月2日提交记录持续增加"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7ba777" stop-opacity=".20"/><stop offset="100%" stop-color="#7ba777" stop-opacity=".01"/></linearGradient></defs><g stroke="#edf1e9" stroke-dasharray="3 4"><path d="M0 1H580M0 54H580M0 108H580M0 162H580"/></g><path d="M0 142C45 142 70 123 116 123S183 102 232 101S300 79 348 72S411 53 464 45S531 32 580 18V164H0Z" fill="url(#chartFill)"/><path d="M0 142C45 142 70 123 116 123S183 102 232 101S300 79 348 72S411 53 464 45S531 32 580 18" fill="none" stroke="#638b62" stroke-width="2.5"/><path d="M0 155C50 155 70 142 116 142S180 130 232 128S300 112 348 108S420 88 464 83S535 71 580 68" fill="none" stroke="#bbcfab" stroke-width="2.5"/><circle cx="464" cy="45" r="4" fill="#638b62" stroke="white" stroke-width="2"/></svg><div class="chart-labels"><span>10.28</span><span>10.29</span><span>10.30</span><span>10.31</span><span>11.01</span><span>11.02</span></div></div><div class="chart-note"><span>趋势为预置演示示意；上方统计随操作更新</span><strong>持续收集 · 分轮跟进</strong></div></div></section>
      <section class="card"><div class="card-head"><h2>记录复核分布</h2><button class="text-action" data-page="quality">查看质控 ${icon('arrow',13)}</button></div><div class="card-body"><div class="quality-layout"><div class="donut" style="background:conic-gradient(#80a478 0 ${rate}%,#e7c88a ${rate}% ${s.submitted?Math.round((s.approved+s.pending)/s.submitted*100):0}%,#c0d3db 0 100%)"><div class="donut-content"><b class="num">${rate}<small style="display:inline;font-size:14px">%</small></b><small>记录已复核</small></div></div><div class="quality-list"><div><i class="dot" style="background:#80a478"></i>已复核<strong>${s.approved}</strong></div><div><i class="dot" style="background:#e7c88a"></i>待复核<strong>${s.pending}</strong></div><div><i class="dot" style="background:#c0d3db"></i>待补充<strong>${s.returned}</strong></div></div></div><div class="quality-foot">${icon('info',14)}<span>复核状态反映处理进度，不代表患者感受的真实性评分。</span></div></div></section></div>
      <section class="card"><div class="card-head"><div><h2>最近随访记录</h2><small>居家护理产品体验随访 · 第一阶段</small></div><button class="text-action" data-page="records">全部记录 ${icon('arrow',13)}</button></div>${table(state.records.filter(r=>r.status!=='incomplete').slice(-5).reverse())}<div class="table-footer"><span>仅展示参与编号，不含真实身份信息</span><span>项目进行中 ${icon('leaf',12)}</span></div></section>`;
  }
  function table(rows,quality=false) {
    return `<div class="table-scroll"><table><thead><tr><th>参与者 / 记录编号</th><th>随访轮次</th><th>提交时间</th><th>${quality?'待确认事项':'信息来源'}</th><th>复核状态</th><th>操作</th></tr></thead><tbody>${rows.map(r=>`<tr><td><div class="record-person"><span class="mini-avatar">${icon('users',13)}</span><div><strong style="font-weight:500">${esc(r.participant)}</strong><div class="cell-sub">${esc(r.id)}</div></div></div></td><td>${esc(r.round)}</td><td class="num">${esc(r.date)}<div class="cell-sub">${esc(r.time)}</div></td><td>${quality?(flags(r).length?badge(`${flags(r).length} 项待确认`,'amber'):'—'):`<span>${esc(r.by)}</span><div class="cell-sub">${r.source.includes('资格已核对')?'资格已核对':r.product==='unknown'?'型号待确认':'患者自述 · 未核验'}</div>`}</td><td>${badge(statusText[r.status],statusColor[r.status])}</td><td><button class="text-action" data-open="${r.id}">${r.status==='pending'?'查看与复核':'查看详情'} ${icon('arrow',12)}</button></td></tr>`).join('')}</tbody></table>${rows.length?'':`<div class="empty">${icon('search',30)}<strong>没有符合条件的记录</strong>试试其他状态或参与编号。</div>`}</div>`;
  }
  function filteredRows(quality=false) {
    return state.records.filter(r=>(!quality||r.status!=='incomplete')&&(filter==='all'||(filter==='flagged'?flags(r).length>0:r.status===filter))&&(!search||`${r.participant} ${r.id}`.toLowerCase().includes(search.toLowerCase()))).slice().reverse();
  }
  function tableControls() {return `<div class="table-tools"><label class="search-box">${icon('search',14)}<input id="record-search" aria-label="搜索参与编号或记录编号" placeholder="搜索参与编号、记录编号" value="${esc(search)}"></label><select class="filter-select" id="status-filter" aria-label="筛选记录状态">${[['all','全部状态'],['pending','待复核'],['approved','已复核'],['returned','待补充'],['flagged','有待确认事项']].map(([v,l])=>`<option value="${v}" ${filter===v?'selected':''}>${l}</option>`).join('')}</select></div>`;}
  function recordsPage() {
    return `${heading('参与者与记录','把每一份表达，连同它的来源一起保存。',`<button class="button" data-action="export-records">${icon('download',15)}导出模拟记录</button><button class="button primary" data-page="patient">${icon('plus',15)}新增体验记录</button>`)}<div class="intro-line">${icon('shield',17)}<span>当前项目只展示参与编号。本人填写、协助填写与更正历史分别保留。</span></div><section class="card"><div class="card-head"><h2>项目记录</h2><small>${state.records.length} 份模拟记录</small></div>${tableControls()}<div id="record-table">${table(filteredRows())}</div></section>`;
  }
  function qualityPage() {
    const s=stats();
    return `${heading('数据质控','技术发现待确认事项，人工保留患者原意。',`<button class="button" data-action="recheck">${icon('reset',15)}重新检查</button>`)}<section class="stats">${statCard('待复核记录',s.pending,'份','shield','请先澄清，再决定使用范围')}${statCard('存在待确认事项',s.flagged,'份','info','可能是缺失、理解差异或补录')}${statCard('已请求补充',s.returned,'份','clock','保留已有反馈，不覆盖原文')}${statCard('已完成复核',s.approved,'份','check','复核不等于临床证实')}</section><div class="review-grid"><section class="card"><div class="card-head"><h2>复核工作台</h2><small>点击记录查看原文与处理历史</small></div>${tableControls()}<div id="record-table">${table(filteredRows(true),true)}</div></section><div class="stack"><section class="card"><div class="card-head"><h2>质控规则</h2><small>演示可切换</small></div><div class="rule-list">${[['logic','填写逻辑','使用状态与次数、体验保持可解释'],['duration','填写时间','过短仅提示，不自动排除'],['missing','信息缺失','不清楚的信息单独标记'],['duplicate','重复提交','同一参与者每轮保留一份记录']].map(([k,t,d])=>`<div class="rule-item"><div><h3>${t}</h3><p>${d}</p></div><button class="switch ${state.rules[k]?'on':''}" role="switch" aria-checked="${state.rules[k]}" aria-label="${t}检查" data-rule="${k}"></button></div>`).join('')}</div><div class="card-body" style="padding-top:12px"><div class="quality-foot">${icon('info',14)}<span>规则标记不会自动删记录，也不会自动取消酬谢。</span></div></div></section><section class="card"><div class="card-head"><h2>一份记录的复核旅程</h2></div><div class="flow-list">${[['保留原始提交','记下填写方式与提交时间'],['解释待确认事项','优先澄清，不推断患者动机'],['人工确认使用范围','必要时请求补充与更正'],['留下处理依据','版本、意见与原文一起留存']].map(([t,d],i)=>`<div class="flow-item"><span class="flow-num">${i+1}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div></section></div></div>`;
  }
  function patientPage() {
    return `${heading('每一份体验，都值得被听见。','参与者端示例 · 请使用虚构信息体验填写流程。',`<button class="button" data-action="sample-conflict">${icon('activity',15)}试试矛盾记录</button>`)}<div class="split"><section class="card form-card"><form id="patient-form"><div class="form-section"><div class="form-title"><span class="number-label">01</span><h2>这次记录属于你</h2><small>项目 CL-2026-001</small></div><div class="fields"><div class="field"><label for="participant">参与编号<span class="req">*</span></label><input id="participant" name="participant" value="P-013" required pattern="P-[0-9]{3,5}" title="格式为P-加3至5位数字" maxlength="7"><span class="hint">演示使用 P-013，不需要填写姓名或手机号。</span></div><div class="field"><label for="round">本次随访<span class="req">*</span></label><select id="round" name="round"><option>第 1 次随访</option><option>第 2 次随访</option><option>基线记录</option></select></div><div class="field full"><span class="field-label">实际填写者</span><div class="radio-group"><label class="radio-option"><input type="radio" name="by" value="本人填写" checked>本人填写</label><label class="radio-option"><input type="radio" name="by" value="家属协助">家属协助</label></div></div></div></div>
      <div class="form-section"><div class="form-title"><span class="number-label">02</span><h2>记录已有的使用情况</h2><small>以过去24小时为例</small></div><div class="fields"><div class="field"><label for="product">产品型号</label><select id="product" name="product"><option value="M-01">居家监测设备 M-01（模拟）</option><option value="M-02">居家监测设备 M-02（模拟）</option><option value="unknown">不清楚</option></select></div><div class="field"><label for="event-date">使用情况对应日期</label><input type="date" id="event-date" name="date" value="${FIXED_DATE}"></div><div class="field full"><span class="field-label">你在这段时间使用过吗？<span class="req">*</span></span><div class="radio-group"><label class="radio-option"><input type="radio" name="used" value="yes" checked>已经使用</label><label class="radio-option"><input type="radio" name="used" value="no">尚未使用</label><label class="radio-option"><input type="radio" name="used" value="unknown">记不清了</label></div></div><div class="field"><label for="frequency">实际使用次数</label><select id="frequency" name="frequency"><option value="1">1 次</option><option value="0">0 次</option><option value="2">2 次</option><option value="3">3 次及以上</option><option value="unknown">不清楚</option></select></div><div class="field"><span class="field-label">本次操作体验</span><div class="scale">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="rating" value="${v}" ${v===4?'checked':''}>${v}</label>`).join('')}</div><div class="scale-ends"><span>很困难</span><span>很顺利</span></div><label class="check-label"><input type="radio" name="rating" value="na">尚未使用 / 无法评价</label></div></div></div>
      <div class="form-section"><div class="form-title"><span class="number-label">03</span><h2>说说你的感受</h2></div><div class="field"><label for="experience">有什么困难、变化或改进建议？<span class="req">*</span></label><textarea id="experience" name="text" required maxlength="500" placeholder="例如：按键比较小，第一次使用时需要家人帮助。也可以写没有困难，或不清楚。"></textarea><span class="hint">正面、负面和不确定的感受都可以如实填写。请勿填写真实身份或健康隐私。</span></div></div><div id="form-feedback" aria-live="polite"></div><label class="check-label"><input type="checkbox" name="consent" required><span>我已阅读并同意本次 <button type="button" class="text-action" data-action="consent">参与说明与信息使用范围 V1.0</button>，自愿提交这份模拟记录。</span></label><div class="form-footer"><button type="button" class="button" data-action="save-draft">保存草稿</button><button type="submit" class="button primary">检查并提交 ${icon('arrow',15)}</button></div></form></section>
      <div class="stack"><div class="phone-card"><div class="phone-screen"><div class="phone-island"></div><div class="phone-greeting">你好，演示参与者</div><div class="phone-title">今天，感觉怎么样？</div><div class="phone-hero"><span class="eyebrow">MY FOLLOW-UP</span><h3 style="margin-top:6px">居家护理产品体验随访</h3><p>一份记录，让体验被看见。</p>${icon('leaf',85)}</div><div class="phone-task"><div class="stat-icon">${icon('form',17)}</div><div><h3>第 1 次随访</h3><small>待填写 · 可以稍后继续</small></div></div><div style="margin-top:20px;display:flex;justify-content:space-between"><span class="muted" style="font-size:10px">本轮参与酬谢</span><span style="color:#658958;font-size:12px">¥ 20.00</span></div><p class="hint" style="margin-top:7px">按参与规则核对，不以评价好坏为条件。</p><div class="phone-bottom"><span>我的随访</span><span>历史记录</span><span>参与说明</span></div></div></div><div class="side-help"><h3>真实表达，比“填对答案”更重要。</h3><p>记不清可以选“不清楚”，没有使用可以如实选择，负面感受也会被保留。</p><p>这里展示的是记录工具，不提供诊断或用药建议。</p></div></div></div>`;
  }
  function reportsPage() {
    const approved=state.records.filter(r=>r.status==='approved'), submitted=state.records.filter(r=>r.status!=='incomplete'), rated=approved.filter(r=>r.used==='yes'&&r.rating!=='na'&&Number(r.rating)>0), counts=[1,2,3,4,5].map(n=>rated.filter(r=>Number(r.rating)===n).length);
    return `${heading('从反馈，看到下一步。','企业视角 · 当前只展示项目汇总与经复核的模拟反馈。',`<button class="button" data-action="export-report">${icon('download',15)}下载演示报告</button><button class="button primary" data-action="print-report">${icon('report',15)}打印 / 保存 PDF</button>`)}<div class="split"><section class="card"><div class="report-header"><div><div class="eyebrow">EXPERIENCE INSIGHTS / 01</div><h2>居家护理产品体验随访简报</h2><p>阶段：首次体验与操作困难　·　样本为模拟数据</p></div><div class="report-number">CL-2026-001<br>报告日期 2026.11.02<br>仅用于产品演示</div></div><div class="report-section"><h3>01　样本与处理范围</h3><div class="metric-row"><div><small>已提交记录</small><b class="num">${submitted.length}<em>份</em></b></div><div><small>已复核纳入</small><b class="num">${approved.length}<em>份</em></b></div><div><small>可评价操作体验</small><b class="num">${rated.length}<em>份</em></b></div></div><p class="hint" style="margin-top:17px">草稿、待复核及待补充记录未计入下方分布；不代表其反馈虚假。</p></div><div class="report-section"><h3>02　操作体验分布</h3>${[5,4,3,2,1].map(n=>`<div class="bar-item"><span>${n} 分 · ${['','很困难','较困难','一般','较顺利','很顺利'][n]}</span><div class="bar-track"><div class="bar-fill" style="width:${rated.length?counts[n-1]/rated.length*100:0}%"></div></div><span class="num">${counts[n-1]} 份</span></div>`).join('')}<p class="hint" style="margin-top:18px">这是患者自述的操作体验，不能换算成产品疗效。</p></div><div class="report-section"><h3>03　用户声音</h3>${approved.length?approved.slice(-2).map(r=>`<div class="quote" style="margin-bottom:12px">“${esc(r.text)}”<small>${esc(r.id)} · ${esc(r.by)} · 已完成记录复核（非临床证实）</small></div>`).join(''):'<p class="muted">暂无已复核反馈。</p>'}</div><div class="report-section"><h3>04　数据说明与局限</h3><p style="font-size:11px;color:#879a7b;line-height:2">本报告全部记录均为虚构。复核仅演示记录完整性与一致性处理，不是对患者感受真实性的裁定。样本不具备真实人群代表性，不能用于临床结论、商业决策或AI模型效果证明。实际项目需另行落实参与授权、机构安排和交付范围。</p></div></section><div class="stack"><section class="card"><div class="card-head"><h2>交付范围清单</h2>${icon('shield',17)}</div><div class="card-body" style="padding-top:8px">${['项目范围内的汇总数据','经复核的模拟体验反馈','统计口径与缺失说明','报告版本与生成记录'].map(t=>`<div class="check-item">${icon('check',16)}<span>${t}</span></div>`).join('')}<div class="quality-foot">${icon('info',14)}<span>不含身份、联系方式及未获许可的资料。角色切换仅为前端演示，不是真实权限系统。</span></div></div></section><section class="card"><div class="card-head"><h2>从这里继续</h2></div><div class="card-body"><p style="font-size:11px;color:#8d9d80;line-height:1.9">企业可以先确认需要回答的产品问题，再与项目方共同定义对象、字段和验收要求。</p><button class="button" style="margin-top:17px;width:100%" data-action="delivery-scope">查看项目交付说明 ${icon('arrow',14)}</button></div></section></div></div>`;
  }
  function payoutsPage() {
    const rows=state.records.filter(r=>r.status!=='incomplete'),paid=rows.filter(r=>r.paid==='paid'),unpaid=rows.filter(r=>r.paid!=='paid');
    return `${heading('每一份参与，都认真对待。','酬谢与反馈内容分开处理；本页只更改模拟台账，不产生真实付款。',`<button class="button" data-action="export-payouts">${icon('download',15)}导出台账</button>`)}<section class="stats">${statCard('登记酬谢',rows.reduce((a,r)=>a+r.amount,0),'元','wallet','每轮模拟金额 ¥20')}${statCard('已登记发放',paid.reduce((a,r)=>a+r.amount,0),'元','check',`${paid.length} 笔模拟记录`)}${statCard('等待核对与发放',unpaid.reduce((a,r)=>a+r.amount,0),'元','clock','由人员单独确认支付情况')}${statCard('预算余额',1000-paid.reduce((a,r)=>a+r.amount,0),'元','folder','演示项目预算 ¥1,000')}</section><div class="intro-line">${icon('info',17)}<span>负面反馈、“不清楚”和待补充状态不会自动取消酬谢。发放状态与数据复核状态分别保留。</span></div><section class="card"><div class="card-head"><h2>参与酬谢台账</h2><small>不采集银行卡或支付账号</small></div><div class="table-scroll"><table><thead><tr><th>参与编号</th><th>关联记录 / 轮次</th><th>应发金额</th><th>复核状态</th><th>发放状态</th><th>操作</th></tr></thead><tbody>${rows.slice().reverse().map(r=>`<tr><td>${esc(r.participant)}</td><td>${esc(r.id)}<div class="cell-sub">${esc(r.round)}</div></td><td class="num">¥ ${r.amount.toFixed(2)}</td><td>${badge(statusText[r.status],statusColor[r.status])}</td><td>${badge(r.paid==='paid'?'已登记发放':'待核对发放',r.paid==='paid'?'':'amber')}</td><td>${r.paid==='paid'?'<span class="muted">已完成模拟登记</span>':`<button class="text-action" data-pay="${r.id}">登记发放 ${icon('arrow',12)}</button>`}</td></tr>`).join('')}</tbody></table></div></section>`;
  }
  function projectPage() {
    return `${heading('一个项目，一段持续的倾听。','先把人群、目的和使用范围说清楚。',`<button class="button" data-action="delivery-scope">${icon('book',15)}查看交付说明</button>${role==='staff'?`<button class="button primary" data-action="invite">${icon('plus',15)}生成演示邀请</button>`:''}`)}<section class="card"><div class="project-cover"><span class="badge">进行中 · 模拟项目</span><h2>居家护理产品体验随访</h2><p class="muted" style="margin-top:10px;font-size:12px">围绕操作体验、使用困难与改进建议，开展分轮记录。</p></div><div class="project-details"><div><div class="detail-label">项目编号</div><div class="detail-value">CL-2026-001</div></div><div><div class="detail-label">项目执行方</div><div class="detail-value">演示项目组（不代表任何医疗机构）</div></div><div><div class="detail-label">参与对象</div><div class="detail-value">已有相关产品使用经验的成人 · 虚构样本</div></div><div><div class="detail-label">产品范围</div><div class="detail-value">居家监测设备 M-01 / M-02 · 模拟型号</div></div><div><div class="detail-label">记录安排</div><div class="detail-value">基线记录 → 第1次随访 → 第2次随访</div></div><div><div class="detail-label">模板与参与说明</div><div class="detail-value">体验问卷 V1.0 / 参与说明 V1.0</div></div><div><div class="detail-label">数据使用目的</div><div class="detail-value">演示产品体验分析流程，不用于诊疗或训练</div></div><div><div class="detail-label">酬谢规则示例</div><div class="detail-value">每轮 ¥20，按参与规则核对，不以好评为条件</div></div></div></section><div class="grid-main" style="margin-top:22px"><section class="card"><div class="card-head"><h2>项目流程</h2></div><div class="flow-list">${[['明确项目与对象','先确认数据用途、字段与交付要求'],['定向邀请与自愿参与','保留参与说明版本和填写方式'],['及时记录与复核','规则检查、补充说明及原文留存'],['形成范围清楚的交付','汇总、质量标签与局限一起呈现']].map(([t,d],i)=>`<div class="flow-item"><span class="flow-num">${i+1}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div></section><section class="card"><div class="card-head"><h2>本地原型范围</h2></div><div class="card-body"><p style="font-size:12px;color:#819774;line-height:2">支持角色展示、模拟填写、规则提示、人工复核、报告与台账导出。所有操作保存在当前浏览器中。</p><div class="quality-foot" style="margin-top:18px">${icon('info',15)}<span>本原型没有真实登录、后端、身份核验或付款功能。不得输入真实患者信息。</span></div></div></section></div>`;
  }
  function showOverlay(html, modal=false) {
    lastFocus=document.activeElement;
    $('#overlay-root').innerHTML=`<div class="scrim ${modal?'modal-scrim':''}" data-action="dismiss-scrim"><section class="${modal?'modal':'drawer'}" role="dialog" aria-modal="true" aria-label="${modal?'演示说明':'记录详情与复核'}">${html}</section></div>`;
    document.body.style.overflow='hidden';
    $('#overlay-root').querySelector('button,input,textarea,select')?.focus();
  }
  function closeOverlay() { $('#overlay-root').innerHTML='';document.body.style.overflow='';if(lastFocus?.isConnected)lastFocus.focus(); }
  function modal(title,body,actions='<button class="button primary" data-action="close-overlay">知道了</button>') {showOverlay(`<h2>${title}</h2>${body}<footer>${actions}</footer>`,true);}
  function showRecord(id) {
    const r=state.records.find(r=>r.id===id);if(!r)return;
    const fs=flags(r),usedText={yes:'已经使用',no:'尚未使用',unknown:'记不清'};
    showOverlay(`<div class="drawer-header"><div><small>RECORD REVIEW / ${esc(r.id)}</small><h2>听见反馈，也看见来源。</h2></div><button class="icon-btn" aria-label="关闭记录详情" data-action="close-overlay">${icon('close',17)}</button></div><div class="drawer-body"><div class="drawer-section" style="display:flex;gap:8px">${badge(statusText[r.status],statusColor[r.status])}${badge('模拟数据','gray')}</div><div class="drawer-section"><h3>记录信息</h3>${[['参与编号',r.participant],['随访轮次',r.round],['实际填写者',r.by],['提交时间',`${r.date} ${r.time}`],['情况对应日期',r.eventDate||r.date],['参与说明',`${r.consentVersion} · 已确认`],['使用情况',usedText[r.used]],['产品型号',r.product==='unknown'?'不清楚':r.product],['实际使用次数',r.frequency==='unknown'?'不清楚':`${r.frequency} 次`],['操作体验',r.rating==='na'?'无法评价':`${r.rating} / 5`]].map(([k,v])=>`<div class="kv"><span>${k}</span><span>${esc(v)}</span></div>`).join('')}</div><div class="drawer-section"><h3>患者原始表达</h3><div class="source-quote">${esc(r.text)}</div></div><div class="drawer-section"><h3>待确认事项 ${fs.length?`· ${fs.length}`:''}</h3>${fs.length?fs.map(f=>`<div class="flag"><b>${esc(f.title)}</b>${esc(f.text)}</div>`).join(''):'<div class="quality-foot">当前规则未发现待确认事项。这不等于记录中的事实均已核实。</div>'}</div>${r.status!=='incomplete'?`<div class="drawer-section"><h3>人工处理意见</h3><textarea class="review-note" id="review-note" placeholder="例如：已向参与者确认是在描述既往使用，本次保留反馈并请求补充时间。"></textarea><div class="drawer-actions"><button class="button primary" data-review="approve" data-id="${r.id}">${icon('check',15)}完成记录复核</button><button class="button" data-review="return" data-id="${r.id}">请求补充说明</button></div><p class="hint" style="margin-top:10px">完成复核不自动解除待确认事项，不自动发放或取消酬谢。</p></div>`:''}<div class="drawer-section"><h3>更正与处理历史</h3>${r.history.slice().reverse().map(h=>`<div class="history-item">${esc(h.text)}<small>${esc(h.at)}</small></div>`).join('')}</div></div>`);
  }
  function readForm() { const f=$('#patient-form');return f?Object.fromEntries(new FormData(f).entries()):{}; }
  function hydrateForm() {
    const f=$('#patient-form');
    for(const [key,value] of Object.entries(draft)) {
      const field=f.elements.namedItem(key); if(!field)continue;
      if(key==='consent'){field.checked=value==='on';continue;}
      if(field instanceof RadioNodeList)field.value=value;else field.value=value;
    }
  }
  function draftSave() {draft=readForm();try{localStorage.setItem(STORE+'-draft',JSON.stringify(draft));}catch(_){}toast('草稿已保存在当前浏览器');}
  function submitPatient(event) {
    event.preventDefault();const data=readForm();
    if(!data.text.trim()){toast('请补充体验，或如实填写“不清楚”');$('#experience').focus();return;}
    const duplicate=state.records.find(r=>r.participant===data.participant&&r.round===data.round&&r.status!=='incomplete');
    if(duplicate && state.rules.duplicate) { $('#form-feedback').innerHTML=`<div class="form-alert"><h3>这轮已经有一份记录</h3>参与编号 ${esc(data.participant)} 已提交「${esc(data.round)}」。演示中请更换编号或轮次，已有记录可在工作台查看。</div>`;$('#form-feedback').scrollIntoView({block:'center',behavior:'smooth'});return; }
    const candidate={...data,eventDate:data.date,date:stamp().slice(0,10),seconds:Math.max(1,Math.round((Date.now()-formStarted)/1000))};
    const fs=flags(candidate);
    const body=`<p>本次检查发现 ${fs.length} 项待确认事项。你可以回去核对，也可以如实提交，由项目人员后续澄清。</p>${fs.map(f=>`<div class="flag"><b>${esc(f.title)}</b>${esc(f.text)}</div>`).join('')}<p style="margin-top:12px">提交不会产生真实诊疗记录或付款。</p>`;
    modal(fs.length?'有些内容，我们一起确认。':'准备好提交这份体验了吗？',body,`<button class="button" data-action="close-overlay">返回核对</button><button class="button primary" data-action="confirm-submit">确认提交模拟记录</button>`);
    draft={...candidate};
  }
  function confirmSubmit() {
    const r={...draft,eventDate:draft.date,date:stamp().slice(0,10),id:`CL-${String(Math.max(0,...state.records.map(x=>Number(x.id.slice(3))||0))+1).padStart(3,'0')}`,label:'演示参与者',time:stamp().slice(-5),consent:true,consentVersion:'V1.0',status:'pending',paid:'registered',amount:20,source:'仅患者自述',history:[{at:stamp(),text:'参与者提交模拟记录 · 参与说明 V1.0'}]};
    state.records.push(r);state.activity.push({text:`${r.id} 已提交，等待人工复核`,at:stamp()});save();draft={};try{localStorage.removeItem(STORE+'-draft');}catch(_){}closeOverlay();formStarted=Date.now();
    modal('谢谢，这份反馈已被记录。',`<p>记录编号：<strong>${r.id}</strong></p><p>状态：待复核。待确认事项会随原始表达一起保存。你可以切换到项目人员视角，在数据质控中继续演示处理。</p>`,`<button class="button" data-action="continue-patient">继续填写体验</button><button class="button primary" data-action="review-new">去工作台复核</button>`);
  }
  function download(name, content, type='text/plain;charset=utf-8') { const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function csvCell(value) {let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
  function csvDownload(name,rows){download(name,'\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('已导出模拟数据文件');}
  function exportReport() {
    const approved=state.records.filter(r=>r.status==='approved');
    const text=`循访 CareLoop · 产品演示报告\n项目：CL-2026-001 居家护理产品体验随访\n生成时间：${stamp()}\n数据性质：全部为虚构模拟数据\n已提交记录：${stats().submitted}份\n已复核记录：${approved.length}份\n\n用户反馈\n${approved.map(r=>`${r.id}（${r.by}）：${r.text}`).join('\n')}\n\n口径与局限\n只纳入已复核记录。复核不代表临床证实。角色展示不是实际权限保护。本报告不用于真实商业分析、诊疗或模型效果验证。\n`;
    download('CareLoop-模拟项目报告.txt',text);toast('演示报告已下载');
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('button,a[data-action],.scrim[data-action]');if(!button)return;
    if(button.dataset.page){go(button.dataset.page);return;}
    if(button.dataset.open){showRecord(button.dataset.open);return;}
    if(button.dataset.rule){state.rules[button.dataset.rule]=!state.rules[button.dataset.rule];save();render();toast('规则已更新，待确认标签已重新计算');return;}
    if(button.dataset.review){
      const r=state.records.find(x=>x.id===button.dataset.id),note=$('#review-note').value.trim();
      if(!note){toast('请填写处理依据，保留复核过程');$('#review-note').focus();return;}
      r.status=button.dataset.review==='approve'?'approved':'returned';r.history.push({at:stamp(),text:`${r.status==='approved'?'完成人工记录复核':'请求补充说明'}：${note}`});save();closeOverlay();render();toast('处理状态已更新；原文与酬谢状态保持不变');return;
    }
    if(button.dataset.pay){
      const r=state.records.find(x=>x.id===button.dataset.pay);
      modal('登记一笔模拟发放',`<p>参与编号 ${esc(r.participant)}，关联记录 ${esc(r.id)}，金额 ¥${r.amount.toFixed(2)}。</p><p>这里只把演示台账标记为“已登记发放”，不连接支付渠道，也不收集支付账户。</p>`,`<button class="button" data-action="close-overlay">取消</button><button class="button primary" data-action="confirm-pay" data-id="${r.id}">确认模拟登记</button>`);return;
    }
    const action=button.dataset.action;if(!action)return;
    if(action==='home'){e.preventDefault();go('overview');}
    else if(action==='mobile-nav')$('.sidebar').classList.toggle('mobile-open');
    else if(action==='dismiss-scrim'){if(e.target===button)closeOverlay();}
    else if(action==='close-overlay')closeOverlay();
    else if(action==='tour')modal('用一份记录，演示整个产品。',`<p>循访把患者记录、数据质控和企业洞察连接起来。所有数据都是虚构的，操作仅保存于当前浏览器。</p>${[['患者填写','新增一份体验；试试“尚未使用”却填写体验评分。'],['数据质控','查看待确认事项，填写人工意见，完成复核或请求补充。'],['企业报告','查看已复核样本的汇总，下载报告或打印为PDF。'],['酬谢台账','独立登记模拟酬谢；体验好坏不直接决定发放。']].map(([t,d],i)=>`<div class="tour-step"><span class="flow-num">${i+1}</span><div><strong>${t}</strong><p>${d}</p></div></div>`).join('')}`,`<button class="button" data-action="close-overlay">先看看工作台</button><button class="button primary" data-action="start-patient">从患者填写开始 ${icon('arrow',15)}</button>`);
    else if(action==='start-patient'){closeOverlay();role='patient';go('patient');}
    else if(action==='continue-patient'){closeOverlay();go('patient');}
    else if(action==='review-new'){closeOverlay();role='staff';go('quality');}
    else if(action==='consent')modal('参与说明与信息使用范围 V1.0','<p><strong>这是一份产品演示，不是真实研究招募。</strong>请只输入虚构信息，不输入姓名、联系方式、病历或其他个人健康资料。</p><p>模拟项目收集产品使用情况、操作体验和补充描述，用于展示质控、人工复核和报告流程。企业视角展示项目汇总及部分已复核的模拟反馈。</p><p>所有输入仅保存在当前浏览器。你可以通过“重置演示”清除本原型保存在此浏览器的数据。没有实际信息授权、身份验证、研究参与或支付发生。</p><p>实际项目的接收方、用途、保存期限、参与报酬及退出方式需另行依法明确，本说明不能用作真实患者知情同意书。</p>');
    else if(action==='save-draft')draftSave();
    else if(action==='confirm-submit')confirmSubmit();
    else if(action==='sample-conflict'){
      draft={...readForm(),used:'no',frequency:'2',rating:'4',text:'这两天使用后感觉操作比较顺手，但前面把使用状态选成了尚未使用。'};hydrateForm();toast('已填入矛盾示例；勾选参与说明后提交，查看质控提示');
    }
    else if(action==='recheck'){render();toast('已按当前启用规则重新检查；没有自动删除记录');}
    else if(action==='export-records'){csvDownload('CareLoop-模拟记录.csv',[['记录编号','参与编号','轮次','日期','填写者','复核状态','待确认项数','产品型号','使用状态','体验评分','原始描述','数据性质'],...filteredRows().map(r=>[r.id,r.participant,r.round,r.date,r.by,statusText[r.status],flags(r).length,r.product,r.used,r.rating,r.text,'虚构模拟数据'])]);}
    else if(action==='export-payouts'){csvDownload('CareLoop-模拟酬谢台账.csv',[['参与编号','关联记录','金额','复核状态','发放状态','数据性质'],...state.records.filter(r=>r.status!=='incomplete').map(r=>[r.participant,r.id,r.amount,statusText[r.status],r.paid==='paid'?'已登记发放':'待核对发放','虚构模拟数据'])]);}
    else if(action==='export-report')exportReport();
    else if(action==='print-report')window.print();
    else if(action==='confirm-pay'){const r=state.records.find(x=>x.id===button.dataset.id);if(r.paid==='paid'){closeOverlay();toast('该记录已登记，请勿重复操作');return;}r.paid='paid';r.history.push({at:stamp(),text:'独立登记模拟酬谢发放 ¥20；未产生真实付款'});save();closeOverlay();render();toast('模拟发放已登记，复核状态未改变');}
    else if(action==='delivery-scope')modal('先说清楚，再交付。','<p><strong>当前示例交付：</strong>项目内已复核的模拟操作体验分布、模拟用户反馈、统计口径和局限说明。</p><p><strong>不包含：</strong>患者身份、联系方式、病历原件、待核实的临床结论或未经约定的训练用途。</p><p>真实项目需要在采集前明确接收方、用途、对象条件、字段、质量标准与相关授权。本演示不意味着已经获得医院合作、患者授权或企业订单。</p>');
    else if(action==='invite')modal('演示项目邀请','<p>项目：居家护理产品体验随访<br>项目编号：CL-2026-001<br>示例邀请码：<strong>DEMO-001</strong></p><p>此邀请码只用于展示招募流程，没有真实的资格验证功能。可以直接切换患者视角体验。</p>',`<button class="button" data-action="close-overlay">关闭</button><button class="button primary" data-action="start-patient">进入患者视角</button>`);
    else if(action==='reset')modal('重新开始这次演示？','<p>这会清除本原型在当前浏览器保存的填写内容、复核操作和台账变更，并恢复初始模拟记录。</p>',`<button class="button" data-action="close-overlay">保留当前内容</button><button class="button primary" data-action="confirm-reset">重置演示数据</button>`);
    else if(action==='confirm-reset'){state=seed();draft={};try{localStorage.removeItem(STORE+'-draft');}catch(_){}save();closeOverlay();render();toast('已恢复初始模拟数据');}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='role-select'){role=e.target.value;go(role==='enterprise'?'reports':role==='patient'?'patient':'overview');}
    else if(e.target.id==='status-filter'){filter=e.target.value;$('#record-table').innerHTML=table(filteredRows(page==='quality'),page==='quality');}
  });
  document.addEventListener('input',e=>{if(e.target.id==='record-search'){search=e.target.value;$('#record-table').innerHTML=table(filteredRows(page==='quality'),page==='quality');}});
  document.addEventListener('submit',e=>{if(e.target.id==='patient-form')submitPatient(e);});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeOverlay();$('.sidebar')?.classList.remove('mobile-open');}
    if(e.key==='Tab' && $('#overlay-root').firstChild){const focusable=Array.from($('#overlay-root').querySelectorAll('button,input,textarea,select,a[href]')).filter(x=>!x.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
  render();
})();
