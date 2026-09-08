# Visual Re-skin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rights-safe imagery (nation flags, striped pitch, kit-colour club cards, letter-tile answers, journey rows) to the existing Leoqo quiz without new content or licences.

**Architecture:** Generated data (`nations.json`, `clubs.json`, `Question.nation`) comes out of `scripts/build-content.py`; two new `validateBank` rules keep it complete. Pure tile logic lives in `src/core/tiles.ts`. Presentational components live in a new `src/visuals.tsx`; `App.tsx` stays the single screen file and only swaps sub-trees. Styles go into the existing one-line groups in `src/ui.tsx`.

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript strict, Vitest, Playwright (static `dist/`), Python 3 for the content generator. No new dependencies.

**Working directory for every command:** `apps/mobile/`. Spec: `docs/superpowers/specs/2026-09-08-visual-reskin-design.md`.

**Conventions to keep:** `App.tsx`, `ui.tsx` and `i18n.ts` use one dense line per unit. Do not reformat. Every interactive element gets `accessibilityRole` and `accessibilityLabel`. `src/content/*.json` is generated only; edit the Python script and rerun it. Run `npm run check` (typecheck + unit) before every commit.

**Editing gotcha:** Bash heredocs on this machine turn `\n` inside quoted strings into real newlines. When a step inserts a string containing `\n`, use the Edit tool, not a heredoc.

---

### Task 1: Generated nation and club data plus validation rules

**Files:**
- Modify: `scripts/build-content.py` (after the `club_countries=` line; the `elif q['category']=='players':` block; the file-writing block at the end)
- Modify: `src/core/quiz.ts` (`Question` type, `validateBank`)
- Modify: `tests/quiz.test.ts`
- Generated: `src/content/nations.json`, `src/content/clubs.json`, `src/content/questions.json`

- [ ] **Step 1: Write the failing validation tests**

Add to `tests/quiz.test.ts` inside the `'published shape and answer correctness'` describe, just before the line starting `it('handles empty filtered pools explicitly'`:

```ts
it('names a nation for every world option and a club card for every club answer and career stop',()=>{expect(validateBank(bank,nations,clubs)).toEqual([]);});
it('flags a world option without a nation entry',()=>{const q={...bank.find(q=>q.category==='world')!,id:'nat'};expect(validateBank([q],{},clubs)).toContain('Unknown nation in options: nat');});
it('flags a club answer without a club card',()=>{const q={...bank.find(q=>q.category==='clubs')!,id:'card'};expect(validateBank([q],nations,{})).toContain('Missing club card: card');});
it('flags a career stop without a club card',()=>{const q={...bank.find(q=>q.prompt.includes('→'))!,id:'trail'};expect(validateBank([q],nations,{})).toContain('Missing club card: trail');});
```

Change the imports at the top of the file to:

```ts
import {describe,it,expect} from 'vitest';
import data from '../src/content/questions.json';
import nationData from '../src/content/nations.json';
import clubData from '../src/content/clubs.json';
import {advance,ClubInfo,correctAnswer,hydrate,initialProfile,makeSession,mastery,normalize,Question,submit,validateBank} from '../src/core/quiz';
const bank=data as Question[],nations=nationData as Record<string,string>,clubs=clubData as unknown as Record<string,ClubInfo>;
```

- [ ] **Step 2: Run the test file to verify it fails**

Run: `npx vitest run tests/quiz.test.ts`
Expected: FAIL. Either "Cannot find module '../src/content/nations.json'" or the four new tests fail because `validateBank` ignores extra arguments.

- [ ] **Step 3: Extend the generator with nation and club tables**

In `scripts/build-content.py`, insert immediately after the line that starts `club_countries={` (it is one long line):

