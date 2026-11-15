import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  Modal, Linking, Alert, StatusBar, Platform
} from 'react-native';
import data from './src/data/demoData.json';
import { C } from './src/theme';
import { Card, Pill, Metric, ProgressBar, LineChart, BarChart, ActionButton, SectionTitle } from './src/components/UI';

const yt = 'https://www.youtube.com/@CatProducts';
const zones = ['Zone A','Zone B','Zone C','Zone D','Zone E'];

function toneForHealth(h){ return h>=82?'good':h>=68?'warn':'danger'; }
function toneForSeverity(s){ return s==='Critical'?'danger':s==='Warning'?'warn':'info'; }
function fmt(n){ return Number(n).toLocaleString(); }

function Header({title, subtitle, onLogout, role}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>SITESENSE</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSub}>{subtitle}</Text>}
      </View>
      <Pressable onPress={onLogout} style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>{role} · Exit</Text>
      </Pressable>
    </View>
  );
}

function BottomTabs({tab,setTab,items}) {
  return (
    <View style={styles.tabs}>
      {items.map(it=>{
        const active=tab===it.key;
        return <Pressable key={it.key} onPress={()=>setTab(it.key)} style={styles.tab}>
          <View style={[styles.tabDot,active&&styles.tabDotActive]} />
          <Text style={[styles.tabText,active&&styles.tabTextActive]}>{it.label}</Text>
        </Pressable>
      })}
    </View>
  );
}

function Login({onLogin}) {
  const [role,setRole]=useState('Operator');
  const [machineId,setMachineId]=useState('EXC003');
  const [operatorId,setOperatorId]=useState('OP1079');
  const machineIds=data.machines.map(m=>m.id);
  const selected=data.machines.find(m=>m.id===machineId) || data.machines[0];

  useEffect(()=>{
    if (selected?.operatorId) setOperatorId(selected.operatorId);
  },[machineId]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content"/>
      <ScrollView contentContainerStyle={styles.loginWrap}>
        <View style={styles.mark}><Text style={styles.markText}>S</Text></View>
        <Text style={styles.loginBrand}>SiteSense</Text>
        <Text style={styles.loginTag}>Safety + productivity command companion</Text>

        <Card style={{width:'100%',marginTop:28}}>
          <Text style={styles.inputLabel}>Choose dashboard</Text>
          <View style={styles.segment}>
            {['Operator','Supervisor'].map(r=><Pressable key={r} onPress={()=>setRole(r)} style={[styles.segmentBtn,role===r&&styles.segmentActive]}>
              <Text style={[styles.segmentText,role===r&&styles.segmentTextActive]}>{r}</Text>
            </Pressable>)}
          </View>

          {role==='Operator' && <>
            <Text style={[styles.inputLabel,{marginTop:18}]}>Operator ID</Text>
            <TextInput value={operatorId} onChangeText={setOperatorId} placeholder="OP1079" placeholderTextColor={C.muted} style={styles.input}/>
            <Text style={[styles.inputLabel,{marginTop:14}]}>Machine ID</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:3}}>
              {machineIds.slice(0,24).map(id=><Pressable key={id} onPress={()=>setMachineId(id)} style={[styles.machineChip,machineId===id&&styles.machineChipActive]}>
                <Text style={[styles.machineChipText,machineId===id&&{color:C.bg}]}>{id}</Text>
              </Pressable>)}
            </ScrollView>
            <View style={styles.machinePreview}>
              <View>
                <Text style={styles.previewTitle}>{selected.type} · {selected.id}</Text>
                <Text style={styles.previewSub}>{selected.zone} · {fmt(selected.engineHours)} engine h</Text>
              </View>
              <Pill label={`${selected.health}% health`} tone={toneForHealth(selected.health)}/>
            </View>
          </>}

          {role==='Supervisor' && <View style={styles.superLoginBox}>
            <Text style={styles.previewTitle}>Demo command access</Text>
            <Text style={styles.previewSub}>Fleet, crew, tasks, alerts, analytics and assignments.</Text>
          </View>}

          <View style={{height:18}}/>
          <ActionButton label={`Enter ${role} dashboard`} onPress={()=>onLogin({role,machineId,operatorId})}/>
        </Card>

        <Text style={styles.sourceNote}>Offline-first hackathon demo · analytics generated from the supplied 100k-row datasets</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function OperatorHome({machine,operatorId,tasks,alerts,setTab}) {
  const myTasks=tasks.filter(t=>t.machineId===machine.id || t.operatorId===operatorId);
  const active=myTasks.find(t=>t.status==='In Progress') || myTasks[0];
  const risk = Math.min(95, Math.round(machine.alertRatePct*3.2 + machine.seatbeltViolationPct*1.6 + (100-machine.health)*0.6));
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Card style={styles.briefing}>
      <View style={styles.rowBetween}><Text style={styles.eyebrow}>AI MORNING BRIEFING</Text><Pill label="Demo intelligence" tone="info"/></View>
      <Text style={styles.briefingTitle}>Ready to operate — with two checks.</Text>
      <Text style={styles.body}>Machine {machine.id} is at {machine.health}% health. Focus on seatbelt compliance, keep idle time below {Math.max(20,Math.round(machine.avgIdling))} min, and watch {machine.zone} for live safety alerts.</Text>
      <View style={styles.inlineActions}>
        <ActionButton label="View tasks" onPress={()=>setTab('tasks')} kind="secondary"/>
        <ActionButton label="Safety pulse" onPress={()=>setTab('machine')}/>
      </View>
    </Card>

    <View style={styles.metricGrid}>
      <Metric label="Machine health" value={`${machine.health}%`} sub={machine.status} tone={toneForHealth(machine.health)}/>
      <Metric label="Safety risk" value={`${risk}%`} sub={`${machine.alertRatePct}% alert history`} tone={risk>55?'warn':'good'}/>
      <Metric label="Engine hours" value={fmt(machine.engineHours)} sub={`Service in ~${machine.serviceInHours} h`}/>
      <Metric label="Avg idling" value={`${machine.avgIdling}m`} sub="Per telemetry interval" tone={machine.avgIdling>28?'warn':'good'}/>
    </View>

    <SectionTitle title="Current work"/>
    {active ? <Card>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{active.title}</Text><Pill label={active.status} tone={active.status==='In Progress'?'good':'info'}/></View>
      <Text style={styles.cardMeta}>{active.type} · {active.zone} · est. {active.estimatedMin} min</Text>
      <View style={{height:12}}/><ProgressBar value={active.progress || 0}/><Text style={styles.progressText}>{active.progress||0}% complete</Text>
    </Card> : <Card><Text style={styles.body}>No task is currently assigned to this machine.</Text></Card>}

    <SectionTitle title="Live safety"/>
    {alerts.slice(0,2).map(a=><Card key={a.id} style={{marginBottom:10}}>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{a.title}</Text><Pill label={a.severity} tone={toneForSeverity(a.severity)}/></View>
      <Text style={styles.cardMeta}>{a.machineId} · {a.time}</Text><Text style={[styles.body,{marginTop:8}]}>{a.detail}</Text>
    </Card>)}

    <SectionTitle title="Shift pulse"/>
    <Card>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>Workload + fatigue preview</Text><Pill label="Innovative" tone="info"/></View>
      <Text style={styles.body}>Combines hours worked, idling, weather exposure and safety events into a simple fatigue guardrail. In the production architecture this can trigger smarter break recommendations.</Text>
      <View style={{height:14}}/><ProgressBar value={38} color={C.green}/><Text style={styles.progressText}>Fatigue score 38 / 100 · Low</Text>
    </Card>
  </ScrollView>;
}

