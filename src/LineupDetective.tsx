import {clubCrests} from './clubCrests';
import {flagImages} from './flagImages';
import React,{useState} from 'react';
import {Image,Pressable,StyleSheet,View} from 'react-native';
import {Text,TextInput} from './Typography';
import {Button,C,Icon,s} from './ui';
import {lineups,matchesClub,type LineupProgress} from './core/lineups';

function PitchMarkings({mini=false}:{mini?:boolean}){
 const line='rgba(235,255,232,.7)';
 return <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
  {Array.from({length:10},(_,i)=><View key={i} style={{flex:1,backgroundColor:i%2?'#0B9248':'#2FAB51'}}/>)}
  <View style={{position:'absolute',top:mini?5:12,bottom:mini?5:12,left:mini?5:10,right:mini?5:10,borderWidth:1.5,borderColor:line}}>
   <View style={{position:'absolute',top:'50%',left:0,right:0,height:1.5,backgroundColor:line}}/>
   <View style={{position:'absolute',top:'39%',height:'22%',width:'32%',left:'34%',borderRadius:100,borderWidth:1.5,borderColor:line}}/>
   {['top','bottom'].map(edge=><View key={edge} style={{position:'absolute',[edge]:0,left:'22%',width:'56%',height:'16%',borderWidth:1.5,borderColor:line}}><View style={{position:'absolute',[edge]:0,left:'25%',width:'50%',height:'45%',borderWidth:1.5,borderColor:line}}/></View>)}
  </View>
 </View>;
}