```python
nations={'Uruguay':'UY','Brazil':'BR','Argentina':'AR','France':'FR','Italy':'IT','Germany':'DE','Spain':'ES','West Germany':'DE','England':'GB-ENG','Netherlands':'NL','Portugal':'PT','Sweden':'SE','Japan':'JP','Norway':'NO','United States':'US','Soviet Union':'RU','Denmark':'DK','Greece':'GR','Czechoslovakia':'CZ','Croatia':'HR','Ivory Coast':'CI','Egypt':'EG','Senegal':'SN','Poland':'PL','Australia':'AU'}
# West Germany, Soviet Union and Czechoslovakia map to present-day codes; England uses the GB-ENG subdivision code which the app renders as the England flag.
club_cards={
'Real Madrid':(['#FFFFFF','#1E3A8A'],'Madrid',1902),'AC Milan':(['#C8102E','#000000'],'Milan',1899),'Bayern Munich':(['#DC052D','#FFFFFF'],'Munich',1900),'Liverpool':(['#C8102E','#C8102E'],'Liverpool',1892),
'Barcelona':(['#A50044','#004D98'],'Barcelona',1899),'Manchester United':(['#DA291C','#DA291C'],'Manchester',1878),'Chelsea':(['#034694','#034694'],'London',1905),'Inter Milan':(['#0068A8','#000000'],'Milan',1908),
'Porto':(['#00428C','#FFFFFF'],'Porto',1893),'Ajax':(['#D2122E','#FFFFFF'],'Amsterdam',1900),'Juventus':(['#000000','#FFFFFF'],'Turin',1897),'Borussia Dortmund':(['#FDE100','#000000'],'Dortmund',1909),
'Manchester City':(['#6CABDD','#6CABDD'],'Manchester',1880),'Benfica':(['#E83030','#FFFFFF'],'Lisbon',1904),'Celtic':(['#008A4C','#FFFFFF'],'Glasgow',1887),'Feyenoord':(['#E4001B','#FFFFFF'],'Rotterdam',1908),
'Nottingham Forest':(['#DD0000','#DD0000'],'Nottingham',1865),'Aston Villa':(['#670E36','#95BFE5'],'Birmingham',1874),'Hamburg':(['#0A3F86','#FFFFFF'],'Hamburg',1887),'Steaua București':(['#E30613','#0033A0'],'Bucharest',1947),
'PSV Eindhoven':(['#ED1C24','#FFFFFF'],'Eindhoven',1913),'Red Star Belgrade':(['#E30613','#FFFFFF'],'Belgrade',1945),'Marseille':(['#FFFFFF','#2FAEE0'],'Marseille',1899),
'Paris Saint-Germain':(['#004170','#DA291C'],'Paris',1970),'Inter Miami':(['#F7B5CD','#231F20'],'Miami',2018),'Sporting CP':(['#008D5E','#FFFFFF'],'Lisbon',1906),'Monaco':(['#E4002B','#FFFFFF'],'Monaco',1924),
'Arsenal':(['#EF0107','#FFFFFF'],'London',1886),'Cannes':(['#E4002B','#FFFFFF'],'Cannes',1902),'Bordeaux':(['#001F5B','#FFFFFF'],'Bordeaux',1881),'LA Galaxy':(['#FFFFFF','#00245D'],'Los Angeles',1994),
'Dinamo Zagreb':(['#0033A0','#0033A0'],'Zagreb',1945),'Tottenham Hotspur':(['#FFFFFF','#132257'],'London',1882),'Guingamp':(['#E4002B','#000000'],'Guingamp',1912),'Atlético Madrid':(['#CB3524','#FFFFFF'],'Madrid',1903),
'Groningen':(['#00A651','#FFFFFF'],'Groningen',1971),'Basel':(['#E4002B','#0033A0'],'Basel',1893),'Roma':(['#8E1F2F','#F0BC42'],'Rome',1927),'Metz':(['#8E1F2F','#FFFFFF'],'Metz',1932),
'Salzburg':(['#E4002B','#FFFFFF'],'Salzburg',1933),'Southampton':(['#D71920','#FFFFFF'],'Southampton',1885),'Lech Poznań':(['#0033A0','#FFFFFF'],'Poznań',1922),'Lyon':(['#FFFFFF','#DA291C'],'Lyon',1950),
'Western New York Flash':(['#005DAA','#FFFFFF'],'Rochester',2008),'Portland Thorns':(['#8B0000','#000000'],'Portland',2012),'Orlando Pride':(['#633492','#FFFFFF'],'Orlando',2015),'Perth Glory':(['#5E2D91','#FFFFFF'],'Perth',1995),
'Sky Blue FC':(['#87CEEB','#FFFFFF'],'New Jersey',2007),'Chicago Red Stars':(['#C8102E','#8CC8FF'],'Chicago',2006)}
```

Then in the post-processing loop change the players branch. Find:

```python
 elif q['category']=='players':
  i=int(q['id'].split('-')[-1]);q['difficulty']='starter' if i in [1,2,3,5,14,16] else 'fan' if i in [4,7,9,10,12,17,20] else 'expert'
```

Replace with:

```python
 elif q['category']=='players':
  i=int(q['id'].split('-')[-1]);q['difficulty']='starter' if i in [1,2,3,5,14,16] else 'fan' if i in [4,7,9,10,12,17,20] else 'expert';q['nation']=nations[players[i-1][2]]
```

Finally, after the line that writes `editorial-status.json`, add:

```python
(folder/'nations.json').write_text(json.dumps(nations,ensure_ascii=False,indent=2),encoding='utf8')
(folder/'clubs.json').write_text(json.dumps({k:dict(colours=v[0],city=v[1],founded=v[2]) for k,v in club_cards.items()},ensure_ascii=False,indent=2),encoding='utf8')
```

- [ ] **Step 4: Regenerate the bank**

Run: `python scripts/build-content.py`
Expected: `Created 160 questions, 120 free, 40 pack questions.` and `src/content/nations.json` and `src/content/clubs.json` now exist.

- [ ] **Step 5: Add the type and the two rules to quiz.ts**

In `src/core/quiz.ts` change the `Question` type to:

```ts
export type Question = {
  id: string; prompt: string; answer: string; options: string[]; aliases?: string[];
  explanation: string; hint: string; category: Exclude<Mode, 'mixed'>;
  difficulty: Difficulty; source: string; era: string; premium?: boolean; nation?: string;
};
export type ClubInfo = { colours: [string, string]; city: string; founded: number };
export function careerStops(prompt: string): string[] {
  if (!prompt.includes('→')) return [];
  return prompt.split('\n\n')[1].replace(/\s*\(.*?\)\s*/g, '').split('→').map(x => x.trim()).filter(Boolean);
}
```

Replace the whole `validateBank` function with:

```ts
export function validateBank(bank: Question[], nations?: Record<string, string>, clubs?: Record<string, ClubInfo>): string[] {
  const errors: string[] = []; const ids = new Set<string>();
  for (const q of bank) {
    if (ids.has(q.id)) errors.push(`Duplicate id: ${q.id}`); ids.add(q.id);
    if (q.options.length !== 4 || new Set(q.options.map(normalize)).size !== 4) errors.push(`Invalid options: ${q.id}`);
    if (q.options.filter(o => correctAnswer(q, o)).length !== 1) errors.push(`Expected exactly one correct option: ${q.id}`);
    if (!q.explanation || !q.hint || !q.era || !q.source.startsWith('https://')) errors.push(`Missing provenance: ${q.id}`);
    if (normalize(q.prompt).includes(normalize(q.answer))) errors.push(`Answer leaked in prompt: ${q.id}`);
    if (nations && q.category === 'world' && q.options.some(o => !nations[o])) errors.push(`Unknown nation in options: ${q.id}`);
    if (clubs && ((q.category === 'clubs' || q.category === 'legends') && !clubs[q.answer] || careerStops(q.prompt).some(c => !clubs[c]))) errors.push(`Missing club card: ${q.id}`);
  }
  return errors;
}
```

- [ ] **Step 6: Run the whole unit suite and typecheck**

Run: `npm run check`
Expected: typecheck clean, `Tests  37 passed (37)` (33 existing + 4 new).

- [ ] **Step 7: Commit**

```bash
git add scripts/build-content.py src/core/quiz.ts tests/quiz.test.ts src/content/
git commit -m "Generate nation and club card data and validate coverage"
```

---

### Task 2: Letter-tile logic

**Files:**
- Create: `src/core/tiles.ts`
- Create: `tests/tiles.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/tiles.test.ts`:

```ts
import {describe,it,expect} from 'vitest';
import {assembled,makeTiles,place,remove} from '../src/core/tiles';
import {correctAnswer,Question} from '../src/core/quiz';
const q={id:'x',prompt:'',answer:'Luka Modrić',options:[],explanation:'',hint:'',category:'players',difficulty:'fan',source:'https://x',era:''} as Question;
describe('letter tiles',()=>{
it('is deterministic for a seed and different for another',()=>{expect(makeTiles('Ajax','s1')).toEqual(makeTiles('Ajax','s1'));expect(makeTiles('Ajax','s1').pool).not.toEqual(makeTiles('Ajax','s2').pool);});
it('keeps spaces as fixed slots and offers every answer letter plus four decoys',()=>{const t=makeTiles('Luka Modrić','seed');expect(t.slots).toHaveLength(11);expect(t.slots[4]).toBe(' ');expect(t.pool).toHaveLength(14);for(const c of 'lukamodric')expect(t.pool).toContain(c);});
it('places into the next empty slot and removing returns the letter to the pool',()=>{let t=makeTiles('Ajax','seed');const first=t.pool[0]!;t=place(t,0);expect(t.slots[0]).toBe(first);expect(t.pool[0]).toBeNull();t=remove(t,0);expect(t.slots[0]).toBeNull();expect(t.pool.filter(Boolean)).toHaveLength(8);});
it('ignores placing a used tile or removing an empty or space slot',()=>{let t=makeTiles('Ajax','seed');t=place(t,0);expect(place(t,0)).toBe(t);expect(remove(t,3)).toBe(t);const m=makeTiles('a b','seed');expect(remove(m,1)).toBe(m);});
it('assembles only when full and the result satisfies correctAnswer',()=>{let t=makeTiles(q.answer,'seed');expect(assembled(t)).toBeNull();for(const c of 'lukamodric'){t=place(t,t.pool.indexOf(c));}expect(assembled(t)).toBe('luka modric');expect(correctAnswer(q,assembled(t)!)).toBe(true);});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/tiles.test.ts`
Expected: FAIL with "Failed to resolve import '../src/core/tiles'".

- [ ] **Step 3: Implement tiles.ts**

Create `src/core/tiles.ts`:

```ts
import { normalize, shuffled } from './quiz';
export type TileState = { slots: (string | null)[]; pool: (string | null)[] };
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
export function makeTiles(answer: string, seed: string): TileState {
  const letters = normalize(answer).split('');
  const need = letters.filter(c => c !== ' ');
  const decoys = shuffled(ALPHABET.filter(c => !need.includes(c)), seed + ':decoy').slice(0, 4);
  return { slots: letters.map(c => (c === ' ' ? ' ' : null)), pool: shuffled([...need, ...decoys], seed + ':pool') };
}
export function place(state: TileState, poolIndex: number): TileState {
  const letter = state.pool[poolIndex]; const i = state.slots.indexOf(null);
  if (letter == null || i < 0) return state;
  const slots = [...state.slots]; slots[i] = letter; const pool = [...state.pool]; pool[poolIndex] = null;
  return { slots, pool };
}
export function remove(state: TileState, slotIndex: number): TileState {
  const letter = state.slots[slotIndex];
  if (letter == null || letter === ' ') return state;
  const slots = [...state.slots]; slots[slotIndex] = null; const pool = [...state.pool]; pool[pool.indexOf(null)] = letter;
  return { slots, pool };
}
export function assembled(state: TileState): string | null { return state.slots.includes(null) ? null : state.slots.join(''); }
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/tiles.test.ts`
Expected: `Tests  5 passed (5)`.

- [ ] **Step 5: Commit**

```bash
git add src/core/tiles.ts tests/tiles.test.ts
git commit -m "Add seeded letter-tile answer logic"
```

---

### Task 3: Visual primitives and styles

**Files:**
- Create: `src/visuals.tsx`
- Modify: `src/ui.tsx` (append style groups inside `StyleSheet.create`)
- Modify: `src/i18n.ts` (new keys)
- Modify: `tests/i18n.test.ts`