function OperatorMachine({machine,live}) {
  const trend=data.trends[machine.id] || {fuel:[machine.avgFuel],idling:[machine.avgIdling],load:[machine.avgLoadCycles]};
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Card style={styles.machineHero}>
      <View style={styles.rowBetween}>
        <View><Text style={styles.eyebrow}>MACHINE DIGITAL CARD</Text><Text style={styles.heroMachine}>{machine.id}</Text><Text style={styles.previewSub}>{machine.type} · {machine.zone}</Text></View>
        <View style={styles.healthRing}><Text style={styles.healthBig}>{live.health}</Text><Text style={styles.healthPct}>%</Text></View>
      </View>
      <View style={{height:16}}/><ProgressBar value={live.health} color={live.health>80?C.green:C.orange}/>
    </Card>

    <View style={styles.metricGrid}>
      <Metric label="Fuel now" value={`${live.fuel.toFixed(1)} L`} sub={`Dataset avg ${machine.avgFuel} L`}/>
      <Metric label="Load cycles" value={`${Math.round(live.load)}`} sub={`Dataset avg ${machine.avgLoadCycles}`}/>
      <Metric label="Idle time" value={`${Math.round(live.idle)}m`} sub="Simulated live feed" tone={live.idle>30?'warn':'good'}/>
      <Metric label="Service window" value={`${machine.serviceInHours}h`} sub="Predictive slot"/>
    </View>

    <SectionTitle title="Fuel trend"/>
    <Card><LineChart data={[...trend.fuel.slice(-10),Number(live.fuel.toFixed(1))]} suffix="L"/></Card>
    <SectionTitle title="Idle trend"/>
    <Card><LineChart data={[...trend.idling.slice(-10),Math.round(live.idle)]} stroke={C.orange} suffix="m"/></Card>

    <SectionTitle title="Operator safety pulse"/>
    <Card>
      <Text style={styles.cardTitle}>Behaviour score: {Math.max(55, Math.round(100-machine.alertRatePct*2-machine.seatbeltViolationPct))}/100</Text>
      <Text style={[styles.body,{marginTop:8}]}>Built from alert frequency, seatbelt compliance and machine-use patterns. The blueprint keeps safety logic deterministic and uses AI only to explain the reasons.</Text>
    </Card>
  </ScrollView>;
}

