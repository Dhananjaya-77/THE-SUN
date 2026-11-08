import './platform.css'

type View = 'overview'|'solar'|'grid'|'batteries'|'controls'|'forecast'|'sites'|'iot'|'simulation'|'alerts'|'analytics'|'security'|'users'|'integrations'|'reports'|'ai'|'residential'

const sites = [
  {id:'SL-SOLAR-001',name:'Siyambalanduwa Solar Project',loc:'SIYAMBALANDUWA · EASTERN',pv:'0.72 MW',load:'0.18 MW',status:'Online',soc:0,battery:false,voltage:'400.7 V',capacity:'1 MW',annual:'1.6 GWh',commissioned:'2020',source:'SIMULATED'},
  {id:'SL-SOLAR-002',name:'Hambantota Solar Project',loc:'HAMBANTOTA · SOUTHERN',pv:'0.68 MW',load:'0.16 MW',status:'Online',soc:0,battery:false,voltage:'401.2 V',capacity:'1 MW',annual:'1.5 GWh',commissioned:'2020',source:'SIMULATED'},
  {id:'SL-SOLAR-003',name:'Pooneryn Solar Project',loc:'POONERYN · NORTHERN',pv:'0.74 MW',load:'0.17 MW',status:'Online',soc:0,battery:false,voltage:'401.6 V',capacity:'1 MW',annual:'1.6 GWh',commissioned:'2020',source:'SIMULATED'},
  {id:'SL-SOLAR-004',name:'Vavunathivu Solar Project',loc:'VAVUNATHIVU · EASTERN',pv:'1.36 MW',load:'0.34 MW',status:'Online',soc:0,battery:false,voltage:'402.1 V',capacity:'2 MW',annual:'3.3 GWh',commissioned:'2023',source:'SIMULATED'},
  {id:'SL-SOLAR-005',name:'Polonnaruwa Solar Project',loc:'POLONNARUWA · NORTH CENTRAL',pv:'2.64 MW',load:'0.52 MW',status:'Attention',soc:0,battery:false,voltage:'442.1 V',capacity:'4 MW',annual:'6.7 GWh',commissioned:'2024',source:'SIMULATED'},
]
const residentialHomes = [
  {id:'SL-HOME-00001',district:'Kandy',province:'Central',capacity:'5.0 kW',scheme:'NET_METERING',provider:'CEB',generation:'4.2 kW',consumption:'1.8 kW',export:'2.4 kW',battery:false,device:'Online'},
  {id:'SL-HOME-00002',district:'Kurunegala',province:'North Western',capacity:'5.0 kW',scheme:'NET_ACCOUNTING',provider:'CEB',generation:'3.8 kW',consumption:'2.1 kW',export:'1.7 kW',battery:false,device:'Online'},
  {id:'SL-HOME-00003',district:'Galle',province:'Southern',capacity:'4.0 kW',scheme:'NET_PLUS',provider:'LECO',generation:'3.2 kW',consumption:'1.6 kW',export:'1.6 kW',battery:true,device:'Online'},
  {id:'SL-HOME-00004',district:'Colombo',province:'Western',capacity:'8.0 kW',scheme:'NET_PLUS_PLUS',provider:'LECO',generation:'6.4 kW',consumption:'3.1 kW',export:'3.3 kW',battery:true,device:'Attention'},
]
const totals = 9.0
const icon=(name:string)=>({overview:'⌂',solar:'☀',grid:'⌁',batteries:'▰',controls:'⌘',forecast:'◫',sites:'◆',iot:'◉',simulation:'△',alerts:'!',analytics:'⌁',security:'◇',users:'♙',integrations:'↗',reports:'▤',ai:'✦',residential:'⌂'} as Record<string,string>)[name]
const chart=(vals:number[],color='#e69a43',h=120)=>{const max=Math.max(...vals)*1.08,min=Math.min(...vals)*.85;const pts=vals.map((v,i)=>`${i*100/(vals.length-1)},${h-(v-min)/(max-min)*h}`).join(' ');return `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" class="line-chart"><defs><linearGradient id="g${color.slice(1)}" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="0,${h} ${pts} 100,${h}" fill="url(#g${color.slice(1)})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`}
const metric=(label:string,value:string,detail:string,trend='',cls='')=>`<article class="metric ${cls}"><div class="metric-top"><span>${label}</span>${trend?`<b>${trend}</b>`:''}</div><strong>${value}</strong><small>${detail}</small></article>`
const labels={overview:'Overview',sites:'Solar Sites',solar:'Solar Management',grid:'Grid Management',batteries:'Battery Storage',controls:'Control Engine',forecast:'Forecasting',simulation:'Digital Twin',iot:'IoT & Devices',alerts:'Alerts',analytics:'Analytics',ai:'AI Intelligence',reports:'Reports',security:'Security & Audit',users:'User Management',integrations:'Integrations',residential:'Residential Solar'} as Record<View,string>
function nav(){const groups=[['CORE',['overview','sites','solar','grid']],['OPERATIONS',['batteries','controls','forecast','simulation','residential']],['PLATFORM',['iot','alerts','analytics','ai']],['ADMINISTRATION',['reports','security','users','integrations']]] as [string,View[]][];return groups.map(([g,items])=>`<div class="nav-group"><p>${g}</p>${items.map(v=>`<button class="nav-item" type="button" data-view="${v}" title="${labels[v]}" aria-label="${labels[v]}"><span class="nav-icon" aria-hidden="true">${icon(v)}</span><span class="nav-label">${labels[v]}</span></button>`).join('')}</div>`).join('')}
const shell=`<div class="app-shell"><aside class="sidebar"><div class="brand"><span class="sun-logo">☀</span><div><strong>THE SUN</strong><small>CENTRAL OPERATIONS</small></div></div><nav>${nav()}</nav><div class="connection"><i></i><div><b>Platform healthy</b><span>5 sites connected</span></div></div></aside><main><header><div><p class="crumb">CENTRAL MANAGEMENT SYSTEM</p><h1 id="pageTitle">Operator Overview</h1></div><div class="top-actions"><button class="live-pill"><i></i> LIVE</button><time id="clock"></time><div class="notification-menu"><button class="bell" aria-label="Notifications" title="Notifications" aria-expanded="false"><span class="bell-symbol" aria-hidden="true"><svg class="bell-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg></span><i>3</i></button><section class="notification-panel" aria-label="Notifications" hidden><div class="notification-head"><div><p>NOTIFICATIONS</p><h3>Recent updates</h3></div><button class="mark-read">Mark all read</button></div><div class="notification-list"></div><button class="notification-footer">View all alerts</button></section></div><div class="profile">AM</div></div></header><div class="viewport" id="viewport"></div></main></div><div class="dashboard-toast" role="status" aria-live="polite"></div>`
function overview(){return `<section class="metrics-grid">${metric('TOTAL GENERATION',`${totals.toFixed(1)} MW`,'315 MW simulated portfolio capacity','↑ 8.4%','orange')}${metric('ACTIVE POWER',`${totals-166.3|0} MW`,'Sri Lanka · five simulated feeders','+6.2%')}${metric('SYSTEM PERFORMANCE','94.2%','Fleet availability')}${metric('CO₂ AVOIDED','612 t','Estimated simulation value')}${metric('BATTERY SOC','75%','290 MWh simulated available','2 batteries','green')}</section><div class="section-row"><div><p class="section-kicker">SRI LANKA · SIMULATED PORTFOLIO</p><h2>Solar installations</h2></div><button class="secondary">View all sites →</button></div><section class="site-grid">${sites.map((s,i)=>`<article class="site-card"><div class="site-card-top"><div class="site-photo ${i===4?'photo-alert':''}"><img src="/solar-field.svg" alt="Sri Lankan solar installation"><span>${s.status}</span></div><button>•••</button></div><div class="site-card-body"><div class="site-title"><div><small>LK SITE ${s.id}</small><h3>${s.name}</h3></div><span class="status-dot"></span></div><p>${s.loc}</p><div class="site-values"><div><small>PV OUTPUT</small><strong>${s.pv}</strong></div><div><small>LOCAL LOAD</small><strong>${s.load}</strong></div></div><div class="power-track"><i style="width:${Number(s.pv)/90*100}%"></i></div><div class="site-foot"><span>${s.battery?'Battery':'Direct supply'}</span><b>${s.soc?`${s.soc}% SOC`:s.voltage}</b></div></div></article>`).join('')}</section><section class="two-col"><article class="panel energy-profile-panel"><div class="panel-head"><div><p>ENERGY PROFILE</p><h3>Generation & forecast</h3></div><select><option>Today</option><option>7 days</option><option>30 days</option></select></div><div class="energy-chart">${chart([12,18,31,52,74,91,86,68,52,48,32,18],'#e69a43',135)}<div class="axis energy-x-axis" aria-label="Energy profile time axis"><span>06:00</span><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span></div></div></article><article class="panel alarms"><div class="panel-head"><div><p>EVENT MONITOR</p><h3>Active alarms <span>3</span></h3></div><button class="link">View all</button></div>${alarm('critical','Polonnaruwa voltage constraint','442.1 V measured · simulated feeder limit 440 V','3 min')}${alarm('warning','Inverter efficiency low','Siyambalanduwa · INV-04 operating at 91%','18 min')}${alarm('info','Battery schedule updated','Hambantota · charge window approved','42 min')}</article></section>`}
const alarm=(type:string,title:string,detail:string,time:string)=>`<div class="alarm ${type}"><b>${type==='critical'?'!':type==='warning'?'△':'i'}</b><div><strong>${title}</strong><small>${detail}</small></div><time>${time}</time></div>`
const solarGallery=[
  {image:'/solar-siyambalanduwa.jpg',name:'Siyambalanduwa',type:'Utility-scale solar'},
  {image:'/solar-hambantota.jpg',name:'Hambantota',type:'Coastal solar fleet'},
  {image:'/solar-pooneryn.svg',name:'Pooneryn',type:'Northern solar field'},
  {image:'/solar-vavunathivu.svg',name:'Vavunathivu',type:'Eastern solar plant'},
  {image:'/solar-polonnaruwa.svg',name:'Polonnaruwa',type:'Central solar plant'}
]
function solar(){return `<div class="hero-band"><img src="/solar-field.svg" alt="Solar field"><div><p>SRI LANKA RENEWABLE PORTFOLIO</p><h2>9 MW commissioned reference fleet</h2><span>14.7 GWh combined reported annual energy · operating values simulated</span></div></div><section class="metrics-grid">${metric('COMMISSIONED FLEET','9 MW','Public reference capacity')}${metric('ANNUAL ENERGY','14.7 GWh','Reported combined generation')}${metric('VAVUNIA OUTPUT','3.3 GWh','Annual reference')}${metric('TRINCOMALEE','6.7 GWh','Largest selected plant')}</section><section class="panel solar-gallery"><div class="panel-head"><div><p>PLANT IMAGES</p><h3>Solar installations gallery</h3></div><span class="reference-badge">5 LOCATIONS</span></div><div class="solar-gallery-grid">${solarGallery.map(item=>`<article><img src="${item.image}" alt="${item.name} solar installation"><div><small>${item.type}</small><b>${item.name}</b></div></article>`).join('')}</div></section><section class="panel related-links"><div class="panel-head"><div><p>RELATED LINKS</p><h3>The Sun solar management</h3></div></div><div class="related-link-grid"><button type="button" data-view="overview"><span>⌂</span><div><b>The Sun overview</b><small>Portfolio performance</small></div></button><button type="button" data-view="sites"><span>◆</span><div><b>Solar sites</b><small>Installation portfolio</small></div></button><button type="button" data-view="grid"><span>⌁</span><div><b>Grid management</b><small>Network and constraints</small></div></button><button type="button" data-view="batteries"><span>▰</span><div><b>Battery storage</b><small>Fleet availability</small></div></button></div></section><section class="panel table-panel"><div class="panel-head"><div><p>PLANT REFERENCE DATA</p><h3>Commissioned installations</h3></div><span class="reference-badge">SIMULATED TELEMETRY</span></div><table><thead><tr><th>Installation</th><th>Capacity</th><th>Annual energy</th><th>Commissioned</th><th>Simulated output</th><th>Status</th></tr></thead><tbody>${sites.map(s=>`<tr><td><b>${s.name}</b><small>${s.loc}</small></td><td>${s.capacity}</td><td>${s.annual}</td><td>${s.commissioned}</td><td>${s.pv}</td><td><span class="table-status">${s.status}</span></td></tr>`).join('')}</tbody></table></section>`}
function grid(){return `<div class="title-banner"><div><p>NETWORK DIGITAL TWIN</p><h2>Distribution network</h2><span>20 kV medium-voltage source · 400 V site feeder</span></div><div class="network-health"><b>1</b><span>Constraint</span></div></div><section class="metrics-grid">${metric('BUS VOLTAGE','402.4 V','Fleet average')}${metric('MAX. VOLTAGE','442.1 V','Site 05 · 1.1 V above limit','Critical')}${metric('FEEDER LOAD','86.4%','Section 01 peak')}${metric('FREQUENCY','50.02 Hz','Within operating band')}${metric('POWER FACTOR','0.98','Lagging 0.03')}</section><section class="two-col"><article class="panel network-panel"><div class="panel-head"><div><p>ONE-LINE DIAGRAM</p><h3>Feeder topology</h3></div><span class="normal">Simulation converged</span></div><div class="feeder"><div class="source">UTILITY GRID<br><b>20 kV</b></div><div class="transformer">11/0.4 kV<br><b>250 kVA</b></div><div class="bus-line">${sites.map(s=>`<div class="network-node ${s.status==='Attention'?'danger':''}"><i></i><b>${s.id}</b><span>${s.voltage}</span></div>`).join('')}</div></div></article><article class="panel"><div class="panel-head"><div><p>CONSTRAINT CHECK</p><h3>Voltage profile</h3></div></div>${chart([400.7,401.4,402.1,402.8,442.1],'#dc755f',140)}<div class="constraint-list"><p><span>Nominal operating range</span><b>360–440 V</b></p><p><span>Violating node</span><b class="danger-text">Site 05</b></p><p><span>Recommended locality</span><b>Charge Site 04 battery</b></p></div></article></section>`}
function batteries(){return `<div class="title-banner battery-banner"><div><p>ENERGY STORAGE</p><h2>Battery fleet</h2><span>2 batteries · 280 kWh simulation capacity</span></div></div><section class="battery-grid">${sites.filter(s=>s.battery).map((s,i)=>`<article class="battery-card"><div class="battery-head"><div class="battery-icon">▰</div><div><small>SITE ${s.id}</small><h3>${s.name}</h3></div><span>Available</span></div><div class="soc-ring" style="--soc:${s.soc*3.6}deg"><b>${s.soc}%</b><small>SOC</small></div><div class="battery-data"><p><span>SOH</span><b>${97-i}%</b></p><p><span>Power limit</span><b>${60-i*5} kW</b></p><p><span>Temperature</span><b>${31+i}°C</b></p></div><button class="primary battery-action">Open schedule</button></article>`).join('')}<article class="battery-card schedule-card"><small>AUTOMATIC OPTIMIZATION</small><h3>Peak-shaving schedule</h3><div class="schedule-bars">${[32,38,45,62,78,84,71,55,42,35,49,68].map((v,i)=>`<i style="height:${v}%" class="${i>6&&i<10?'selected':''}"></i>`).join('')}</div><div class="schedule-times"><span>06:00</span><span>12:00</span><span>18:00</span></div><button class="secondary">Edit schedule</button></article></section>`}
function controls(){return `<div class="title-banner"><div><p>SAFE AUTOMATION</p><h2>Control decisions</h2><span>Simulation mode · all actions require operator authorization</span></div><label class="mode-switch"><input type="checkbox" checked><span></span> Approved simulation control</label></div><section class="control-layout"><article class="panel decision-main"><div class="panel-head"><div><p>RECOMMENDED ACTION</p><h3>Resolve Site 05 voltage constraint</h3></div><span class="ai-badge">AI assisted</span></div><div class="decision-flow"><div><b>1</b><span>CONSTRAINT<br><strong>442.1 V</strong></span></div><i>→</i><div><b>2</b><span>CANDIDATE<br><strong>Site 04 battery</strong></span></div><i>→</i><div><b>3</b><span>SETPOINT<br><strong>+18 kW charge</strong></span></div></div><p class="decision-copy">The model estimates that charging the Site 04 battery will reduce export at the constrained feeder location without exceeding its 85% reserve limit or the equipment power limit.</p><div class="decision-buttons"><button class="primary accept-control">Authorize simulation control</button><button class="secondary reject-control">Reject</button></div></article><article class="panel"><div class="panel-head"><div><p>SAFETY INTERLOCKS</p><h3>Pre-command checks</h3></div></div>${['Affected feeder topology identified','Battery available and below reserve limit','Command within configured power envelope','Affected bus constraint available','Operator permission verified'].map((x)=>`<div class="check-row"><b>✓</b><span>${x}</span><small>PASS</small></div>`).join('')}</article></section>`}
function reportWorkspace(view:View){
  const workspaces:Partial<Record<View,string[][]>>={
    overview:[['ISLAND OVERVIEW','Island generation','9 MW modeled fleet','Network health 94.2%'],['SCHEME MANAGEMENT','Residential connections','30 mock rooftop systems','4 billing schemes']],
    sites:[['ASSET REGISTRY','Utility and rooftop assets','5 utility plants','50 mock homes'],['SCHEME ADMINISTRATION','Connection evidence','Net Metering','Net Plus Plus']],
    grid:[['FEEDER SIMULATION','Voltage and thermal analysis','442.1 V peak bus','0 reverse-flow islands'],['HOSTING CAPACITY','Connection capacity scan','4 feeder candidates','Advisory only']],
    forecast:[['LOAD FORECAST','Behind-the-meter demand','428 MWh predicted','Confidence range ±7%'],['WEATHER INPUTS','Irradiance and cloud model','18.4 kW/m² peak','Sri Lanka time zone']],
    simulation:[['DIGITAL TWIN','Power-flow scenarios','98.6% convergence','Monte Carlo placement'],['CURTAILMENT STUDIO','Constraint response','+18 kW charge example','Safety interlocks active']],
    iot:[['DATA INGESTION','CSV, Excel, REST and replay','12 data streams','UTC normalized'],['DEVICE MANAGEMENT','Future IoT architecture','MQTT QoS 1 ready','Signed firmware OTA']],
    alerts:[['FAULT DETECTION','Anomaly operations','1 critical voltage event','2 inverter warnings'],['MAINTENANCE','Ticket lifecycle','3 open work orders','Cleaning due']],
    analytics:[['PERFORMANCE ANALYSIS','Portfolio KPIs','94.2% availability','612 t CO₂ avoided'],['CARBON REPORTING','Environmental impact','14.7 GWh annual','Fuel savings estimate']],
    ai:[['FORECAST MODELS','Generation and load','87% confidence','XGBoost ready'],['ANOMALY ENGINE','Health and performance','0 active anomalies','24 ms inference']],
    reports:[['REGULATORY EXPORTS','Operator-ready reports','PDF / CSV','CEB / LECO pack'],['REPORT SCHEDULE','Delivery calendar','Daily fleet summary','23:00 next run']],
    security:[['ACCESS CONTROL','Role-based permissions','6 active sessions','Site scope enforced'],['AUDIT TRAIL','Immutable activity','99.9% coverage','Review required']],
    users:[['ROLE MANAGEMENT','Operational access','4 operator roles','Least privilege'],['SITE SCOPE','Assigned regions and plants','Eastern district','Southern district']],
    integrations:[['SERVICE EXCHANGE','API and telemetry services','REST connected','MQTT connected'],['DATA VALIDATION','Time-series quality','Null check enabled','Duplicate removal enabled']],
    residential:[['SCHEME COMPARISON','Net Metering / Accounting','Net Plus / Net Plus Plus','Estimate savings'],['HOME SIZING','Recommended system capacity','5.0 kW reference','Battery economics']]
  }
  const cards=(workspaces[view]||[['DATA WORKSPACE','Validated operations','UTC time series','No public control']]).map((card,index)=>`
    <article class="report-feature-card">
      <div class="report-feature-index">0${index+1}</div>
      <p>${card[0]}</p>
      <h3>${card[1]}</h3>
      <div><span>${card[2]}</span><strong>${card[3]}</strong></div>
    </article>`).join('')
  return `<section class="report-workspace"><div class="report-workspace-head"><div><p>REPORT CAPABILITIES</p><h2>SolarGrid LK workspace</h2></div><span>Demo data · operational models advisory</span></div><div class="report-feature-grid">${cards}</div></section>`
}
function generic(view:View){
  const heading=labels[view]
  const modules={
    forecast:{primary:['87%','Forecast confidence'],stats:[['428 MWh','Predicted energy'],['18.4 kW/m²','Peak irradiance'],['3 h','Weather confidence window']],status:['Clear skies','Partly cloudy','Low irradiance'],actions:['Refresh forecast','Run weather model','Update assumptions']},
    iot:{primary:['5 / 5','Gateways online'],stats:[['184 ms','Telemetry latency'],['98.7%','Packet delivery'],['12','Active devices']],status:['Online','Degraded','Offline'],actions:['Scan devices','Restart gateways','Test telemetry']},
    alerts:{primary:['4','Open events'],stats:[['1','Critical'],['2','Warnings'],['8 min','Avg. response']],status:['Investigating','Acknowledged','Resolved'],actions:['Acknowledge alerts','Assign operator','Create incident']},
    analytics:{primary:['94.2%','Energy yield'],stats:[['612 t','CO₂ avoided'],['14.7 GWh','Annual energy'],['$42,680','Revenue estimate']],status:['Forecast','Actual','Variance'],actions:['Compare periods','Build KPI report','Export dataset']},
    simulation:{primary:['98.6%','Power-flow accuracy'],stats:[['442.1 V','Peak bus voltage'],['5','Sites simulated'],['0','Divergent states']],status:['Converged','Warning','Failed'],actions:['Run scenario','Save baseline','Load constraints']},
    ai:{primary:['87%','Forecast confidence'],stats:[['0','Detected anomalies'],['24 ms','Inference latency'],['Ready','Model status']],status:['Normal','Review','Action'],actions:['Run anomaly scan','Retrain model','Review recommendations']},
    reports:{primary:['24','Available reports'],stats:[['3','Generated today'],['23:00','Next schedule'],['PDF / CSV','Export formats']],status:['Scheduled','Generated','Archived'],actions:['Generate report','Schedule report','Export archive']},
    security:{primary:['6','Active sessions'],stats:[['0','Failed logins'],['99.9%','Audit coverage'],['09:41','Last audit']],status:['Verified','Review','Blocked'],actions:['Review audit log','Revoke sessions','Run security scan']},
    users:{primary:['9','Total users'],stats:[['4','Operators'],['2','Engineers'],['3','Read-only users']],status:['Active','Invited','Disabled'],actions:['Invite user','Manage roles','Disable selected']},
    integrations:{primary:['4 / 4','Services connected'],stats:[['REST','API status'],['MQTT','Broker status'],['Modbus TCP','Adapter status']],status:['Connected','Syncing','Attention'],actions:['Test connections','Sync services','Add integration']}
  } as Record<string,{primary:string[];stats:string[][];status:string[];actions:string[]}>
  const moduleData=modules[view] || {primary:['Operational','System status'],stats:[['100%','Availability'],['24 ms','Response time'],['0','Open issues']],status:['Healthy','Monitoring','Attention'],actions:['Refresh module','Run diagnostics','Configure module']}
  const {primary,stats,status}=moduleData
  const distribution=[72,18,10]
  return `<div class="module-hero"><div><p>PLATFORM MODULE · LIVE</p><h2>${heading}</h2><span>Operational telemetry, service health, and recent activity.</span></div><div class="module-hero-actions"><button class="secondary module-refresh">↻ Refresh</button><button class="primary module-export">Export report</button></div></div><section class="metrics-grid dashboard-metrics"><article class="metric featured-metric"><div class="metric-top"><span>${primary[1]}</span><b>Live</b></div><strong>${primary[0]}</strong><small>Current operational value</small></article>${stats.map(([value,label],index)=>`<article class="metric dashboard-stat"><div class="metric-top"><span>${label}</span><i class="stat-dot ${index===0?'orange':''}"></i></div><strong>${value}</strong><small>Last 24 hour summary</small></article>`).join('')}</section><section class="panel quick-actions-panel"><div class="panel-head"><div><p>QUICK ACTIONS</p><h3>${heading} functions</h3></div></div><div class="quick-actions">${moduleData.actions.map((action,index)=>`<button type="button" class="quick-action" data-module-action="${action}"><span>${index===0?'↻':index===1?'⌁':'⚙'}</span><div><b>${action}</b><small>Run from ${heading}</small></div></button>`).join('')}</div></section><section class="dashboard-grid"><article class="panel trend-panel"><div class="panel-head"><div><p>PERFORMANCE TREND</p><h3>${heading} activity</h3></div><select class="trend-range"><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></div>${chart([22,28,26,43,38,52,49,71,68,86,74,91],'#5a9b87',160)}<div class="axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div></article><article class="panel status-panel"><div class="panel-head"><div><p>SERVICE BREAKDOWN</p><h3>Current state</h3></div></div>${status.map((label,index)=>`<div class="status-row"><span><i class="status-level-${index}"></i>${label}</span><b>${distribution[index]}%</b><div><i style="width:${distribution[index]}%"></i></div></div>`).join('')}<button class="secondary module-action" data-module-action="View detailed report">View detailed report</button></article></section><section class="panel activity-panel"><div class="panel-head"><div><p>RECENT ACTIVITY</p><h3>${heading} event log</h3></div><button class="link module-export-log">Export log</button></div><div class="event-table"><div><b>09:42:18</b><span>${heading} state synchronized</span><small class="success">Successful</small></div><div><b>09:38:04</b><span>Configuration validation completed</span><small class="success">Successful</small></div><div><b>09:31:22</b><span>Telemetry integrity check completed</span><small class="success">Successful</small></div><div><b>09:18:46</b><span>Scheduled monitoring cycle</span><small>Completed</small></div></div></section>${reportWorkspace(view)}`
}
// Correct duplicate-looking mappings explicitly through the export object below.
const correctedViews:Record<View,()=>string>={
  overview,
  solar,
  grid,
  batteries,
  controls,
  forecast:()=>generic('forecast'),
  sites:()=>overview(),
  simulation:()=>generic('simulation'),
  iot:()=>generic('iot'),
  alerts:()=>generic('alerts'),
  analytics:()=>generic('analytics'),
  ai:()=>generic('ai'),
  reports:()=>generic('reports'),
  security:()=>generic('security'),
  users:()=>generic('users'),
  integrations:()=>generic('integrations'),
  residential:()=>residential()
}
const app=document.querySelector<HTMLDivElement>('#app')!; app.innerHTML=shell
function render(view:View){
  const content=document.querySelector<HTMLDivElement>('#viewport')!
  const dedicatedViews:View[]=['overview','solar','grid','batteries','controls','sites','residential']
  content.innerHTML=correctedViews[view]()+ (dedicatedViews.includes(view)?reportWorkspace(view==='sites'?'sites':view==='residential'?'residential':view):'')
  applySitePhotos()
  document.querySelector('#pageTitle')!.textContent=labels[view]
  document.querySelectorAll<HTMLButtonElement>('.nav-item').forEach(x=>{
    const active=x.dataset.view===view
    x.classList.toggle('active',active)
    x.setAttribute('aria-current',active?'page':'false')
  })
  bindControls()
}
let toastTimer:number|undefined
function showToast(message:string){
  const toast=document.querySelector<HTMLElement>('.dashboard-toast')
  if(!toast)return
  toast.textContent=message
  toast.classList.add('visible')
  window.clearTimeout(toastTimer)
  toastTimer=window.setTimeout(()=>toast.classList.remove('visible'),2400)
}
function exportDashboardLog(){
  const heading=document.querySelector('#pageTitle')?.textContent || 'The Sun'
  const rows=['timestamp,event,status','09:42:18,State synchronized,Successful','09:38:04,Configuration validation,Successful','09:31:22,Telemetry integrity check,Successful']
  const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const link=document.createElement('a')
  link.href=url
  link.download=`${heading.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-event-log.csv`
  link.click()
  URL.revokeObjectURL(url)
  showToast('Dashboard report exported')
}
function bindControls(){document.querySelector('.accept-control')?.addEventListener('click',e=>{const b=e.currentTarget as HTMLButtonElement;b.textContent='Simulation command approved ✓';b.classList.add('approved')});document.querySelector('.reject-control')?.addEventListener('click',()=>document.querySelector('.decision-main')?.classList.add('rejected'));document.querySelector('.battery-action')?.addEventListener('click',e=>{const b=e.currentTarget as HTMLButtonElement;b.textContent='Schedule opened ✓'});document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>{if(button.classList.contains('nav-item'))return;button.addEventListener('click',()=>render(button.dataset.view as View))});document.querySelectorAll<HTMLButtonElement>('[data-module-action]').forEach(button=>button.addEventListener('click',()=>showToast(`${button.dataset.moduleAction} started`)));document.querySelector('.module-refresh')?.addEventListener('click',e=>{const button=e.currentTarget as HTMLButtonElement;button.textContent='✓ Updated';setTimeout(()=>button.textContent='↻ Refresh',1200);showToast('Dashboard data refreshed')});document.querySelectorAll<HTMLButtonElement>('.module-export,.module-export-log').forEach(button=>button.addEventListener('click',()=>exportDashboardLog()));document.querySelector<HTMLSelectElement>('.trend-range')?.addEventListener('change',e=>showToast(`Trend updated to ${(e.currentTarget as HTMLSelectElement).selectedOptions[0]?.textContent || 'selected period'}`))}
type NotificationItem={id:number;type:'critical'|'warning'|'info';title:string;detail:string;time:string;view:View;read:boolean}
const notifications:NotificationItem[]=[
  {id:1,type:'critical',title:'Voltage limit exceeded',detail:'Trincomalee · 442.1 V measured',time:'3 min ago',view:'alerts',read:false},
  {id:2,type:'warning',title:'Inverter efficiency dropped',detail:'Polonnaruwa · INV-04 is at 91%',time:'18 min ago',view:'solar',read:false},
  {id:3,type:'info',title:'Battery schedule approved',detail:'Charge window starts at 22:30',time:'42 min ago',view:'batteries',read:false}
]
function renderNotifications(){
  const unread=notifications.filter(n=>!n.read).length
  const badge=document.querySelector('.bell i')
  if(badge)badge.textContent=String(unread)
  badge?.classList.toggle('empty',unread===0)
  const list=document.querySelector('.notification-list')
  if(list)list.innerHTML=notifications.map(n=>`<button class="notification-item ${n.type} ${n.read?'read':''}" data-notification="${n.id}"><b>${n.type==='critical'?'!':n.type==='warning'?'△':'i'}</b><span><strong>${n.title}</strong><small>${n.detail}</small><time>${n.time}</time></span></button>`).join('')
}
function bindNotifications(){
  const bell=document.querySelector<HTMLButtonElement>('.bell')
  const panel=document.querySelector<HTMLElement>('.notification-panel')
  if(!bell || !panel)return
  bell.addEventListener('click',(event)=>{
    event.stopPropagation()
    const willOpen=panel.hidden
    panel.hidden=!willOpen
    bell.setAttribute('aria-expanded',String(willOpen))
  })
  document.querySelector('.mark-read')?.addEventListener('click',()=>{
    notifications.forEach(n=>n.read=true)
    renderNotifications()
  })
  document.querySelector('.notification-list')?.addEventListener('click',e=>{
    const item=(e.target as HTMLElement).closest<HTMLElement>('[data-notification]')
    if(!item)return
    const notification=notifications.find(n=>n.id===Number(item.dataset.notification))
    if(notification){notification.read=true;renderNotifications();render(notification.view)}
    panel.hidden=true;bell.setAttribute('aria-expanded','false')
  })
  document.querySelector('.notification-footer')?.addEventListener('click',()=>{
    panel.hidden=true;bell.setAttribute('aria-expanded','false');render('alerts')
  })
  document.addEventListener('click',e=>{
    if(!(e.target as HTMLElement).closest('.notification-menu')){
      panel.hidden=true;bell.setAttribute('aria-expanded','false')
    }
  })
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!panel.hidden){
      panel.hidden=true
      bell.setAttribute('aria-expanded','false')
      bell.focus()
    }
  })
  renderNotifications()
}
function bindNavigation(){
  document.querySelectorAll<HTMLButtonElement>('.nav-item').forEach(button=>{
    button.addEventListener('click',()=>{
      const view=button.dataset.view as View
      if(view)render(view)
    })
  })
}
bindNavigation()

