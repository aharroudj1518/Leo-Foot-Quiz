import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {answerWords,assembleAnswer,letterPool} from './core/letters';
import {shuffled} from './core/quiz';
import {Button,C,Icon} from './ui';

export function LetterBoard({answer,seed,disabled,onSubmit}:{answer:string;seed:string;disabled:boolean;onSubmit:(value:string)=>void}){
  const words=useMemo(()=>answerWords(answer),[answer]);
  const pool=useMemo(()=>letterPool(answer,seed),[answer,seed]);
  const [selected,setSelected]=useState<number[]>([]),[shuffle,setShuffle]=useState(0);
  const count=words.join('').length;
  const display=shuffled(pool,seed+':shuffle:'+shuffle);
  const value=assembleAnswer(words,pool,selected);
  let offset=0;
  return <View style={styles.board} testID="letter-board">
    <Text style={styles.instruction}>Tap the letters to build the name</Text>
    <View style={styles.words}>{words.map((word,wordIndex)=>{
      const start=offset;offset+=word.length;
      return <View key={wordIndex} style={styles.word}>{word.split('').map((_,i)=>{
        const index=start+i,id=selected[index],letter=pool.find(tile=>tile.id===id)?.letter;
        return <Pressable key={index} accessibilityRole="button" accessibilityLabel={letter?`Remove ${letter} at position ${index+1}`:`Empty position ${index+1}`} disabled={disabled||id===undefined} onPress={()=>setSelected(s=>s.filter((_,at)=>at!==index))} style={[styles.slot,letter&&styles.filled]}><Text style={styles.letter}>{letter??''}</Text></Pressable>;
      })}</View>;
    })}</View>
    <Text accessibilityLiveRegion="polite" style={styles.progress}>{selected.length} of {count} letters placed</Text>
    <View style={styles.pool}>{display.map(tile=>{
      const used=selected.includes(tile.id);
      return <Pressable key={tile.id} accessibilityRole="button" accessibilityLabel={`Letter ${tile.letter}, tile ${tile.id+1}`} accessibilityState={{disabled:disabled||used||selected.length>=count}} disabled={disabled||used||selected.length>=count} onPress={()=>setSelected(s=>s.length<count&&!s.includes(tile.id)?[...s,tile.id]:s)} style={({pressed})=>[styles.tile,used&&styles.used,pressed&&{transform:[{translateY:2}]}]}><Text style={[styles.letter,used&&{color:C.line}]}>{tile.letter}</Text></Pressable>;
    })}</View>
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel="Shuffle letters" disabled={disabled} onPress={()=>setShuffle(n=>n+1)} style={styles.action}><Icon name="shuffle" size={20}/><Text style={styles.actionText}>Shuffle</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Undo last letter" disabled={disabled||!selected.length} onPress={()=>setSelected(s=>s.slice(0,-1))} style={styles.action}><Icon name="backspace-outline" size={20}/><Text style={styles.actionText}>Undo</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Clear letters" disabled={disabled||!selected.length} onPress={()=>setSelected([])} style={styles.action}><Text style={styles.actionText}>Clear</Text></Pressable>
    </View>
    <Button title="Check name" disabled={disabled||selected.length!==count} onPress={()=>onSubmit(value)}/>
  </View>;
}
const styles=StyleSheet.create({
  board:{gap:16},instruction:{color:C.muted,fontSize:14},words:{flexDirection:'row',flexWrap:'wrap',gap:12},word:{flexDirection:'row',flexWrap:'wrap',gap:4},
  slot:{width:30,minHeight:44,borderBottomWidth:2,borderColor:C.green,backgroundColor:'#E3ECE8',alignItems:'center',justifyContent:'center',borderRadius:5},filled:{backgroundColor:'#F4CF55'},
  letter:{fontSize:19,fontWeight:'800',color:C.ink},progress:{fontSize:12,color:C.muted},pool:{flexDirection:'row',flexWrap:'wrap',gap:7},
  tile:{minWidth:44,minHeight:48,alignItems:'center',justifyContent:'center',backgroundColor:'white',borderRadius:9,borderWidth:1,borderBottomWidth:3,borderColor:'#CBD8D2'},used:{backgroundColor:'#E5EBE7',borderBottomWidth:1},
  actions:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:8},action:{minHeight:44,flexDirection:'row',alignItems:'center',gap:6},actionText:{fontSize:13,fontWeight:'700',color:C.ink}
});