function OperatorTasks({machine,operatorId,tasks,setTasks}) {
  const my=tasks.filter(t=>t.machineId===machine.id || t.operatorId===operatorId);
  const update=(id,status)=>setTasks(ts=>ts.map(t=>t.id===id?{...t,status,progress:status==='In Progress'?Math.max(5,t.progress||0):t.progress}:t));
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>Assigned work</Text>
    <Text style={styles.pageSub}>Supervisor assignments appear here immediately during the demo.</Text>
    {my.length===0 && <Card><Text style={styles.body}>No tasks assigned yet. Switch to Supervisor → Assign and create one for {machine.id}.</Text></Card>}
    {my.map(t=><Card key={t.id} style={{marginBottom:12}}>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{t.title}</Text><Pill label={t.priority} tone={t.priority==='High'?'danger':t.priority==='Medium'?'warn':'info'}/></View>
      <Text style={styles.cardMeta}>{t.id} · {t.type} · {t.zone}</Text>
      <Text style={[styles.body,{marginTop:8}]}>Estimated {t.estimatedMin} min · Machine {t.machineId}</Text>
      <View style={{height:12}}/><ProgressBar value={t.progress||0}/>
      <View style={[styles.inlineActions,{marginTop:12}]}>
        {t.status!=='In Progress' && <ActionButton label="Start" onPress={()=>update(t.id,'In Progress')}/>}
        {t.status==='In Progress' && <ActionButton label="Complete" onPress={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,status:'Completed',progress:100}:x))}/>}
        <Pill label={t.status} tone={t.status==='Completed'?'good':t.status==='Blocked'?'danger':'info'}/>
      </View>
    </Card>)}
  </ScrollView>;
}

function LearnScreen({machine}) {
  const modules=[
    ['Excavator Safety','Pre-operation checks, swing radius and safe startup.'],
    ['Blind Spot Awareness','Spot rear and swing-side risks around heavy equipment.'],
    ['Hydraulic System Basics','Recognize pressure loss, leaks and escalation steps.'],
    ['Emergency Procedures','SOS flow, muster response and incident reporting.'],
    ['Safe Digging Practices','Zones, weather, ground condition and stop-work rules.']
  ];
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>Learning hub</Text>
    <Text style={styles.pageSub}>Personalised recommendation for {machine.id}: Blind Spot Awareness.</Text>
    <Card style={styles.recommended}>
      <Pill label="Recommended next" tone="warn"/>
      <Text style={[styles.cardTitle,{fontSize:20,marginTop:12}]}>Blind Spot Awareness</Text>
      <Text style={[styles.body,{marginTop:8}]}>Triggered by the machine's safety-alert history. In the full architecture, near-misses and quiz gaps continuously update this recommendation.</Text>
      <View style={{height:14}}/><ActionButton label="Open Caterpillar YouTube channel" onPress={()=>Linking.openURL(yt)}/>
    </Card>
    <SectionTitle title="Micro-learning"/>
    {modules.map(([name,desc],i)=><Card key={name} style={{marginBottom:10}}>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{name}</Text><Pill label={`${6+i*2} min`} tone="neutral"/></View>
      <Text style={[styles.body,{marginTop:7}]}>{desc}</Text>
    </Card>)}
    <SectionTitle title="Simulation drill"/>
    <Card>
      <Text style={styles.cardTitle}>What if visibility drops to 50 m?</Text>
      <Text style={[styles.body,{marginTop:8}]}>Demo impact: collision-risk multiplier rises, travel speed is reduced and high-exposure work is pushed later. This mirrors the blueprint's what-if simulator.</Text>
      <View style={{height:12}}/><Pill label="Risk +31% · Finish +22 min" tone="warn"/>
    </Card>
  </ScrollView>;
}

