import { BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,LineChart,Line,ResponsiveContainer,RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis,Cell,PieChart,Pie } from 'recharts'
import { T, CHART_COLORS } from '../ui/index.jsx'

const TS = { contentStyle:{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:11}, labelStyle:{color:T.muted} }

export const HBarChart = ({data,dataKeys,height=260})=>(
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{left:0,right:10}}>
      <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
      <XAxis type="number" stroke={T.muted} tick={{fontSize:10,fill:T.muted}}/>
      <YAxis type="category" dataKey="name" width={120} stroke={T.muted} tick={{fontSize:10,fill:T.muted}}/>
      <Tooltip {...TS}/><Legend wrapperStyle={{fontSize:11}}/>
      {dataKeys.map((dk,i)=><Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color||CHART_COLORS[i]} stackId={dk.stack} radius={!dk.stack?[0,4,4,0]:undefined}/>)}
    </BarChart>
  </ResponsiveContainer>
)

export const VBarChart = ({data,dataKeys,height=240})=>(
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
      <XAxis dataKey="name" stroke={T.muted} tick={{fontSize:10,fill:T.muted}}/>
      <YAxis stroke={T.muted} tick={{fontSize:10,fill:T.muted}}/>
      <Tooltip {...TS}/><Legend wrapperStyle={{fontSize:11}}/>
      {dataKeys.map((dk,i)=>(
        <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color||CHART_COLORS[i]} stackId={dk.stack} radius={!dk.stack?[4,4,0,0]:undefined}>
          {dk.cells&&data.map((_,j)=><Cell key={j} fill={CHART_COLORS[j%8]}/>)}
        </Bar>
      ))}
    </BarChart>
  </ResponsiveContainer>
)

export const TimelineChart = ({data,dataKeys,height=220})=>(
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
      <XAxis dataKey="min" stroke={T.muted} tick={{fontSize:10,fill:T.muted}}/>
      <YAxis stroke={T.muted} tick={{fontSize:10,fill:T.muted}}/>
      <Tooltip {...TS}/><Legend wrapperStyle={{fontSize:11}}/>
      {dataKeys.map((dk,i)=><Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color||CHART_COLORS[i]} strokeWidth={2} dot={false} strokeDasharray={dk.dashed?'4 2':undefined}/>)}
    </LineChart>
  </ResponsiveContainer>
)

export const RadarCompare = ({data,subjects,height=260})=>(
  <ResponsiveContainer width="100%" height={height}>
    <RadarChart data={data}>
      <PolarGrid stroke={T.border}/>
      <PolarAngleAxis dataKey="zona" tick={{fontSize:9,fill:T.muted}}/>
      <PolarRadiusAxis domain={[0,100]} tick={{fontSize:8,fill:T.muted}}/>
      {subjects.map((s,i)=><Radar key={s.key} name={s.name} dataKey={s.key} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.15}/>)}
      <Legend wrapperStyle={{fontSize:11}}/><Tooltip {...TS}/>
    </RadarChart>
  </ResponsiveContainer>
)

export const DonutChart = ({data,height=220})=>(
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie data={data.filter(d=>d.value>0)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
        {data.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%8]}/>)}
      </Pie>
      <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:11}}/>
    </PieChart>
  </ResponsiveContainer>
)