- [ ] **Step 1: Write the failing i18n test**

Add to `tests/i18n.test.ts` before the `'has no empty strings'` test:

```ts
it('has strings for tiles, club cards and the journey block',()=>{expect(t('tiles_clear')).toBe('Clear letters');expect(t('club_founded',{year:1899})).toBe('Founded 1899');expect(t('journey_h2')).toBe('Your journey');});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/i18n.test.ts`
Expected: FAIL, `expected undefined to be 'Clear letters'`.

- [ ] **Step 3: Add the i18n keys**

In `src/i18n.ts`, after the line `quiz_use_choices:'Use answer choices',` add a new line:

```ts
tiles_clear:'Clear letters',tiles_letter:'Letter {letter}',tiles_used:'Used letter',tiles_slot_empty:'Slot {n}, empty',tiles_slot_letter:'Slot {n}, letter {letter}',tiles_hint:'Tap the letters to spell the answer.',club_founded:'Founded {year}',journey_h2:'Your journey',journey_progress:'{seen} of {total} questions played',journey_star:'Mastered',
```

- [ ] **Step 4: Run the i18n tests**

Run: `npx vitest run tests/i18n.test.ts`
Expected: `Tests  6 passed (6)`.

- [ ] **Step 5: Append styles to ui.tsx**

In `src/ui.tsx`, inside `StyleSheet.create({ ... })`, append a new line before the closing `});`:

```ts
pitchBg:{backgroundColor:'#155E43',borderRadius:20,padding:22,overflow:'hidden'},pitchStripe:{position:'absolute',left:0,right:0,backgroundColor:'#155E43'},pitchStripeAlt:{backgroundColor:'#1C6A4D'},pitchLine:{position:'absolute',left:0,right:0,top:'50%',height:2,backgroundColor:'rgba(255,255,255,.3)'},pitchRing:{position:'absolute',alignSelf:'center',top:'50%',marginTop:-40,width:80,height:80,borderRadius:40,borderWidth:2,borderColor:'rgba(255,255,255,.3)'},pitchBox:{position:'absolute',alignSelf:'center',width:'50%',height:52,borderWidth:2,borderColor:'rgba(255,255,255,.3)'},heroPitch:{width:'100%',maxWidth:270,minHeight:190,justifyContent:'center'},
flag:{backgroundColor:C.white,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:C.line,overflow:'hidden'},flagText:{textAlign:'center'},
kit:{width:34,height:44,borderRadius:8,overflow:'hidden',flexDirection:'row',borderWidth:1,borderColor:C.line},kitSmall:{width:18,height:24,borderRadius:5},clubChip:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderRadius:10,paddingVertical:6,paddingHorizontal:10},clubChipText:{fontWeight:'700',color:C.ink,fontSize:15},clubCard:{flexDirection:'row',alignItems:'center',gap:14,backgroundColor:C.white,borderRadius:14,padding:14,borderWidth:1,borderColor:C.line},trailRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:8,marginTop:14},
tileRow:{flexDirection:'row',flexWrap:'wrap',gap:6},tile:{width:38,height:46,borderRadius:8,backgroundColor:C.white,borderWidth:1.5,borderColor:C.line,alignItems:'center',justifyContent:'center'},tileSlot:{backgroundColor:C.pale,borderStyle:'dashed'},tileFilled:{backgroundColor:C.lime,borderColor:C.green,borderStyle:'solid'},tileGap:{width:14},tileText:{fontSize:20,fontWeight:'800',color:C.ink},
journeyRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,borderBottomWidth:1,borderColor:C.line},journeyBar:{height:8,borderRadius:4,backgroundColor:C.pale,overflow:'hidden'},journeyFill:{height:'100%',backgroundColor:C.green},silhouette:{width:47,height:47,borderRadius:14,backgroundColor:C.pale,alignItems:'center',justifyContent:'flex-end',overflow:'hidden'},silhouetteHead:{width:16,height:16,borderRadius:8,backgroundColor:C.muted,marginBottom:2},silhouetteBody:{width:30,height:14,borderTopLeftRadius:15,borderTopRightRadius:15,backgroundColor:C.muted},
```

- [ ] **Step 6: Create visuals.tsx**

Create `src/visuals.tsx`:

```tsx
import React, {useEffect,useState} from 'react';
import {Pressable,Text,View,ViewStyle,StyleProp} from 'react-native';
import {C,Icon,s} from './ui';
import {t} from './i18n';
import {ClubInfo} from './core/quiz';
import {assembled,makeTiles,place,remove} from './core/tiles';
// Regional-indicator emoji for ISO alpha-2 codes; GB-ENG uses the England tag sequence. No image assets, no network.
export function flagEmoji(code:string){if(code==='GB-ENG')return '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';return code.toUpperCase().replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0)));}
export function Flag({code,name,size=30}:{code:string;name:string;size?:number}){return <View accessible accessibilityLabel={name} style={[s.flag,{width:size,height:size,borderRadius:size/2}]}><Text style={[s.flagText,{fontSize:size*.58,lineHeight:size}]}>{flagEmoji(code)}</Text></View>;}
export function Pitch({children,style}:{children?:React.ReactNode;style?:StyleProp<ViewStyle>}){return <View style={[s.pitchBg,style]}>{[0,1,2,3,4,5].map(i=><View key={i} style={[s.pitchStripe,{top:`${i*100/6}%`,height:`${100/6}%`},i%2===1&&s.pitchStripeAlt]}/>)}<View style={s.pitchLine}/><View style={s.pitchRing}/><View style={[s.pitchBox,{top:-2}]}/><View style={[s.pitchBox,{bottom:-2}]}/><View style={{zIndex:1}}>{children}</View></View>;}
export function Kit({card,small=false}:{card:ClubInfo;small?:boolean}){return <View style={[s.kit,small&&s.kitSmall]}>{[0,1,2,3].map(i=><View key={i} style={{flex:1,backgroundColor:card.colours[i%2]}}/>)}</View>;}
export function ClubCard({name,card,compact=false}:{name:string;card:ClubInfo;compact?:boolean}){
if(compact)return <View accessible accessibilityLabel={name} style={s.clubChip}><Kit card={card} small/><Text style={s.clubChipText}>{name}</Text></View>;
return <View accessible accessibilityLabel={`${name}, ${card.city}, ${t('club_founded',{year:card.founded})}`} style={s.clubCard}><Kit card={card}/><View style={{flex:1}}><Text style={s.modeTitle}>{name}</Text><Text style={s.small}>{card.city} · {t('club_founded',{year:card.founded})}</Text></View></View>;
}
export function Silhouette(){return <View style={s.silhouette} accessible={false}><View style={s.silhouetteHead}/><View style={s.silhouetteBody}/></View>;}
export function Tiles({answer,seed,disabled,onSubmit}:{answer:string;seed:string;disabled:boolean;onSubmit:(value:string)=>void}){
const [state,setState]=useState(()=>makeTiles(answer,seed));
useEffect(()=>{setState(makeTiles(answer,seed));},[answer,seed]);
const done=assembled(state);
useEffect(()=>{if(done!==null&&!disabled)onSubmit(done);},[done]);
return <View style={{gap:14}}><Text style={s.small}>{t('tiles_hint')}</Text><View style={s.tileRow}>{state.slots.map((c,i)=>c===' '?<View key={i} style={s.tileGap}/>:<Pressable key={i} accessibilityRole="button" accessibilityLabel={c?t('tiles_slot_letter',{n:i+1,letter:c.toUpperCase()}):t('tiles_slot_empty',{n:i+1})} disabled={disabled||!c} onPress={()=>setState(remove(state,i))} style={[s.tile,s.tileSlot,!!c&&s.tileFilled]}><Text style={s.tileText}>{c?c.toUpperCase():''}</Text></Pressable>)}</View><View style={s.tileRow}>{state.pool.map((c,i)=><Pressable key={i} accessibilityRole="button" accessibilityLabel={c?t('tiles_letter',{letter:c.toUpperCase()}):t('tiles_used')} disabled={disabled||!c} onPress={()=>setState(place(state,i))} style={[s.tile,!c&&{opacity:.25}]}><Text style={s.tileText}>{c?c.toUpperCase():''}</Text></Pressable>)}</View><Pressable accessibilityRole="button" accessibilityLabel={t('tiles_clear')} disabled={disabled} onPress={()=>setState(makeTiles(answer,seed))} style={s.textLink}><Icon name="backspace-outline" size={18}/><Text style={s.linkText}>{t('tiles_clear')}</Text></Pressable></View>;
}
```

- [ ] **Step 7: Typecheck and run all unit tests**

Run: `npm run check`
Expected: typecheck clean (visuals.tsx compiles even though nothing imports it yet), `Tests  43 passed (43)`.

- [ ] **Step 8: Commit**

```bash
git add src/visuals.tsx src/ui.tsx src/i18n.ts tests/i18n.test.ts
git commit -m "Add flag, pitch, club card, silhouette and tile components"
```

---

### Task 4: Quiz screen uses the new visuals

**Files:**
- Modify: `App.tsx` (imports, state line, quiz header, options, typed input, hint, reveal)
- Modify: `e2e/app.spec.ts`

Use the Edit tool for every replacement in this task; several anchors contain `\n`.

- [ ] **Step 1: Write the failing e2e test**

Append to `e2e/app.spec.ts`:

```ts
test('a typed answer spelled with letter tiles reaches the reveal',async({page})=>{
await page.goto('/');await page.getByRole('tab',{name:'Explore',exact:true}).click();await page.getByRole('button',{name:/Who’s the player\?/}).click();
await expect(page.getByText('QUESTION 1 OF 10')).toBeVisible();await page.getByRole('button',{name:'I’d rather type the name',exact:true}).click();
await expect(page.getByText('Tap the letters to spell the answer.')).toBeVisible();
const letters=page.getByRole('button',{name:/^Letter [A-Z]$/});const n=await letters.count();expect(n).toBeGreaterThan(4);
await letters.first().click();await expect(page.getByRole('button',{name:/^Slot 1, letter [A-Z]$/})).toBeVisible();
await page.getByRole('button',{name:'Clear letters',exact:true}).click();await expect(page.getByRole('button',{name:'Slot 1, empty',exact:true})).toBeVisible();
const pool=page.getByRole('button',{name:/^Letter [A-Z]$/});for(let i=0;i<n;i++){const slots=await page.getByRole('button',{name:/^Slot \d+, empty$/}).count();if(slots===0)break;await pool.nth(i).click();}
await expect(page.getByText(/One for the memory bank\.|Spot on\./)).toBeVisible();
});
```