function ReportScreen({machine,complaints,setComplaints}) {
  const [text,setText]=useState('');
  const submit=()=>{
    if(!text.trim()) return;
    setComplaints(c=>[{id:`ISS-${Date.now()}`,machineId:machine.id,operatorId:machine.operatorId,text:text.trim(),status:'Open',time:'Now'},...c]);
    setText('');
    Alert.alert('Submitted','Your issue is now visible on the supervisor dashboard.');
  };
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>Report + SOS</Text>
    <Card style={styles.sosCard}>
      <Text style={styles.sosTitle}>Emergency SOS</Text>
      <Text style={styles.body}>Demo action: records the machine state, operator, timestamp and location context, then raises a critical event.</Text>
      <View style={{height:14}}/><ActionButton label="HOLD FOR SOS (demo)" onPress={()=>Alert.alert('SOS demo raised','Supervisor console would receive a critical alert with a machine-state snapshot.')}/>
    </Card>
    <SectionTitle title="Report an issue"/>
    <Card>
      <TextInput multiline value={text} onChangeText={setText} placeholder="Example: Hydraulic response feels slower than normal..." placeholderTextColor={C.muted} style={[styles.input,{height:110,textAlignVertical:'top'}]}/>
      <View style={{height:12}}/><ActionButton label="Send to supervisor" onPress={submit}/>
    </Card>
    <SectionTitle title="My reports"/>
    {complaints.filter(c=>c.machineId===machine.id).map(c=><Card key={c.id} style={{marginBottom:10}}>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{c.id}</Text><Pill label={c.status} tone={c.status==='Resolved'?'good':'warn'}/></View>
      <Text style={[styles.body,{marginTop:8}]}>{c.text}</Text>
    </Card>)}
  </ScrollView>;
}

function OperatorApp({session,onLogout,tasks,setTasks,alerts,complaints,setComplaints}) {
  const [tab,setTab]=useState('home');
  const machine=data.machines.find(m=>m.id===session.machineId) || data.machines[0];
  const [live,setLive]=useState({fuel:machine.avgFuel, idle:machine.avgIdling, load:machine.avgLoadCycles, health:machine.health});
  useEffect(()=>{
    const t=setInterval(()=>setLive(v=>({
      fuel:Math.max(3.9,Math.min(14,v.fuel+(Math.random()-.52)*0.8)),
      idle:Math.max(10,Math.min(48,v.idle+(Math.random()-.5)*3)),
      load:Math.max(0,Math.min(21,v.load+(Math.random()-.45)*2)),
      health:Math.max(40,Math.min(99,Math.round(v.health+(Math.random()-.51)*2)))
    })),2500);
    return ()=>clearInterval(t);
  },[machine.id]);

  const content = tab==='home'?<OperatorHome machine={machine} operatorId={session.operatorId} tasks={tasks} alerts={alerts} setTab={setTab}/>:
    tab==='machine'?<OperatorMachine machine={machine} live={live}/>:
    tab==='tasks'?<OperatorTasks machine={machine} operatorId={session.operatorId} tasks={tasks} setTasks={setTasks}/>:
    tab==='learn'?<LearnScreen machine={machine}/>:
    <ReportScreen machine={machine} complaints={complaints} setComplaints={setComplaints}/>;

  return <SafeAreaView style={styles.safe}>
    <Header title={`${machine.id} · ${machine.type}`} subtitle={`${session.operatorId} · ${machine.zone}`} onLogout={onLogout} role="Operator"/>
    <View style={{flex:1}}>{content}</View>
    <BottomTabs tab={tab} setTab={setTab} items={[
      {key:'home',label:'Home'},{key:'machine',label:'Machine'},{key:'tasks',label:'Tasks'},{key:'learn',label:'Learn'},{key:'report',label:'Report'}
    ]}/>
  </SafeAreaView>;
}

function SupervisorHome({tasks,alerts,complaints,setTab}) {
  const ready=data.machines.filter(m=>m.health>=82).length;
  const avgHealth=Math.round(data.machines.reduce((a,b)=>a+b.health,0)/data.machines.length);
  const active=tasks.filter(t=>t.status==='In Progress').length;
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Card style={styles.briefing}>
      <View style={styles.rowBetween}><Text style={styles.eyebrow}>SITE BRIEFING</Text><Pill label="Live demo" tone="good"/></View>
      <Text style={styles.briefingTitle}>Fleet is operational. Watch two risk clusters.</Text>
      <Text style={styles.body}>The command view combines machine telemetry, task status, safety alerts and worker reports. Prioritise high-alert machines and blocked work before re-planning.</Text>
      <View style={styles.inlineActions}><ActionButton label="Assign task" onPress={()=>setTab('assign')}/><ActionButton label="Review alerts" kind="secondary" onPress={()=>setTab('alerts')}/></View>
    </Card>
    <View style={styles.metricGrid}>
      <Metric label="Fleet ready" value={`${ready}/${data.machines.length}`} sub={`${avgHealth}% avg health`} tone="good"/>
      <Metric label="Tasks active" value={`${active}`} sub={`${tasks.length} total today`}/>
      <Metric label="Open reports" value={`${complaints.filter(c=>c.status==='Open').length}`} sub="Operator issues" tone={complaints.some(c=>c.status==='Open')?'warn':'good'}/>
      <Metric label="Alert baseline" value={`${data.siteStats.safetyAlertPct}%`} sub="From 100k telemetry rows" tone="warn"/>
    </View>

    <SectionTitle title="Top machine attention"/>
    {[...data.machines].sort((a,b)=>a.health-b.health).slice(0,4).map(m=><Card key={m.id} style={{marginBottom:10}}>
      <View style={styles.rowBetween}>
        <View><Text style={styles.cardTitle}>{m.id} · {m.type}</Text><Text style={styles.cardMeta}>{m.operatorId} · {m.zone}</Text></View>
        <Pill label={`${m.health}%`} tone={toneForHealth(m.health)}/>
      </View>
      <View style={{height:10}}/><ProgressBar value={m.health} color={m.health>=82?C.green:m.health>=68?C.orange:C.red}/>
    </Card>)}
  </ScrollView>;
}

