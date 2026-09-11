import React,{useState} from 'react';
import {Image,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {competitions,competitionChapters,competitionCount,type CompetitionId} from './competitions';
import {normalize} from './core/quiz';
import {C,Icon,s} from './ui';
export function CompetitionHome({onOpen}:{onOpen:(id:CompetitionId)=>void}){
 return <View style={{gap:12,marginBottom:24}}>
  <Text style={s.h2}>Your club. Your competition.</Text>
  <Pressable accessibilityRole="button" accessibilityLabel="Explore Champions League 2026/27" onPress={()=>onOpen('champions-league')} style={({pressed})=>[a.hero,pressed&&{opacity:.86}]}>
   <Image source={require('../assets/stadiums/san-siro.jpg')} accessible={false} resizeMode="cover" style={[StyleSheet.absoluteFill,{opacity:.22,width:'100%',height:'100%'}]}/>
   <View style={a.top}><Text style={a.season}>SEASON 2026/27</Text><Icon name="trophy-outline" color="#DDE6FF" size={34}/></View>
   <Text style={a.heroTitle}>Champions League</Text><Text style={a.heroBody}>36 clubs. The shirts. The stars.</Text>
   <View style={a.top}><Text style={a.heroSmall}>{competitionCount('champions-league')} player questions</Text><View style={a.heroAction}><Text style={{fontWeight:'800',color:'#152553'}}>Choose your club</Text><Icon name="arrow-forward" color="#152553" size={18}/></View></View>
  </Pressable>
  <View style={a.leagueGrid}>{competitions.slice(1).map(c=><Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`Explore ${c.name} 2026/27`} onPress={()=>onOpen(c.id)} style={({pressed})=>[a.leagueCard,{backgroundColor:pressed?c.accent:'white',borderTopColor:c.color}]}><Text style={[a.code,{color:c.color}]}>{c.short} / 26–27</Text><Text style={a.leagueName}>{c.name}</Text><Text style={s.tiny}>{competitionChapters(c.id).length} clubs · {c.id==='premier-league'?'Players & grounds':'Grounds quiz'}</Text><Icon name="arrow-forward" color={c.color} size={20}/></Pressable>)}</View>
 </View>;
}
export function SquadArchive({solved,onStart,onBack,initialCompetition='champions-league'}:{solved:string[];onStart:(code:string)=>void;onBack:()=>void;initialCompetition?:CompetitionId}){
  const [search,setSearch]=useState(''),[selected,setSelected]=useState<CompetitionId>(initialCompetition);const won=new Set(solved);
  const competition=competitions.find(c=>c.id===selected)!;const chapters=competitionChapters(selected);
  const matches=chapters.filter(c=>normalize(c.name).includes(normalize(search.trim()))).sort((a,b)=>a.name.localeCompare(b.name));
  const total=competitionCount(selected),done=chapters.flatMap(c=>c.questionIds).filter(id=>won.has(id)).length;
  return <View style={{gap:12}}><Pressable accessibilityRole="button" accessibilityLabel="Back to play" onPress={onBack} style={{minHeight:44,flexDirection:'row',alignItems:'center',gap:8,alignSelf:'flex-start'}}><Icon name="arrow-back" size={18}/><Text style={s.small}>Back to play</Text></Pressable>
    <View style={a.tabs}>{competitions.map(c=><Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`Select ${c.name}`} accessibilityState={{selected:selected===c.id}} onPress={()=>{setSelected(c.id);setSearch('');}} style={[a.tab,{backgroundColor:selected===c.id?c.color:'#E6EBE8'}]}><Text style={{fontWeight:'700',color:selected===c.id?'white':C.ink}}>{c.name}</Text></Pressable>)}</View>
    <View style={{gap:6,marginTop:8}}><Text style={[a.code,{color:competition.color}]}>2026/27 · {competition.subtitle.toUpperCase()}</Text><Text style={s.h1}>{competition.name}</Text><Text style={s.body}>{chapters.length} clubs · {total} questions. Choose a club and build your score.</Text></View>
    <View style={a.progress}><Text style={s.modeTitle}>{done}/{total} solved</Text><View style={a.track}><View style={{height:5,width:`${total?done/total*100:0}%`,backgroundColor:competition.color}}/></View></View>
    <TextInput accessibilityLabel="Find a club" placeholder="Find your club" value={search} onChangeText={setSearch} style={[s.input,{fontSize:16,padding:12,minHeight:48}]}/>
    {matches.length===0&&<Text style={s.body}>No matching club in this competition. Try another name.</Text>}
    {matches.map(c=>{const done=c.questionIds.filter(id=>won.has(id)).length;return <Pressable key={c.code} accessibilityRole="button" accessibilityLabel={`${c.name} club, ${done} of ${c.questionIds.length} solved`} onPress={()=>onStart(c.code)} style={({pressed})=>[a.club,{backgroundColor:pressed?competition.accent:'white'}]}><View style={[a.monogram,{backgroundColor:competition.accent}]}><Text style={{color:competition.color,fontWeight:'900'}}>{c.name.split(' ').filter(w=>!['FC','CF','SK','KV','FK','&'].includes(w)).slice(0,2).map(w=>w[0]).join('')}</Text></View><View style={{flex:1,gap:5}}><Text style={s.modeTitle}>{c.name}</Text><Text style={s.tiny}>{done}/{c.questionIds.length} solved · {c.kind}</Text></View><Icon name={done===c.questionIds.length?'trophy':'arrow-forward'} color={competition.color}/></Pressable>;})}
    <Text style={s.tiny}>{selected==='champions-league'?'Selected registered players; UEFA List B is excluded.':selected==='premier-league'?'Selected players from the official Fantasy Premier League catalogue, plus club grounds. This is not the complete registration list.':'Club and ground questions; full domestic player squads are not included yet.'} Season snapshot checked 11 September 2026.</Text>
  </View>;
}
export {SquadClue} from './ShirtClue';
const a=StyleSheet.create({
 hero:{backgroundColor:'#152553',padding:22,borderRadius:20,gap:15,overflow:'hidden'},top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14},season:{color:'#DDE6FF',fontSize:11,fontWeight:'800',letterSpacing:2},heroTitle:{color:'white',fontSize:30,fontWeight:'900',lineHeight:35},heroBody:{color:'#DDE6FF',fontSize:16,lineHeight:23},heroSmall:{color:'#DDE6FF',fontSize:12},heroAction:{backgroundColor:'#DDE6FF',padding:12,borderRadius:8,flexDirection:'row',alignItems:'center',gap:8},
 leagueGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},leagueCard:{width:'48%',flexGrow:1,padding:16,borderRadius:12,borderTopWidth:4,gap:10},code:{fontSize:10,fontWeight:'900',letterSpacing:1.5},leagueName:{fontSize:19,fontWeight:'800',color:C.ink},tabs:{flexDirection:'row',flexWrap:'wrap',gap:8},tab:{minHeight:44,paddingHorizontal:14,paddingVertical:12,borderRadius:8,justifyContent:'center'},progress:{gap:10},track:{height:5,backgroundColor:'#DFE5E0',borderRadius:4,overflow:'hidden'},club:{padding:16,borderRadius:12,flexDirection:'row',alignItems:'center',gap:12},monogram:{width:46,height:46,borderRadius:10,alignItems:'center',justifyContent:'center'}
});
