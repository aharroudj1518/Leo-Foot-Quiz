import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {C,Icon} from './ui';
import type {Mode,Profile,Question} from './core/quiz';
const collections=[['portraits','Player album'],['badges','Club badges'],['stadiums','Away days'],['connections','Club connections']] as const;
export function CollectionProgress({bank,profile,onStart}:{bank:Question[];profile:Profile;onStart:(mode:Mode)=>void}){
  const solved=new Set(profile.solved??[]);
  return <View style={{gap:12,marginBottom:24}}><Text style={{fontSize:22,fontWeight:'800',color:C.ink}}>Your trophy cabinet</Text><Text style={{fontSize:13,lineHeight:19,color:C.muted}}>Every correct answer fills your collection. Replays never erase a win.</Text>
    {collections.map(([mode,title])=>{
      const items=bank.filter(q=>q.category===mode&&!q.premium),count=items.filter(q=>solved.has(q.id)).length;
      const complete=items.length>0&&count===items.length;
      return <Pressable key={mode} accessibilityRole="button" accessibilityLabel={`${title}, ${count} of ${items.length} solved`} onPress={()=>onStart(mode)} style={({pressed})=>({backgroundColor:complete?'#FFF2C6':'white',padding:16,borderRadius:14,gap:12,opacity:pressed?.8:1})}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}><Icon name={complete?'trophy':'ribbon-outline'} color={complete?'#976C12':C.green}/><Text style={{flex:1,fontSize:16,fontWeight:'700',color:C.ink}}>{title}</Text><Text style={{fontWeight:'800',color:C.green,fontVariant:['tabular-nums']}}>{count}/{items.length}</Text></View>
        <View accessibilityRole="progressbar" accessibilityValue={{min:0,max:items.length,now:count}} accessibilityLabel={title} style={{height:6,backgroundColor:C.line,borderRadius:3,overflow:'hidden'}}><View style={{width:`${items.length?count/items.length*100:0}%`,height:6,backgroundColor:complete?'#C79725':C.green}}/></View>
        {complete&&<Text style={{fontSize:12,fontWeight:'700',color:'#76540D'}}>Collection complete · Play again</Text>}
      </Pressable>;
    })}
  </View>;
}