function FleetScreen() {
  const [filter,setFilter]=useState('All');
  const types=['All','Excavator','Loader','Dozer','Grader'];
  const rows=data.machines.filter(m=>filter==='All'||m.type===filter);
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>Fleet health</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,marginBottom:14}}>
      {types.map(x=><Pressable key={x} onPress={()=>setFilter(x)} style={[styles.machineChip,filter===x&&styles.machineChipActive]}><Text style={[styles.machineChipText,filter===x&&{color:C.bg}]}>{x}</Text></Pressable>)}
    </ScrollView>
    {rows.map(m=><Card key={m.id} style={{marginBottom:10}}>
      <View style={styles.rowBetween}>
        <View><Text style={styles.cardTitle}>{m.id} · {m.type}</Text><Text style={styles.cardMeta}>{m.operatorId} · {m.zone} · {fmt(m.engineHours)}h</Text></View>
        <Pill label={m.status} tone={toneForHealth(m.health)}/>
      </View>
      <View style={styles.fleetStats}>
        <Text style={styles.smallStat}>Health <Text style={styles.smallStatStrong}>{m.health}%</Text></Text>
        <Text style={styles.smallStat}>Idle <Text style={styles.smallStatStrong}>{m.avgIdling}m</Text></Text>
        <Text style={styles.smallStat}>Alerts <Text style={styles.smallStatStrong}>{m.alertRatePct}%</Text></Text>
        <Text style={styles.smallStat}>Fuel <Text style={styles.smallStatStrong}>{m.avgFuel}L</Text></Text>
      </View>
    </Card>)}
  </ScrollView>;
}