Before running, confirm the exact correct-feedback string: `grep -n "quiz_feedback_correct" src/i18n.ts`. If it is not "Spot on." replace it in the regex above with the real string.

- [ ] **Step 2: Build and run the new e2e test to verify it fails**

Run: `npm run build:web && npx playwright test -g "letter tiles"`
Expected: FAIL, "Tap the letters to spell the answer." not found.

- [ ] **Step 3: Update imports and state in App.tsx**

Replace the import line

```tsx
import {ActivityIndicator,Linking,Platform,Pressable,ScrollView,Share,Switch,Text,TextInput,View,useWindowDimensions,AppState} from 'react-native';
```

with

```tsx
import {ActivityIndicator,Linking,Platform,Pressable,ScrollView,Share,Switch,Text,View,useWindowDimensions,AppState} from 'react-native';
```

Replace

```tsx
import {advance,correctAnswer,Difficulty,hydrate,initialProfile,makeSession,mastery,Mode,Profile,Question,shuffled,submit,TIMER_SECONDS} from './src/core/quiz';
```

with

```tsx
import {advance,careerStops,ClubInfo,correctAnswer,Difficulty,hydrate,initialProfile,makeSession,mastery,Mode,Profile,Question,shuffled,submit,TIMER_SECONDS} from './src/core/quiz';
import nationData from './src/content/nations.json';
import clubData from './src/content/clubs.json';
import {ClubCard,Flag,Kit,Pitch,Silhouette,Tiles} from './src/visuals';
```

After the line `import {t} from './src/i18n';` add:

```tsx
const nations=nationData as Record<string,string>,clubs=clubData as unknown as Record<string,ClubInfo>,nationName=(code:string)=>Object.keys(nations).find(k=>nations[k]===code)??code;
```

Replace the state line

```tsx
const [hint,setHint]=useState(false),[typed,setTyped]=useState(false),[input,setInput]=useState(''),[reporting,setReporting]=useState(false);
```

with

```tsx
const [hint,setHint]=useState(false),[typed,setTyped]=useState(false),[reporting,setReporting]=useState(false);
```

Then search for any remaining `setInput(` or `input` usage: `grep -n "setInput\|input" App.tsx`. Only the `resetQuestion` helper may reference `setInput('')`; delete that call from it.

- [ ] **Step 4: Put the question on a pitch header with career chips**

Replace

```tsx
<Text style={s.era}>{q.era}</Text><Text accessibilityRole="header" style={[s.question,{fontSize:profile.largeText?30:wide?30:25}]}>{q.prompt}</Text>
```

with

```tsx
<Pitch style={{marginTop:14}}><Text style={[s.era,{color:C.lime}]}>{q.era}</Text>{careerStops(q.prompt).length?<><Text accessibilityRole="header" style={[s.question,{color:C.white,fontSize:profile.largeText?30:wide?30:25}]}>{q.prompt.split('\n\n')[0]}</Text><View style={s.trailRow} accessible accessibilityLabel={careerStops(q.prompt).join(', ')}>{careerStops(q.prompt).map((club,i)=><React.Fragment key={i}>{i>0&&<Icon name="arrow-forward" color={C.lime} size={16}/>}{clubs[club]?<ClubCard name={club} card={clubs[club]} compact/>:<Text style={[s.clubChipText,{color:C.white}]}>{club}</Text>}</React.Fragment>)}</View>{/\(.*?\)/.test(q.prompt)&&<Text style={[s.small,{color:C.lime,marginTop:8}]}>{q.prompt.match(/\((.*?)\)/)![1]}</Text>}</>:<Text accessibilityRole="header" style={[s.question,{color:C.white,fontSize:profile.largeText?30:wide?30:25}]}>{q.prompt}</Text>}</Pitch>
```

- [ ] **Step 5: Show flags and kits on options**

Replace

```tsx
<View style={[s.optionLetter,isRight&&{backgroundColor:C.green}]}>
```

with

```tsx
{nations[option]?<Flag code={nations[option]} name={option} size={34}/>:clubs[option]?<Kit card={clubs[option]} small/>:null}<View style={[s.optionLetter,isRight&&{backgroundColor:C.green}]}>
```

- [ ] **Step 6: Replace the text box with tiles**

Replace

```tsx
{typed&&!answer?<View style={{gap:14}}><TextInput autoFocus accessibilityLabel={t('quiz_answer_label')} placeholder={t('quiz_answer_placeholder')} value={input} onChangeText={setInput} onSubmitEditing={()=>{if(input.trim())void choose(input);}} style={[s.input,{fontSize:textSize}]} autoCorrect={false} maxLength={100}/><Button title={t('quiz_check_answer')} disabled={!input.trim()||busy} onPress={()=>{void choose(input);}}/></View>:
```

with

```tsx
{typed&&!answer?<Tiles answer={q.answer} seed={session.seed+q.id} disabled={busy} onSubmit={value=>{void choose(value);}}/>:
```

- [ ] **Step 7: Flag beside the hint**

Replace

```tsx
{hint&&<Text accessibilityLiveRegion="polite" style={[body,s.hint]}>{q.hint}</Text>}
```

with

```tsx
{hint&&<View accessibilityLiveRegion="polite" style={[s.hint,{flexDirection:'row',gap:12,alignItems:'center'}]}>{q.nation&&<Flag code={q.nation} name={nationName(q.nation)}/>}<Text style={[body,{flex:1}]}>{q.hint}</Text></View>}
```

- [ ] **Step 8: Visual in the reveal panel**

