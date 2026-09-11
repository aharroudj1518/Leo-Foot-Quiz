import React,{useState} from 'react';
import {Image,Pressable,StyleSheet,Text,View} from 'react-native';
import manifest from '../assets/players/manifest.json';
import questions from './content/visual-questions.json';
import {visualImages} from './VisualExperience';
import {Button,C,Icon} from './ui';
export const playerChapters=[
  {id:'stars',title:'World stars',subtitle:'The faces of the modern game',cover:'bellingham'},
  {id:'women',title:'Game changers',subtitle:'The stars of women’s football',cover:'bonmati'},
  {id:'legends',title:'The greats',subtitle:'Players who defined an era',cover:'ronaldinho'},
] as const;
export type PlayerChapter=typeof playerChapters[number]['id'];
export function chapterQuestions(id:PlayerChapter){return questions.filter(q=>q.category==='portraits'&&(manifest.find(p=>p.id===q.visual.key)?.collection??'stars')===id);}
export function PlayerAlbum({solved,onStart,onBack}:{solved:string[];onStart:(id:PlayerChapter)=>void;onBack:()=>void}){
 const [selected,setSelected]=useState<PlayerChapter>('stars');const won=new Set(solved);
 const chapter=playerChapters.find(c=>c.id===selected)!,items=chapterQuestions(selected),done=items.filter(q=>won.has(q.id)).length;
 return <View style={{gap:22}}>
  <Pressable accessibilityRole="button" onPress={onBack} style={{minHeight:44,flexDirection:'row',alignItems:'center',gap:8}}><Icon name="arrow-back" size={20}/><Text style={a.back}>Back to play</Text></Pressable>
  <View><Text style={a.kicker}>THE PLAYER ALBUM</Text><Text style={a.title}>Know the face.{"\n"}Earn the name.</Text><Text style={a.intro}>Every correct answer reveals a name in your collection. Pick a chapter and fill the page.</Text></View>
  <View accessibilityRole="tablist" style={a.tabs}>{playerChapters.map(c=><Pressable key={c.id} accessibilityRole="tab" accessibilityLabel={c.title} accessibilityState={{selected:c.id===selected}} onPress={()=>setSelected(c.id)} style={[a.tab,c.id===selected&&a.activeTab]}><Text style={[a.tabText,c.id===selected&&{color:'white'}]}>{c.title}</Text></Pressable>)}</View>
  <View style={a.chapter}><Image source={visualImages[chapter.cover]} style={a.cover} accessible={false}/><View style={{flex:1,gap:8}}><Text style={a.chapterTitle}>{chapter.title}</Text><Text style={a.subtitle}>{chapter.subtitle}</Text><Text style={a.count}>{done} / {items.length} names earned</Text><View accessibilityRole="progressbar" accessibilityLabel={`${chapter.title} collection`} accessibilityValue={{min:0,max:items.length,now:done}} aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} style={a.track}><View style={{height:4,width:`${done/items.length*100}%`,backgroundColor:'#F4CF55'}}/></View></View></View>
  <Button title={`Play ${chapter.title}`} onPress={()=>onStart(selected)} icon="play"/>
  <View style={a.grid}>{items.map((q,i)=>{const earned=won.has(q.id);return <View key={q.id} accessibilityLabel={earned?`${q.answer}, collected`:`Uncollected player ${i+1}`} style={a.card}><Image source={visualImages[q.visual.key]} style={a.photo} resizeMode="contain" accessible={false}/><View style={[a.number,earned&&{backgroundColor:'#F4CF55'}]}><Text style={{fontSize:11,fontWeight:'800',color:C.ink}}>{earned?'✓':String(i+1).padStart(2,'0')}</Text></View><View style={a.caption}><Text numberOfLines={2} style={a.name}>{earned?q.answer:'Who am I?'}</Text></View></View>;})}</View>
  {done===items.length&&<Text style={a.complete}>Page complete. Every name earned.</Text>}
 </View>;
}
const a=StyleSheet.create({back:{fontSize:13,fontWeight:'700',color:C.ink},kicker:{fontSize:10,fontWeight:'800',letterSpacing:2,color:C.green,marginBottom:12},title:{fontSize:34,lineHeight:37,fontWeight:'900',letterSpacing:-1.3,color:C.ink},intro:{fontSize:14,lineHeight:22,color:C.muted,marginTop:12,maxWidth:450},tabs:{flexDirection:'row',gap:5},tab:{flex:1,minHeight:48,alignItems:'center',justifyContent:'center',borderRadius:8,padding:6,backgroundColor:'#E2E9E4'},activeTab:{backgroundColor:C.ink},tabText:{fontSize:12,fontWeight:'800',textAlign:'center',color:C.ink},chapter:{flexDirection:'row',gap:18,backgroundColor:C.ink,padding:16,borderRadius:16,alignItems:'center'},cover:{width:82,height:112,borderRadius:7},chapterTitle:{fontSize:22,fontWeight:'800',color:'white'},subtitle:{fontSize:12,lineHeight:18,color:'#D8E4DF'},count:{fontSize:12,fontWeight:'700',color:'#F4CF55',fontVariant:['tabular-nums']},track:{height:4,backgroundColor:'#40606A',overflow:'hidden'},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},card:{width:'30%',flexGrow:1,maxWidth:'32%',borderRadius:9,overflow:'hidden',backgroundColor:'#E1E7DF'},photo:{width:'100%',height:134,backgroundColor:C.ink},number:{position:'absolute',top:7,left:7,padding:5,borderRadius:4,backgroundColor:'#F1EFDF'},caption:{padding:8,minHeight:48,justifyContent:'center'},name:{fontSize:11,lineHeight:15,fontWeight:'800',color:C.ink},complete:{fontSize:16,fontWeight:'800',color:C.green,textAlign:'center',padding:12}});