function AssignScreen({tasks,setTasks}) {
  const [machineId,setMachineId]=useState('EXC003');
  const [title,setTitle]=useState('Excavate drainage trench');
  const [type,setType]=useState('Trenching');
  const [priority,setPriority]=useState('High');
  const [zone,setZone]=useState('Zone B');
  const [weather,setWeather]=useState('Sunny');
  const m=data.machines.find(x=>x.id===machineId) || data.machines[0];

  const prediction=useMemo(()=>{
    const skill='Intermediate';
    const cell=data.taskModel.find(x=>x.taskType===type&&x.weather===weather&&x.skill===skill);
    if(!cell) return 55;
    const ageApprox=Math.max(1,Math.min(10,Math.round(m.engineHours/1100)));
    const ageAdj=(ageApprox-5)*1.2;
    const healthAdj=(85-m.health)*0.35;
    return Math.max(20,Math.round(cell.baseActual+ageAdj+healthAdj));
  },[machineId,type,weather]);

  const create=()=>{
    const id=`JOB-${Math.floor(300+Math.random()*600)}`;
    setTasks(ts=>[{
      id,title:title.trim()||type,type,machineId,operatorId:m.operatorId,zone,priority,status:'Assigned',estimatedMin:prediction,progress:0
    },...ts]);
    Alert.alert('Task assigned',`${id} was pushed to ${m.operatorId} on ${machineId}.`);
  };
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>Assign + predict</Text>
    <Text style={styles.pageSub}>Task timing is estimated from the supplied task dataset, then adjusted for machine age proxy and health.</Text>
    <Card>
      <Text style={styles.inputLabel}>Task title</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input}/>
      <Text style={[styles.inputLabel,{marginTop:14}]}>Machine</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:3}}>
        {data.machines.slice(0,20).map(x=><Pressable key={x.id} onPress={()=>setMachineId(x.id)} style={[styles.machineChip,machineId===x.id&&styles.machineChipActive]}><Text style={[styles.machineChipText,machineId===x.id&&{color:C.bg}]}>{x.id}</Text></Pressable>)}
      </ScrollView>
      <Text style={[styles.inputLabel,{marginTop:14}]}>Task type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:3}}>
        {data.taskTypes.map(x=><Pressable key={x} onPress={()=>setType(x)} style={[styles.machineChip,type===x&&styles.machineChipActive]}><Text style={[styles.machineChipText,type===x&&{color:C.bg}]}>{x}</Text></Pressable>)}
      </ScrollView>
      <Text style={[styles.inputLabel,{marginTop:14}]}>Weather scenario</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:3}}>
        {data.weatherTypes.map(x=><Pressable key={x} onPress={()=>setWeather(x)} style={[styles.machineChip,weather===x&&styles.machineChipActive]}><Text style={[styles.machineChipText,weather===x&&{color:C.bg}]}>{x}</Text></Pressable>)}
      </ScrollView>
      <Text style={[styles.inputLabel,{marginTop:14}]}>Priority + zone</Text>
      <View style={styles.inlineActions}>
        {['Low','Medium','High'].map(x=><Pressable key={x} onPress={()=>setPriority(x)} style={[styles.machineChip,priority===x&&styles.machineChipActive]}><Text style={[styles.machineChipText,priority===x&&{color:C.bg}]}>{x}</Text></Pressable>)}
      </View>
      <View style={[styles.inlineActions,{marginTop:8}]}>
        {zones.map(x=><Pressable key={x} onPress={()=>setZone(x)} style={[styles.machineChip,zone===x&&styles.machineChipActive]}><Text style={[styles.machineChipText,zone===x&&{color:C.bg}]}>{x}</Text></Pressable>)}
      </View>
    </Card>
    <SectionTitle title="Prediction"/>
    <Card style={styles.predictionCard}>
      <Text style={styles.predictionNumber}>{prediction} min</Text>
      <Text style={styles.body}>Expected completion time · based on task type + weather + operator skill cell from the 100k task dataset, with a demo adjustment for machine condition.</Text>
      <View style={{height:14}}/><ActionButton label={`Assign to ${m.operatorId}`} onPress={create}/>
    </Card>
    <SectionTitle title="Today"/>
    {tasks.slice(0,6).map(t=><Card key={t.id} style={{marginBottom:10}}><View style={styles.rowBetween}><Text style={styles.cardTitle}>{t.id} · {t.title}</Text><Pill label={t.status} tone={t.status==='Completed'?'good':t.status==='Blocked'?'danger':'info'}/></View><Text style={styles.cardMeta}>{t.machineId} · {t.operatorId} · {t.estimatedMin} min</Text></Card>)}
  </ScrollView>;
}

function AlertsScreen({alerts,complaints,setComplaints}) {
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>Alerts + operator reports</Text>
    <SectionTitle title="Safety queue"/>
    {alerts.map(a=><Card key={a.id} style={{marginBottom:10}}>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{a.title}</Text><Pill label={a.severity} tone={toneForSeverity(a.severity)}/></View>
      <Text style={styles.cardMeta}>{a.machineId} · {a.time}</Text><Text style={[styles.body,{marginTop:8}]}>{a.detail}</Text>
    </Card>)}
    <SectionTitle title="Worker issues"/>
    {complaints.length===0 && <Card><Text style={styles.body}>No operator reports yet. Submit one from Operator → Report to demonstrate the loop.</Text></Card>}
    {complaints.map(c=><Card key={c.id} style={{marginBottom:10}}>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{c.machineId} · {c.operatorId}</Text><Pill label={c.status} tone={c.status==='Resolved'?'good':'warn'}/></View>
      <Text style={[styles.body,{marginTop:8}]}>{c.text}</Text>
      {c.status!=='Resolved' && <View style={{marginTop:12}}><ActionButton label="Mark resolved" onPress={()=>setComplaints(xs=>xs.map(x=>x.id===c.id?{...x,status:'Resolved'}:x))}/></View>}
    </Card>)}
  </ScrollView>;
}