Replace

```tsx
<Text style={[s.modeTitle,{fontSize:22}]}>{q.answer}</Text><Text style={body}>{q.explanation}</Text>
```

with

```tsx
<View style={{flexDirection:'row',alignItems:'center',gap:12}}>{nations[q.answer]&&<Flag code={nations[q.answer]} name={q.answer} size={44}/>}<Text style={[s.modeTitle,{fontSize:22,flex:1}]}>{q.answer}</Text></View>{clubs[q.answer]&&<ClubCard name={q.answer} card={clubs[q.answer]}/>}<Text style={body}>{q.explanation}</Text>
```

- [ ] **Step 9: Typecheck, unit tests, rebuild, full e2e**

Run: `npm run check && npm run build:web && npx playwright test`
Expected: typecheck clean, 43 unit tests pass, Playwright reports `14 passed` (the previous 12 plus the tile test on both projects, desktop and phone). If a pre-existing test fails on an accessibility name, the option label changed: options must still be announced as `${option}` plus the correct suffix, which Step 5 preserves because the Flag is a sibling, not a wrapper.

- [ ] **Step 10: Commit**

```bash
git add App.tsx e2e/app.spec.ts
git commit -m "Quiz screen: pitch header, flags and kits on options, tile answers"
```

---

### Task 5: Play tab visuals and journey rows

**Files:**
- Modify: `App.tsx` (hero, `modeRow`, Play tab block)
- Modify: `e2e/app.spec.ts`

- [ ] **Step 1: Write the failing e2e test**

Append to `e2e/app.spec.ts`:

```ts
test('the journey block reports played questions per difficulty',async({page})=>{
await page.goto('/');await expect(page.getByText('Your journey')).toBeVisible();await expect(page.getByText(/0 of \d+ questions played/).first()).toBeVisible();
await page.getByRole('button',{name:'Let’s play',exact:true}).click();await page.getByRole('button',{name:'Skip question',exact:true}).click();await page.getByRole('button',{name:'Save and leave round'}).click();
await expect(page.getByText(/1 of \d+ questions played/)).toBeVisible();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test -g "journey block"`
Expected: FAIL, "Your journey" not visible.

- [ ] **Step 3: Hero pitch on every width**

In the Play tab block replace

```tsx
{wide&&<View style={s.pitchFrame} accessible={false}><View style={s.pitch}><View style={s.pitchHalf}/><View style={s.pitchCircle}/><View style={[s.penaltyBox,{top:0}]}/><View style={[s.penaltyBox,{bottom:0}]}/><View style={s.ball}><Icon name="football" color={C.white} size={70}/></View><Text style={s.pitchNumber}>10</Text></View><Text style={s.pitchCaption}>{t('home_pitch_caption')}</Text></View>}
```

with

```tsx
<Pitch style={[s.heroPitch,!wide&&{maxWidth:'100%'}]}><View style={{alignItems:'center',gap:10}}><Icon name="football" color={C.white} size={64}/><Text style={s.pitchCaption}>{t('home_pitch_caption')}</Text></View></Pitch>
```

- [ ] **Step 4: Mode visuals**

In `modeRow` replace

```tsx
<View style={[s.modeIcon,{backgroundColor:mode.tint}]}><Icon name={mode.icon} size={25}/></View>
```

with

```tsx
{mode.id==='world'?<View style={[s.modeIcon,{backgroundColor:mode.tint,flexDirection:'row',gap:-8}]} accessible={false}>{['BR','DE','AR'].map(c=><Flag key={c} code={c} name={c} size={22}/>)}</View>:mode.id==='clubs'?<View style={[s.modeIcon,{backgroundColor:mode.tint,flexDirection:'row',gap:3}]} accessible={false}>{['Real Madrid','AC Milan','Ajax'].map(c=><Kit key={c} card={clubs[c]} small/>)}</View>:mode.id==='players'?<Silhouette/>:<View style={[s.modeIcon,{backgroundColor:mode.tint}]}><Icon name={mode.id==='legends'?'trophy-outline':mode.icon} size={25}/></View>}
```

- [ ] **Step 5: Journey rows**

In the Play tab block replace

```tsx
{difficultyPicker()}<View style={s.modeList}>{modes.slice(0,4).map(modeRow)}</View></View>
```

with

```tsx
{difficultyPicker()}<View style={s.modeList}>{modes.slice(0,4).map(modeRow)}</View><Text style={[s.h2,{marginTop:22,marginBottom:6}]}>{t('journey_h2')}</Text>{(['starter','fan','expert'] as Difficulty[]).map(d=>{const pool=bank.filter(q=>!q.premium&&q.difficulty===d);const seen=pool.filter(q=>profile.seen.includes(q.id)).length;const answers=profile.history.filter(h=>h.difficulty===d&&h.completed).flatMap(h=>h.answers);const star=answers.length>=10&&answers.filter(a=>a.correct).length/answers.length>=.8;return <View key={d} style={s.journeyRow} accessible accessibilityLabel={`${t(`difficulty_${d}`)}, ${t('journey_progress',{seen,total:pool.length})}${star?', '+t('journey_star'):''}`}><View style={{flex:1,gap:6}}><View style={s.sectionHead}><Text style={s.modeTitle}>{t(`difficulty_${d}`)}</Text><Text style={s.small}>{t('journey_progress',{seen,total:pool.length})}</Text></View><View style={s.journeyBar}><View style={[s.journeyFill,{width:`${pool.length?seen/pool.length*100:0}%`}]}/></View></View><Icon name={star?'star':'star-outline'} color={star?C.green:C.line} size={22}/></View>;})}</View>
```

