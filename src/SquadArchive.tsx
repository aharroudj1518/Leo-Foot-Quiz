import React,{useState} from 'react';
import {Pressable,Text,TextInput,View} from 'react-native';
import chapters from './content/squad-chapters.json';
import {Button,C,Icon,s} from './ui';
export function SquadArchive({solved,onStart,onBack}:{solved:string[];onStart:(code:string)=>void;onBack:()=>void}){
  const [search,setSearch]=useState('');const won=new Set(solved);
  const matches=chapters.filter(c=>(c.name+' '+c.code).toLowerCase().includes(search.trim().toLowerCase()));
  return <View style={s.section}><Button title="Back to play" secondary onPress={onBack}/><Text style={s.h1}>The world stage</Text><Text style={s.body}>48 countries. 1,248 player questions. Pick a squad and work through its archive.</Text><TextInput accessibilityLabel="Find a country" placeholder="Find a country or code" value={search} onChangeText={setSearch} style={s.input}/>
    {matches.length===0&&<Text style={s.body}>No matching country. Try a different name or code.</Text>}
    {matches.map(c=>{const done=c.questionIds.filter(id=>won.has(id)).length;return <Pressable key={c.code} accessibilityRole="button" accessibilityLabel={`${c.name} squad, ${done} of ${c.questionIds.length} solved`} onPress={()=>onStart(c.code)} style={({pressed})=>({padding:18,borderRadius:14,backgroundColor:pressed?C.pale:'white',flexDirection:'row',alignItems:'center',gap:14})}><View style={{backgroundColor:C.ink,padding:12,borderRadius:9}}><Text style={{color:C.lime,fontWeight:'800'}}>{c.code}</Text></View><View style={{flex:1,gap:5}}><Text style={s.modeTitle}>{c.name}</Text><Text style={s.tiny}>{done}/{c.questionIds.length} solved · Group {c.group}</Text></View><Icon name={done===c.questionIds.length?'trophy':'arrow-forward'}/></Pressable>;})}
    <Text style={s.tiny}>Historical squad and club information · 2026 archive</Text>
  </View>;
}
export function SquadClue({country,number,club}:{country:string;number:number;club:string}){
  return <View testID="squad-clue" style={{backgroundColor:'#103D3B',padding:22,borderRadius:18,alignItems:'center',gap:10,marginBottom:20}}><Text style={{color:'#F4CF55',fontWeight:'800',letterSpacing:2}}>{country.toUpperCase()}</Text><Text style={{fontSize:66,lineHeight:78,fontWeight:'900',color:'white',fontVariant:['tabular-nums']}}>{number}</Text><Text style={{fontSize:16,color:'white',textAlign:'center'}}>{club}</Text><Text style={{fontSize:11,color:'#C4D6D0'}}>2026 WORLD CUP SQUAD</Text></View>;
}