function AnalyticsScreen() {
  const typeAgg=useMemo(()=>{
    return ['Excavator','Loader','Dozer','Grader'].map(type=>{
      const arr=data.machines.filter(m=>m.type===type);
      return {label:type.slice(0,3),value:Math.round(arr.reduce((a,b)=>a+b.health,0)/Math.max(1,arr.length))};
    });
  },[]);
  const idleAgg=useMemo(()=>data.machines.slice(0,10).map(m=>Math.round(m.avgIdling)),[]);
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>Site analytics</Text>
    <Text style={styles.pageSub}>These headline values come directly from the supplied 100k-row telemetry and task datasets.</Text>
    <View style={styles.metricGrid}>
      <Metric label="Telemetry rows" value={fmt(data.siteStats.telemetryRows)} sub={`${data.siteStats.machineCount} machines`}/>
      <Metric label="Task rows" value={fmt(data.siteStats.taskRows)} sub={`${data.siteStats.avgActualTaskMin}m avg actual`}/>
      <Metric label="Seatbelt violations" value={`${data.siteStats.seatbeltViolationPct}%`} sub="Across telemetry" tone="warn"/>
      <Metric label="Safety alerts" value={`${data.siteStats.safetyAlertPct}%`} sub="Across telemetry" tone="warn"/>
    </View>
    <SectionTitle title="Average health by machine class"/>
    <Card><BarChart items={typeAgg.map((x,i)=>({...x,color:i===0?C.yellow:i===1?C.green:i===2?C.orange:C.blue}))}/><View style={styles.chartLabels}>{typeAgg.map(x=><Text key={x.label} style={styles.chartLabel}>{x.label} {x.value}%</Text>)}</View></Card>
    <SectionTitle title="Idle-time pattern"/>
    <Card><LineChart data={idleAgg} stroke={C.orange} suffix="m"/></Card>
    <SectionTitle title="Carbon + fuel opportunity"/>
    <Card>
      <Text style={styles.cardTitle}>Engine-off window suggestion</Text>
      <Text style={[styles.body,{marginTop:8}]}>Average idling in the supplied telemetry is {data.siteStats.avgIdlingMin} min. A production version can convert avoidable idle time into fuel and CO₂ savings per task and surface low-risk engine-off windows.</Text>
    </Card>
  </ScrollView>;
}

function SupervisorApp({onLogout,tasks,setTasks,alerts,complaints,setComplaints}) {
  const [tab,setTab]=useState('home');
  const content=tab==='home'?<SupervisorHome tasks={tasks} alerts={alerts} complaints={complaints} setTab={setTab}/>:
    tab==='fleet'?<FleetScreen/>:
    tab==='assign'?<AssignScreen tasks={tasks} setTasks={setTasks}/>:
    tab==='alerts'?<AlertsScreen alerts={alerts} complaints={complaints} setComplaints={setComplaints}/>:
    <AnalyticsScreen/>;
  return <SafeAreaView style={styles.safe}>
    <Header title="Site command center" subtitle="Supervisor mobile view" onLogout={onLogout} role="Supervisor"/>
    <View style={{flex:1}}>{content}</View>
    <BottomTabs tab={tab} setTab={setTab} items={[
      {key:'home',label:'Home'},{key:'fleet',label:'Fleet'},{key:'assign',label:'Assign'},{key:'alerts',label:'Alerts'},{key:'analytics',label:'Analytics'}
    ]}/>
  </SafeAreaView>;
}

