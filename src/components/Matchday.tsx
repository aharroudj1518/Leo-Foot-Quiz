import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {getEditionStatus} from '../core/news';
import type {NewsEdition, NewsFeed} from '../core/news';
import {Button, C, Icon, Kicker, s} from '../ui';

export function editionDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
}

type EditionProps = {edition: NewsEdition; now: Date; largeText: boolean; busy: boolean; onPlay: (edition: NewsEdition) => void};

export function MatchdayFeature({edition, now, largeText, busy, onPlay, onBrowse}: EditionProps & {onBrowse: () => void}) {
  const archive = getEditionStatus(edition, now) === 'archive';
  return <View style={n.feature}>
    <View style={s.sectionHead}>
      <View style={n.label}><Icon name="newspaper-outline" color={C.green} size={19}/><Kicker>MATCHDAY BRIEFING</Kicker></View>
      <Text style={n.status}>{archive ? 'FROM THE ARCHIVE' : 'LATEST EDITION'}</Text>
    </View>
    <Text accessibilityRole="header" style={[s.h2, {fontSize: largeText ? 29 : 25}]}>The football happened. Were you watching?</Text>
    <Text style={[s.body, largeText && n.large]}>{edition.title} · {editionDate(edition.publishedAt)}</Text>
    <Text style={[s.body, largeText && n.large]}>Five questions from the football headlines, with the story behind every answer.</Text>
    {archive && <Text style={s.small}>A look back at this edition’s stories. Fresh daily trivia is ready below.</Text>}
    <View style={n.actions}>
      <View style={{flexGrow: 1}}><Button title={archive ? 'Play this archive' : 'Play the news quiz'} icon="arrow-forward" disabled={busy} onPress={() => onPlay(edition)}/></View>
      <Pressable accessibilityRole="button" onPress={onBrowse} style={s.textLink}><Text style={s.linkText}>All briefings</Text><Icon name="arrow-forward" size={17}/></Pressable>
    </View>
    <View style={n.label}><Icon name="checkmark-circle-outline" color={C.green} size={17}/><Text style={s.tiny}>Dated stories · Linked sources · Free to play</Text></View>
  </View>;
}

export function NewsHub({feed, now, largeText, busy, onPlay, onBack, onRefresh, refreshing}: {
  feed: NewsFeed; now: Date; largeText: boolean; busy: boolean;
  onPlay: (edition: NewsEdition) => void; onBack: () => void;
  onRefresh?: () => void; refreshing: boolean;
}) {
  const editions = feed.editions.filter(e => getEditionStatus(e, now) !== 'upcoming')
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return <View style={s.section}>
    <Pressable accessibilityRole="button" onPress={onBack} style={s.back}><Icon name="arrow-back" size={20}/><Text style={s.linkText}>Back to the clubhouse</Text></Pressable>
    <Kicker>FOLLOW THE FOOTBALL</Kicker>
    <Text style={s.h1}>Headlines into highlights.</Text>
    <Text style={[s.body, largeText && n.large]}>A short quiz on the stories shaping the game. Every answer comes with an explanation and a source you can check.</Text>
    {onRefresh && <Button secondary title={refreshing ? 'Checking for new editions…' : 'Check for new editions'} icon="refresh-outline" disabled={refreshing || busy} onPress={onRefresh}/>}
    {!editions.length && <Text style={s.body}>The next briefing is on its way. Daily Five and all free topics are ready to play.</Text>}
    {editions.map(edition => <View key={edition.id} style={n.edition}>
      <View style={s.sectionHead}><Text style={n.status}>{getEditionStatus(edition, now) === 'archive' ? 'ARCHIVE' : 'CURRENT EDITION'}</Text><Text style={s.tiny}>{editionDate(edition.publishedAt)} · 5 questions</Text></View>
      <Text accessibilityRole="header" style={s.h2}>{edition.title}</Text>
      <Text style={[s.body, largeText && n.large]}>{edition.summary}</Text>
      <Text style={s.small}>{getEditionStatus(edition, now) === 'archive' ? 'These questions look back at the events of this edition.' : `Current through ${editionDate(new Date(Date.parse(edition.expiresAt) - 1).toISOString())}. After that, find it in the archive.`}</Text>
      <Button secondary title={`Play briefing · ${editionDate(edition.publishedAt)}`} icon="arrow-forward" disabled={busy} onPress={() => onPlay(edition)}/>
    </View>)}
    <Text style={s.tiny}>Editions are dated snapshots of football news. They don’t update during a round, and older editions stay clearly marked as archive.</Text>
  </View>;
}

const n = StyleSheet.create({
  feature: {marginBottom: 24, backgroundColor: '#EEF1E4', borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 24, gap: 14},
  edition: {backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 22, gap: 16},
  label: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7},
  status: {fontSize: 10, fontWeight: '800', letterSpacing: 1, color: C.green},
  actions: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 20, marginTop: 4},
  large: {fontSize: 20, lineHeight: 30},
});