Note: the star uses the correct-answer rate over completed rounds at that difficulty (at least ten answers, 80% or better). `mastery()` groups by category, so it cannot supply a per-difficulty number; this is the closest reading of the spec.

- [ ] **Step 6: Typecheck, rebuild, full e2e**

Run: `npm run check && npm run build:web && npx playwright test`
Expected: typecheck clean, 43 unit tests, Playwright `16 passed`.

- [ ] **Step 7: Commit**

```bash
git add App.tsx e2e/app.spec.ts
git commit -m "Play tab: pitch hero, mode visuals, journey rows"
```

---

### Task 6: Remove dead styles, screenshots, docs

**Files:**
- Modify: `src/ui.tsx` (delete `pitchFrame`, `pitch`, `pitchHalf`, `pitchCircle`, `penaltyBox`, `ball`, `pitchNumber`, `input` groups, now unreferenced)
- Modify: `../../CLAUDE.md` (Phase 2 "Done" line, Test state line, Known gaps)

- [ ] **Step 1: Confirm the styles are unused**

Run: `grep -n "s\.pitchFrame\|s\.pitch\b\|s\.pitchHalf\|s\.pitchCircle\|s\.penaltyBox\|s\.ball\|s\.pitchNumber\|s\.input" App.tsx src/visuals.tsx`
Expected: no output.

- [ ] **Step 2: Delete the eight groups from ui.tsx**

Remove `pitchFrame:{...},pitch:{...},pitchHalf:{...},pitchCircle:{...},penaltyBox:{...},ball:{...},pitchNumber:{...}` and `input:{...}` from the `StyleSheet.create` object. Keep `pitchCaption`.

- [ ] **Step 3: Verify**

Run: `npm run check && npm run build:web && npx playwright test`
Expected: all green, `16 passed`.

- [ ] **Step 4: Phone screenshots for the user**

Create `e2e/tmp-shots.spec.ts`:

```ts
import {test} from '@playwright/test';
test('shots',async({page})=>{
const out=process.env.OUT!;
await page.goto('/');await page.screenshot({path:out+'/home.png',fullPage:true});
await page.getByRole('button',{name:'Let’s play',exact:true}).click();await page.waitForTimeout(300);await page.screenshot({path:out+'/quiz.png',fullPage:true});
await page.getByRole('button',{name:'Skip question',exact:true}).click();await page.waitForTimeout(300);await page.screenshot({path:out+'/answer.png',fullPage:true});
});
```

Run: `OUT="<scratchpad dir>" npx playwright test e2e/tmp-shots.spec.ts --project=phone` then `rm e2e/tmp-shots.spec.ts`. Open the three PNGs and check: pitch header visible, flags on nation options, kit stripes on club options, journey rows on home.

- [ ] **Step 5: Update CLAUDE.md**

In `../../CLAUDE.md`:
- Phase 2 "Done" line: append `, rights-safe visuals (emoji flags, striped pitch, kit-colour club cards, letter-tile answers, journey rows; spec in apps/mobile/docs/superpowers/specs/2026-09-08-visual-reskin-design.md)`.
- Test state line: `43 unit tests`, `16 Playwright e2e`.
- Known gaps: add `5. Lineup detective mode (flags in formation, type the club) is the next spec; real crests and player photos stay out until licences exist.`
- Architecture list: add a bullet `- \`src/visuals.tsx\` — presentational Flag/Pitch/Kit/ClubCard/Silhouette/Tiles components; \`src/core/tiles.ts\` holds the pure tile logic. \`src/content/nations.json\` and \`clubs.json\` are generated alongside the bank.`

- [ ] **Step 6: Commit and push**

```bash
git add src/ui.tsx
git commit -m "Drop styles replaced by the Pitch component"
git push
```

Then commit `../../CLAUDE.md` is outside this git repository; leave it edited on disk.

---

## Self-review

**Spec coverage.** Section 1 data: Task 1 (nations.json, clubs.json, `Question.nation`, two validateBank rules, generator only). Section 2 primitives: Task 2 (tile logic), Task 3 (Flag, Pitch, Kit/ClubCard, Silhouette, Tiles). Section 3 screens: Task 4 (quiz header, option visuals, career chips, tiles, hint flag, reveal visual), Task 5 (hero pitch, mode visuals, journey rows). Section 4 testing: tiles unit tests (Task 2), validate rules (Task 1), tile e2e (Task 4), journey e2e (Task 5), no-external-requests test untouched. Accessibility labels present on Flag, ClubCard, tiles, journey rows.

**Deviations from spec, both deliberate.** The star in the journey block uses the per-difficulty correct rate over completed rounds, not `mastery()`, because `mastery()` is per category. The compact ClubCard on option rows is replaced by a bare `Kit` so the option text is not printed twice.

**Type consistency.** `ClubInfo` defined in `quiz.ts`, imported by `visuals.tsx`, `App.tsx` and the test. `careerStops` defined in Task 1, used in Task 1 rules and Task 4 header. `Kit` exported in Task 3, used in Tasks 4 and 5. `Tiles` props `{answer,seed,disabled,onSubmit}` match Task 4 usage. i18n keys `tiles_*`, `club_founded`, `journey_*` are all defined in Task 3 Step 3.