export function LineupDetective({progress,onSave,onBack,onShare,busy}:{progress:LineupProgress;onSave:(p:LineupProgress)=>Promise<boolean>;onBack:()=>void;onShare:(text:string)=>void;busy:boolean}){
 const [selected,setSelected]=useState<number|null>(null),[page,setPage]=useState(0),[input,setInput]=useState(''),[message,setMessage]=useState('');
 const done=lineups.filter(c=>progress[c.id]?.solved).length;
 const club=selected===null?null:lineups[selected];
 const state=club?(progress[club.id]??{revealed:0,teamHint:false,solved:false}):null;
 function open(index:number){setSelected(index);setInput('');setMessage('');}
 async function guess(){if(!club||!state||busy)return;if(!input.trim()){setMessage('Enter a club name first.');return;}if(!matchesClub(club,input)){setMessage('Not quite. Try again or reveal a player.');return;}if(await onSave({...progress,[club.id]:{...state,solved:true}}))setMessage('Correct — you know your football.');}
 return <View style={[l.wrap,club&&{gap:10}]}><Button secondary title={club?'All lineup puzzles':'Back to play'} onPress={()=>club?setSelected(null):onBack()}/><View style={l.heading}><Text style={[s.kicker,{fontSize:9,letterSpacing:1}]}>LINEUP DETECTIVE · 2026/27</Text><View style={l.stars}><Icon name="star" color={C.lime} size={19}/><Text style={s.small}>{done}/{lineups.length} solved</Text></View></View><Text accessibilityRole="header" style={s.h1}>{club?'Guess the club':'Eleven clues. One club.'}</Text>
 {!club?<><Text style={s.body}>Read the nationalities, reveal a player, and name the club. Pick any puzzle to start.</Text><View accessibilityRole="progressbar" accessibilityLabel="Lineup collection progress" accessibilityValue={{min:0,max:lineups.length,now:done}} style={s.quizProgress}><View style={[s.quizProgressFill,{width:`${done/lineups.length*100}%`}]}/></View><View style={l.grid}>{lineups.slice(page*12,page*12+12).map((c,i)=><Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`Lineup puzzle ${page*12+i+1}${progress[c.id]?.solved?', completed':''}`} onPress={()=>open(page*12+i)} style={({pressed})=>[l.tile,pressed&&{opacity:.8}]}><View style={l.miniPitch}><PitchMarkings mini/>{c.rows.map((row,r)=><View key={r} style={l.miniRow}>{row.map((p,j)=><View key={j}>{flagImages[p.nationality]?<Image accessible={false} source={flagImages[p.nationality]} style={{width:13,height:13}}/>:<View style={l.dot}/>}</View>)}</View>)}</View><View style={l.heading}><Text style={s.modeTitle}>{String(page*12+i+1).padStart(2,'0')}</Text><Icon name={progress[c.id]?.solved?'checkmark-circle':'football-outline'} color={progress[c.id]?.solved?C.magenta:C.green}/></View></Pressable>)}</View><View style={l.heading}><Button secondary title="Previous page" disabled={page===0} onPress={()=>setPage(page-1)}/><Text style={s.small}>{page+1}/{Math.ceil(lineups.length/12)}</Text><Button secondary title="Next page" disabled={(page+1)*12>=lineups.length} onPress={()=>setPage(page+1)}/></View></>:state&&<>
 <Text style={s.small}>Puzzle {selected!+1} · 4–3–3 · Nationality clues</Text><View style={l.pitch}><PitchMarkings/>{club.rows.map((row,r)=><View key={r} style={l.row}>{row.map((p,j)=>{const index=club.rows.slice(0,r).flat().length+j;const shown=state.solved||index<state.revealed;return <View key={p.name} style={l.player}><View style={l.flag}>{flagImages[p.nationality]?<Image source={flagImages[p.nationality]} accessibilityLabel={`${p.nationality} flag`} style={{width:48,height:48}}/>:<Text style={l.nation}>{p.nationality}</Text>}</View><Text style={l.playerLabel}>{p.nationality}</Text>{shown&&<Text style={l.playerLabel}>{p.name}</Text>}</View>;})}</View>)}</View>
 <View style={l.actions}><Button secondary title={`Show player (${state.revealed}/11)`} disabled={busy||state.solved||state.revealed===11} onPress={()=>{void onSave({...progress,[club.id]:{...state,revealed:state.revealed+1}});}}/><Button secondary title="Team hint" disabled={busy||state.teamHint||state.solved} onPress={()=>{void onSave({...progress,[club.id]:{...state,teamHint:true}});}}/></View>{state.teamHint&&<Text style={s.body}>Country: {club.country}. Club name begins with “{club.name.replace(/^(FC|CF|AFC) /,'')[0]}”.</Text>}
 {state.solved?<View style={l.success}><Image source={clubCrests[club.name]} resizeMode="contain" accessibilityLabel={club.name+' crest'} style={{width:64,height:72,alignSelf:'center'}}/><Icon name="star" color={C.lime} size={28}/><Text style={[s.h2,{color:C.magenta}]}>{club.name}</Text><Text style={s.small}>Solved · {state.revealed} player reveals{state.teamHint?' · team hint used':''}</Text><Button title="Share result" secondary onPress={()=>onShare(`I solved lineup puzzle ${selected!+1} in Leoqo's 2026/27 collection with ${state.revealed} player reveals. ${done}/${lineups.length} clubs completed. Can you guess the club?`)}/></View>:<><TextInput accessibilityLabel="Club name" placeholder="Enter club name" value={input} onChangeText={setInput} autoCorrect={false} returnKeyType="done" onSubmitEditing={()=>{void guess();}} style={s.input}/><Button title="Check answer" disabled={busy} onPress={()=>{void guess();}}/></>}
 {!!message&&<Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}<View style={l.actions}><Button secondary title="Previous puzzle" disabled={selected===0} onPress={()=>open(selected!-1)}/><Button secondary title="Next puzzle" disabled={selected===lineups.length-1} onPress={()=>open(selected!+1)}/></View>
 </>}
 <Text style={s.tiny}>Selected squad XIs from the saved 2026/27 UEFA List A snapshot, 11 September 2026. Puzzle formations are not confirmed starting lineups. Flags include three-letter nationality codes. Independent editorial review is pending.</Text></View>;
}
const l=StyleSheet.create({
  wrap:{gap:16,maxWidth:640,width:'100%',alignSelf:'center'},
  heading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'},
  stars:{flexDirection:'row',gap:6,alignItems:'center'},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  tile:{width:'30%',flexGrow:1,minWidth:80,padding:8,borderWidth:1,borderBottomWidth:4,borderColor:'#8AC6D1',borderBottomColor:'#043D56',borderRadius:14,backgroundColor:'#11656D',gap:9},
  miniPitch:{backgroundColor:'#0C9047',borderRadius:7,padding:10,gap:12,overflow:'hidden'},
  miniRow:{flexDirection:'row',justifyContent:'space-around'},
  dot:{width:7,height:7,borderRadius:4,backgroundColor:C.lime},
  pitch:{backgroundColor:'#088B48',borderRadius:16,paddingHorizontal:12,paddingVertical:26,gap:28,minHeight:460,borderWidth:3,borderColor:'#C9EECF',overflow:'hidden',justifyContent:'space-between'},
  half:{position:'absolute',top:'50%',left:0,right:0,height:1,backgroundColor:'#7BCDC4'},
  circle:{position:'absolute',top:'39%',left:'35%',width:'30%',aspectRatio:1,borderWidth:1,borderColor:'#7BCDC4',borderRadius:100},
  row:{flexDirection:'row',justifyContent:'space-around',gap:4},
  player:{flex:1,alignItems:'center',gap:5},
  flag:{width:54,height:54,borderRadius:27,overflow:'hidden',backgroundColor:C.white,borderWidth:3,borderColor:'#FFF7D0',alignItems:'center',justifyContent:'center'},
  nation:{fontSize:13,fontWeight:'900',color:C.navy},
  playerLabel:{fontSize:11,fontWeight:'800',color:C.white,textAlign:'center',textShadowColor:'#08532C',textShadowRadius:2,textShadowOffset:{width:0,height:1}},
  actions:{flexDirection:'row',gap:10,flexWrap:'wrap'},
  success:{padding:20,borderWidth:2,borderColor:C.gold,borderRadius:18,backgroundColor:C.panel,gap:12}
});