document.querySelector('.sidebar nav')?.addEventListener('click',event=>{
  const target=event.target as HTMLElement
  const button=target.closest<HTMLButtonElement>('.nav-item')
  if(!button?.dataset.view)return
  event.preventDefault()
  event.stopPropagation()
  render(button.dataset.view as View)
})
function clock(){const el=document.querySelector('#clock');if(el)el.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}clock();setInterval(clock,1000);render('overview')
bindNotifications()

const sitePhotos=['/solar-siyambalanduwa.jpg','/solar-hambantota.jpg','/solar-pooneryn.svg','/solar-vavunathivu.svg','/solar-polonnaruwa.svg']
function applySitePhotos(){
  document.querySelectorAll<HTMLImageElement>('.site-card .site-photo img').forEach((image,index)=>{
    if(index < sitePhotos.length) image.src = sitePhotos[index]
  })
}

// Overview is assembled below with publicly referenced plant information.
function residential(){return `<div class="data-source-note"><b>MOCK DATA</b><span>Homeowner and meter data are fictional simulations. No customer or live household telemetry is represented.</span></div><section class="metrics-grid">${metric('REGISTERED HOMES','50','Mock simulation homes')}${metric('HOMES WITH SOLAR','30','60% rooftop coverage')}${metric('INSTALLED SOLAR','150 kW','Mock rooftop capacity')}${metric('HOME BATTERIES','10','Mock battery fleet')}${metric('SOLAR GENERATION','17.6 kW','Illustrative current output')}</section><section class="section-row"><div><p class="section-kicker">HOUSEHOLD ENERGY</p><h2>Residential solar overview</h2></div><button class="secondary">Register home</button></section><section class="site-grid">${residentialHomes.map((h,i)=>`<article class="site-card" data-source="SIMULATED"><div class="site-card-top"><div class="site-photo"><img src="/solar-field.svg" alt="Residential solar simulation"><span>${h.device}</span></div></div><div class="site-card-body"><div class="site-title"><div><small>${h.id}</small><h3>Residential Site ${String(i+1).padStart(2,'0')}</h3></div><span class="status-dot"></span></div><p>${h.district.toUpperCase()} · ${h.provider} · ${h.scheme.replaceAll('_',' ')}</p><div class="site-values"><div><small>SOLAR</small><strong>${h.generation}</strong></div><div><small>CONSUMPTION</small><strong>${h.consumption}</strong></div></div><div class="site-foot"><span>${h.capacity} system</span><b>${h.export} export</b></div></div></article>`).join('')}</section><section class="two-col"><article class="panel"><div class="panel-head"><div><p>HOUSEHOLD PORTFOLIO</p><h3>Net scheme distribution</h3></div></div><div class="scheme-list"><p><span>Net Metering</span><b>12 homes</b></p><p><span>Net Accounting</span><b>8 homes</b></p><p><span>Net Plus</span><b>6 homes</b></p><p><span>Net Plus Plus</span><b>4 homes</b></p></div></article><article class="panel"><div class="panel-head"><div><p>RESIDENTIAL AI</p><h3>Daily insights</h3></div></div><div class="event-table"><div><b>09:40</b><span>Peak self-consumption recommended at 12:30</span><small>Simulation</small></div><div><b>09:15</b><span>Home battery schedules require review</span><small>Simulation</small></div><div><b>08:50</b><span>No abnormal generation detected</span><small>Healthy</small></div></div></article></section>`}
