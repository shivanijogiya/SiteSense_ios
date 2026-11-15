import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Polyline, Line, Circle, Rect } from 'react-native-svg';
import { C } from '../theme';

export function SectionTitle({title, right}) {
  return <View style={s.sectionRow}><Text style={s.sectionTitle}>{title}</Text>{right || null}</View>;
}

export function Card({children, style}) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Pill({label, tone='neutral'}) {
  const map = {
    good: {bg:'rgba(58,199,123,0.16)', fg:C.green},
    warn: {bg:'rgba(255,158,61,0.16)', fg:C.orange},
    danger: {bg:'rgba(255,92,92,0.16)', fg:C.red},
    info: {bg:'rgba(90,167,255,0.16)', fg:C.blue},
    neutral: {bg:C.panel2, fg:C.text},
  };
  const t = map[tone] || map.neutral;
  return <View style={[s.pill,{backgroundColor:t.bg}]}><Text style={[s.pillText,{color:t.fg}]}>{label}</Text></View>;
}

export function Metric({label, value, sub, tone}) {
  const color = tone === 'good' ? C.green : tone === 'warn' ? C.orange : tone === 'danger' ? C.red : C.text;
  return (
    <Card style={s.metricCard}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={[s.metricValue,{color}]}>{value}</Text>
      {!!sub && <Text style={s.metricSub}>{sub}</Text>}
    </Card>
  );
}

export function ProgressBar({value, color=C.yellow}) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return <View style={s.progressTrack}><View style={[s.progressFill,{width:`${v}%`,backgroundColor:color}]} /></View>;
}

export function LineChart({data=[], height=150, stroke=C.yellow, suffix=''}) {
  const width = 330;
  const pad = 18;
  const vals = data.length ? data : [0];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max-min || 1;
  const pts = vals.map((v,i)=>{
    const x = pad + (i * (width-pad*2) / Math.max(1, vals.length-1));
    const y = pad + ((max-v)/range)*(height-pad*2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0,1,2,3].map(i=><Line key={i} x1={pad} x2={width-pad} y1={pad+i*(height-pad*2)/3} y2={pad+i*(height-pad*2)/3} stroke={C.line} strokeWidth="1"/>)}
        <Polyline points={pts} fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
        {vals.map((v,i)=>{
          const [x,y]=pts.split(' ')[i].split(',').map(Number);
          return <Circle key={i} cx={x} cy={y} r="3.5" fill={stroke}/>;
        })}
      </Svg>
      <View style={s.chartFooter}><Text style={s.chartText}>Low {min}{suffix}</Text><Text style={s.chartText}>High {max}{suffix}</Text></View>
    </View>
  );
}

export function BarChart({items=[], height=150}) {
  const width=330, pad=18, gap=14;
  const max=Math.max(1,...items.map(x=>x.value));
  const barW=(width-pad*2-gap*(items.length-1))/Math.max(1,items.length);
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Line x1={pad} x2={width-pad} y1={height-24} y2={height-24} stroke={C.line} strokeWidth="1"/>
      {items.map((it,i)=>{
        const bh=(it.value/max)*(height-55);
        const x=pad+i*(barW+gap);
        const y=height-24-bh;
        return <Rect key={it.label} x={x} y={y} width={barW} height={bh} rx="5" fill={it.color || C.yellow}/>;
      })}
    </Svg>
  );
}

export function ActionButton({label,onPress,kind='primary',disabled=false}) {
  const primary=kind==='primary';
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[
      s.button,
      {backgroundColor: primary ? C.yellow : C.panel2, borderColor: primary ? C.yellow : C.line, opacity:disabled?0.45:(pressed?0.75:1)}
    ]}>
      <Text style={[s.buttonText,{color:primary?C.bg:C.text}]}>{label}</Text>
    </Pressable>
  );
}

const s=StyleSheet.create({
  card:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:16,padding:16},
  sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:20,marginBottom:10},
  sectionTitle:{color:C.text,fontSize:18,fontWeight:'800'},
  pill:{paddingHorizontal:10,paddingVertical:6,borderRadius:999},
  pillText:{fontSize:12,fontWeight:'800'},
  metricCard:{width:'48%',minHeight:104,justifyContent:'space-between'},
  metricLabel:{color:C.muted,fontSize:12,fontWeight:'700'},
  metricValue:{fontSize:26,fontWeight:'900',marginTop:8},
  metricSub:{color:C.muted,fontSize:11,marginTop:6},
  progressTrack:{height:8,borderRadius:8,backgroundColor:C.panel2,overflow:'hidden'},
  progressFill:{height:'100%',borderRadius:8},
  chartFooter:{flexDirection:'row',justifyContent:'space-between',marginTop:-4},
  chartText:{color:C.muted,fontSize:10},
  button:{minHeight:46,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center',paddingHorizontal:16},
  buttonText:{fontSize:14,fontWeight:'900'}
});