export default function App(){
  const [session,setSession]=useState(null);
  const [tasks,setTasks]=useState(data.seedTasks);
  const [alerts]=useState(data.seedAlerts);
  const [complaints,setComplaints]=useState([
    {id:'ISS-104',machineId:'LOD018',operatorId:'OP1055',text:'Rear camera intermittently flickers during reverse.',status:'Open',time:'18 min ago'}
  ]);
  if(!session) return <Login onLogin={setSession}/>;
  if(session.role==='Supervisor') return <SupervisorApp onLogout={()=>setSession(null)} tasks={tasks} setTasks={setTasks} alerts={alerts} complaints={complaints} setComplaints={setComplaints}/>;
  return <OperatorApp session={session} onLogout={()=>setSession(null)} tasks={tasks} setTasks={setTasks} alerts={alerts} complaints={complaints} setComplaints={setComplaints}/>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg,paddingTop:Platform.OS==='android'?22:0},
  header:{paddingHorizontal:18,paddingTop:12,paddingBottom:14,borderBottomWidth:1,borderColor:C.line,flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:C.bg},
  brand:{color:C.yellow,fontWeight:'900',letterSpacing:2,fontSize:11},
  headerTitle:{color:C.text,fontSize:20,fontWeight:'900',marginTop:3},
  headerSub:{color:C.muted,fontSize:12,marginTop:3},
  roleBadge:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,paddingHorizontal:10,paddingVertical:8,borderRadius:12},
  roleBadgeText:{color:C.muted,fontSize:11,fontWeight:'800'},
  scroll:{padding:16,paddingBottom:32},
  loginWrap:{padding:22,alignItems:'center',justifyContent:'center',minHeight:'100%'},
  mark:{width:68,height:68,borderRadius:18,backgroundColor:C.yellow,alignItems:'center',justifyContent:'center'},
  markText:{fontSize:40,fontWeight:'900',color:C.bg},
  loginBrand:{fontSize:34,fontWeight:'900',color:C.text,marginTop:14},
  loginTag:{fontSize:14,color:C.muted,marginTop:6,textAlign:'center'},
  sourceNote:{color:C.muted,fontSize:11,textAlign:'center',marginTop:18,lineHeight:16},
  inputLabel:{color:C.muted,fontSize:12,fontWeight:'800',marginBottom:8},
  input:{backgroundColor:C.panel2,borderWidth:1,borderColor:C.line,color:C.text,borderRadius:12,paddingHorizontal:13,paddingVertical:12,fontSize:14},
  segment:{flexDirection:'row',gap:8},
  segmentBtn:{flex:1,paddingVertical:12,borderRadius:12,alignItems:'center',backgroundColor:C.panel2,borderWidth:1,borderColor:C.line},
  segmentActive:{backgroundColor:C.yellow,borderColor:C.yellow},
  segmentText:{color:C.text,fontWeight:'900'},
  segmentTextActive:{color:C.bg},
  machineChip:{paddingHorizontal:12,paddingVertical:9,borderRadius:12,backgroundColor:C.panel2,borderWidth:1,borderColor:C.line},
  machineChipActive:{backgroundColor:C.yellow,borderColor:C.yellow},
  machineChipText:{color:C.text,fontWeight:'800',fontSize:12},
  machinePreview:{marginTop:14,padding:13,borderRadius:12,backgroundColor:C.bg,borderWidth:1,borderColor:C.line,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  superLoginBox:{marginTop:18,padding:14,borderRadius:12,backgroundColor:C.bg,borderWidth:1,borderColor:C.line},
  previewTitle:{color:C.text,fontWeight:'900',fontSize:14},
  previewSub:{color:C.muted,fontSize:11,marginTop:4},
  tabs:{height:68,borderTopWidth:1,borderColor:C.line,backgroundColor:C.bg,flexDirection:'row',paddingHorizontal:5,paddingBottom:6},
  tab:{flex:1,alignItems:'center',justifyContent:'center',gap:5},
  tabDot:{width:5,height:5,borderRadius:5,backgroundColor:C.line},
  tabDotActive:{backgroundColor:C.yellow,width:18},
  tabText:{color:C.muted,fontSize:10,fontWeight:'800'},
  tabTextActive:{color:C.yellow},
  briefing:{borderColor:'rgba(255,205,17,0.35)',backgroundColor:'#18170F'},
  eyebrow:{color:C.yellow,fontSize:10,fontWeight:'900',letterSpacing:1.2},
  briefingTitle:{color:C.text,fontSize:24,fontWeight:'900',marginTop:12,lineHeight:29},
  body:{color:C.muted,fontSize:13,lineHeight:19},
  inlineActions:{flexDirection:'row',gap:8,alignItems:'center',flexWrap:'wrap',marginTop:14},
  metricGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,justifyContent:'space-between',marginTop:12},
  rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
  cardTitle:{color:C.text,fontWeight:'900',fontSize:14,flexShrink:1},
  cardMeta:{color:C.muted,fontSize:11,marginTop:5},
  progressText:{color:C.muted,fontSize:10,marginTop:6},
  machineHero:{backgroundColor:'#15170F',borderColor:'rgba(255,205,17,0.35)'},
  heroMachine:{color:C.text,fontSize:34,fontWeight:'900',marginTop:6},
  healthRing:{width:74,height:74,borderRadius:37,borderWidth:7,borderColor:C.green,alignItems:'center',justifyContent:'center',flexDirection:'row'},
  healthBig:{color:C.text,fontSize:23,fontWeight:'900'},
  healthPct:{color:C.muted,fontSize:11,fontWeight:'900',marginTop:8},
  recommended:{borderColor:'rgba(255,205,17,0.35)'},
  sosCard:{borderColor:'rgba(255,92,92,0.5)',backgroundColor:'#1A1111'},
  sosTitle:{color:C.red,fontSize:24,fontWeight:'900',marginBottom:8},
  pageTitle:{color:C.text,fontSize:26,fontWeight:'900'},
  pageSub:{color:C.muted,fontSize:12,lineHeight:18,marginTop:5,marginBottom:14},
  fleetStats:{flexDirection:'row',justifyContent:'space-between',marginTop:14,paddingTop:12,borderTopWidth:1,borderColor:C.line},
  smallStat:{color:C.muted,fontSize:10},
  smallStatStrong:{color:C.text,fontWeight:'900'},
  predictionCard:{borderColor:'rgba(90,167,255,0.45)'},
  predictionNumber:{color:C.blue,fontWeight:'900',fontSize:38,marginBottom:8},
  chartLabels:{flexDirection:'row',justifyContent:'space-between',marginTop:-4},
  chartLabel:{color:C.muted,fontSize:10}
});
