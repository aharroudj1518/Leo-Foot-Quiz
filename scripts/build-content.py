"""Original development question bank. Independent editorial approval is a release gate."""
import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
bank=[]
levels=['starter','fan','expert']
# These 65 UEFA routes were checked against the page's season and winner on
# 2026-10-06. Historic pages use the starting year; from the 2008 final the
# verified routes use the ending year. Do not infer routes for new editions.
# Evidence: docs/google-play/paid-content-review.md.
uefa_final_season_keys={
 1956:1955,1957:1956,1958:1957,1959:1958,1960:1959,
 1961:1960,1962:1961,1963:1962,1964:1963,1965:1964,
 1966:1965,1967:1966,1968:1967,1969:1968,1970:1969,
 1971:1970,1972:1971,1973:1972,1974:1973,1975:1974,
 1976:1975,1977:1976,1978:1977,1979:1978,1980:1979,
 1981:1980,1982:1981,1983:1982,1984:1983,1985:1984,
 1986:1985,1987:1986,1988:1987,1989:1988,1990:1989,
 1991:1990,1992:1991,1993:1992,1994:1993,1995:1994,
 2000:1999,2001:2000,2002:2001,2003:2002,2004:2003,
 2005:2004,2006:2005,2007:2006,2008:2008,2009:2009,
 2010:2010,2011:2011,2012:2012,2013:2013,2014:2014,
 2015:2015,2016:2016,2017:2017,2018:2018,2019:2019,
 2020:2020,2021:2021,2022:2022,2023:2023,2024:2024,
}
def uefa_final_source(year):
 return f'https://www.uefa.com/uefachampionsleague/history/seasons/{uefa_final_season_keys[year]}/'
def add(id,prompt,answer,wrong,explanation,hint,category,source,era='Football history',premium=False,aliases=None):
 bank.append(dict(id=id,prompt=prompt,answer=answer,options=[answer,*wrong],explanation=explanation,hint=hint,category=category,difficulty=levels[len([q for q in bank if q['category']==category])%3],source=source,era=era,premium=premium,aliases=aliases or []))
countries=['Brazil','Argentina','France','Italy','Germany','Spain','England','Uruguay','Netherlands','Portugal','Sweden','Japan','Norway','United States']
def distract(answer,pool,index):
 vals=[x for x in pool if x!=answer];return [vals[(index+j)%len(vals)] for j in range(3)]
world=[(1930,'Uruguay'),(1934,'Italy'),(1938,'Italy'),(1950,'Uruguay'),(1954,'West Germany'),(1958,'Brazil'),(1962,'Brazil'),(1966,'England'),(1970,'Brazil'),(1974,'West Germany'),(1978,'Argentina'),(1982,'Italy'),(1986,'Argentina'),(1990,'West Germany'),(1994,'Brazil'),(1998,'France'),(2002,'Brazil'),(2006,'Italy'),(2010,'Spain'),(2014,'Germany'),(2018,'France'),(2022,'Argentina')]
for i,(year,team) in enumerate(world):
 pool=[x for x in countries if not (team=='West Germany' and x=='Germany')]
 add(f'world-{year}',f'Who won the {year} men’s World Cup?',team,distract(team,pool,i),f'{team} won the men’s World Cup in {year}. This question refers to that edition, not the current champions.',f'Think of the national team that lifted the trophy in {year}.','world',f'https://www.fifa.com/tournaments/mens/worldcup/{year}',str(year))
women=[(1991,'United States'),(1995,'Norway'),(1999,'United States'),(2003,'Germany'),(2007,'Germany'),(2011,'Japan'),(2015,'United States'),(2019,'United States'),(2023,'Spain')]
# FIFA association honours identify the actual winning editions; tournament
# navigation indexes alone are not evidence for an answer.
women_sources={
 'United States':'https://inside.fifa.com/associations/USA',
 'Norway':'https://inside.fifa.com/en/associations/NOR',
 'Germany':'https://inside.fifa.com/associations/GER',
 'Japan':'https://inside.fifa.com/associations/jpn',
 'Spain':'https://inside.fifa.com/associations/ESP',
}
for i,(year,team) in enumerate(women):
 add(f'women-{year}',f'Which country won the {year} Women’s World Cup?',team,distract(team,['United States','Norway','Germany','Japan','Spain','England','Sweden','Brazil'],i),f'{team} became Women’s World Cup champions in {year}.', 'This is the women’s tournament, not the men’s competition.','world',women_sources[team],str(year))
euros=[(1960,'Soviet Union'),(1964,'Spain'),(1968,'Italy'),(1972,'West Germany'),(1976,'Czechoslovakia'),(1980,'West Germany'),(1984,'France'),(1988,'Netherlands'),(1992,'Denmark'),(1996,'Germany'),(2000,'France'),(2004,'Greece'),(2008,'Spain'),(2012,'Spain'),(2016,'Portugal'),(2020,'Italy'),(2024,'Spain')]
for i,(year,team) in enumerate(euros):
 pool=[x for x in ['Spain','Italy','France','Netherlands','Denmark','Germany','Greece','Portugal'] if not(team=='West Germany' and x=='Germany')]
 add(f'euro-{year}',f'Who won the men’s EURO {year} tournament?',team,distract(team,pool,i),f'{team} won EURO {year}.'+(' The 2020 edition was played in 2021.' if year==2020 else ''),'Look for the national side, not a club.','world',f'https://www.uefa.com/uefaeuro/history/seasons/{year}/',f'EURO {year}')
clubs=['Real Madrid','AC Milan','Bayern Munich','Liverpool','Barcelona','Manchester United','Chelsea','Inter Milan','Porto','Ajax','Juventus','Borussia Dortmund','Manchester City']
modern=[(2000,'Real Madrid'),(2001,'Bayern Munich'),(2002,'Real Madrid'),(2003,'AC Milan'),(2004,'Porto'),(2005,'Liverpool'),(2006,'Barcelona'),(2007,'AC Milan'),(2008,'Manchester United'),(2009,'Barcelona'),(2010,'Inter Milan'),(2011,'Barcelona'),(2012,'Chelsea'),(2013,'Bayern Munich'),(2014,'Real Madrid'),(2015,'Barcelona'),(2016,'Real Madrid'),(2017,'Real Madrid'),(2018,'Real Madrid'),(2019,'Liverpool'),(2020,'Bayern Munich'),(2021,'Chelsea'),(2022,'Real Madrid'),(2023,'Manchester City'),(2024,'Real Madrid')]
for i,(year,team) in enumerate(modern):
 add(f'clubs-{year}',f'Which club won the men’s Champions League final in {year}?',team,distract(team,clubs,i),f'{team} won the {year} final, at the end of the {year-1}/{str(year)[2:]} season.','The year is the year of the final.','clubs',uefa_final_source(year),f'{year-1}/{str(year)[2:]}',aliases=['Man United','Manchester Utd'] if team=='Manchester United' else [])
club_clues=[
('Real Madrid','Spanish club with a record number of European Cup and Champions League titles, playing in all white at the Santiago Bernabéu.','https://www.realmadrid.com/en-US/the-club/history'),
('Barcelona','Catalan club whose motto is “Més que un club”, with its historic home at Camp Nou.','https://www.fcbarcelona.com/en/club/news/723765/50-anys-del-mes-que-un-club'),
('Liverpool','English club whose anthem is “You’ll Never Walk Alone”, playing at Anfield.','https://www.liverpoolfc.com/info/why-youll-never-walk-alone-liverpool-fcs-anthem'),
('Bayern Munich','Bavarian club and record German champions, with the Allianz Arena as home ground.','https://fcbayern.com/en/news/matchreports/2016/09/match-report-bundesliga-fc-bayern---fc-ingolstadt-170916'),
('Juventus','Turin club nicknamed “La Vecchia Signora” (The Old Lady), famous for black-and-white stripes.','https://www.juventus.com/en/news/articles/121-years-your-homes-your-history-happy-birthday-old-lady'),
('Ajax','Amsterdam club famed for its youth academy and for “Total Football” in the 1970s.','https://www.uefa.com/uefachampionsleague/news/025a-0eaadf5cfb61-444b65b2aa25-1000--masters-of-total-football/'),
('Borussia Dortmund','German club known for the “Yellow Wall” terrace at the Westfalenstadion.','https://www.bvb.de/de/en/signal-iduna-park/suedtribuene.html'),
('Inter Milan','Italian club in blue-and-black stripes that completed a treble in 2010 under José Mourinho.','https://www.inter.it/en/news/2021-05-22-otd-treble-ucl-inter-bayern-munich'),
('Celtic','First British club to win the European Cup, in 1967, with a side remembered as the Lisbon Lions.','https://charity.celticfc.com/uncategorized/jock-stein-30th-anniversary-charity-match-and-dinner/'),
('Nottingham Forest','English club that won back-to-back European Cups in 1979 and 1980 under Brian Clough.','https://www.uefa.com/uefasupercup/history/1979/'),
('Porto','Portuguese club that won the 2004 Champions League under José Mourinho.','https://www.uefa.com/uefachampionsleague/news/0250-0c50f100f076-ecb0d9d85bb1-1000--2003-04-porto-pull-off-biggest-surprise/'),
('Benfica','Lisbon club that won consecutive European Cups in 1961 and 1962.','https://www.uefa.com/uefachampionsleague/news/0253-0d7ff54758e9-79e665db9ac4-1000--the-greatest-teams-of-all-time-benfica-1960-62/')]
for i,(name,clue,url) in enumerate(club_clues):
 add(f'club-clue-{i+1}',f'Which club is this?\n\n{clue}',name,distract(name,clubs+['Benfica','Celtic','Nottingham Forest'],i),f'{name}. The clue describes this club’s identity or historical achievement, not its current form.','','clubs',url,'Club history through 2024')
players=[
('Lionel Messi','Barcelona → Paris Saint-Germain → Inter Miami','Argentina','https://www.intermiamicf.com/news/inter-miami-cf-signs-seven-time-ballon-d-or-winner-world-cup-champion-lionel-mes'),
('Cristiano Ronaldo','Sporting CP → Manchester United → Real Madrid → Juventus','Portugal','https://www.juventus.com/en/news/articles/cristiano-ronaldo-is-bianconero'),
('Thierry Henry','Monaco → Juventus → Arsenal → Barcelona','France','https://www.fff.fr/equipe-nationale/joueur/9809-henry-thierry/fiche.html'),
('Zinedine Zidane','Cannes → Bordeaux → Juventus → Real Madrid','France','https://www.realmadrid.com/en-US/the-club/history/football-legends/zinedine-zidane'),
('David Beckham','Manchester United → Real Madrid → LA Galaxy','England','https://www.lagalaxy.com/players/david-beckham/'),
('Luka Modrić','Dinamo Zagreb → Tottenham Hotspur → Real Madrid','Croatia','https://www.tottenhamhotspur.com/news/1042121/the-foe-you-know-real-madrids-modric-and-bale'),
('Didier Drogba','Guingamp → Marseille → Chelsea','Ivory Coast','https://www.uefa.com/uefachampionsleague/news/0254-0d7b39250689-72b617e521d5-1000--chelsea-wrap-up-drogba-deal/'),
('Fernando Torres','Atlético Madrid → Liverpool → Chelsea','Spain','https://www.liverpoolfc.com/info/fernando-torres'),
('Luis Suárez','Groningen → Ajax → Liverpool → Barcelona','Uruguay','https://www.intermiamicf.com/news/inter-miami-cf-signs-iconic-striker-luis-suarez'),
('Mohamed Salah','Basel → Chelsea → Roma → Liverpool (permanent clubs shown)','Egypt','https://www.liverpoolfc.com/news/first-team/266612-in-profile-salah-s-journey-from-egypt-to-anfield'),
('Sadio Mané','Metz → Salzburg → Southampton → Liverpool','Senegal','https://www.liverpoolfc.com/news/first-team/225716-profile-sadio-mane-s-journey-to-anfield'),
('Robert Lewandowski','Lech Poznań → Borussia Dortmund → Bayern Munich → Barcelona','Poland','https://www.fcbarcelona.com/en/news/4526738/robert-lewandowski/amp'),
('Lucy Bronze','Liverpool → Manchester City → Lyon → Manchester City → Barcelona','England','https://www.chelseafc.com/en/news/article/lucy-bronze-joins-chelsea'),
('Alex Morgan','Western New York Flash → Portland Thorns → Orlando Pride','United States','https://www.orlandocitysc.com/players/alex-morgan/'),
('Megan Rapinoe','The American winger who won the 2019 Women’s World Cup Golden Boot','United States','https://www.ussoccer.com/stories/2023/07/us-womens-national-team-legend-megan-rapinoe-will-retire-at-end-of-2023-nwsl-season'),
('Marta','The Brazilian forward known as “Rainha”, or “Queen”','Brazil','https://inside.fifa.com/organisation/news/marta-ive-got-a-dream'),
('Sam Kerr','Perth Glory → Western New York Flash → Sky Blue FC → Chicago Red Stars → Chelsea (selected clubs)','Australia','https://www.olympics.com.au/olympians/sam-kerr/'),
('Ada Hegerberg','The Norwegian forward who won the first Women’s Ballon d’Or in 2018','Norway','https://www.uefa.com/womenschampionsleague/news/0252-0ce4d6fbe983-c6ecd00d29ad-1000--hegerberg-returns-a-salute/'),
('Alexia Putellas','The Spanish midfielder who won the Women’s Ballon d’Or in both 2021 and 2022','Spain','https://www.fcbarcelona.com/en/football/womens-football/news/2857507/alexia-putellas-wins-second-ballon-dor'),
('Aitana Bonmatí','The Spanish midfielder awarded the Golden Ball at the 2023 Women’s World Cup','Spain','https://inside.fifa.com/organisation/media-releases/nominees-for-the-best-fifa-football-awards-tm-2023-revealed')]
for i,(name,clue,nation,url) in enumerate(players):
 group=[x[0] for x in players[:12] if x[0]!=name] if i<12 else [x[0] for x in players[12:] if x[0]!=name]
 country='the United States' if nation=='United States' else nation
 context='These are selected stops in their club career, in order; the path is not a current-club claim.' if '→' in clue else 'The clue describes this player’s historical achievement.'
 if name=='Sam Kerr':context='These are selected clubs in the order she first joined them; she also alternated Australian and US seasons. This is not a current-club claim.'
 add(f'player-{i+1}',f'Who is this player?\n\n{clue}',name,distract(name,group,i),f'{name} has represented {country} internationally. '+context,f'National team: {nation}.','players',url,'Career / achievements through 2024',aliases=[name.split()[-1]] if name not in ['Luis Suárez'] else ['Luis Suarez'])
rules=[
('What is the maximum number of players one team may have on the field in a standard eleven-a-side match?','11',['9','10','12'],'A team has at most eleven players on the field, including one goalkeeper.','Include the goalkeeper.','the-players'),
('At the start of a match, what is the minimum number of players a team must have?','7',['5','6','8'],'A team must begin a match with at least seven players. Law 3 has specific exceptions for temporary absences during play.','It is fewer than eleven but more than six.','the-players'),
('How long is each half in a standard adult match, before added time?','45 minutes',['30 minutes','40 minutes','60 minutes'],'A standard match consists of two equal halves of 45 minutes, subject to permitted modifications.','Two halves make 90 minutes.','the-duration-of-the-match'),
('How long may the half-time interval normally last at most?','15 minutes',['5 minutes','25 minutes','30 minutes'],'The half-time interval must not exceed 15 minutes.','A quarter of an hour.','the-duration-of-the-match'),
('Which card normally signals a player is sent off?','Red',['Yellow','Green','Blue'],'A red card communicates a sending-off.','It is the colour often used for stop.','fouls-and-misconduct'),
('Which card communicates a caution?','Yellow',['Red','White','Purple'],'A yellow card communicates a caution.','Think of a warning colour.','fouls-and-misconduct'),
('Can a goal be scored directly from a throw-in?','No',['Yes, in either goal','Yes, only at home','Yes, only in extra time'],'A goal cannot be scored directly from a throw-in.','A throw-in is different from a corner kick.','the-throw-in'),
('How must a player deliver the ball at a throw-in?','With both hands',['With one hand','With either foot','With the head'],'At delivery, the thrower uses both hands and throws from behind and over the head.','One hand alone is not enough.','the-throw-in'),
('Where is a penalty kick taken from?','The penalty mark',['The centre spot','The corner arc','The halfway line'],'The ball must be stationary, with part of it touching or overhanging the centre of the penalty mark.','It is inside the penalty area.','the-penalty-kick'),
('How far is the penalty mark from the midpoint between the goalposts?','11 metres',['5 metres','9 metres','16 metres'],'The penalty mark is 11 metres (12 yards) from the midpoint between the posts.','The distance in yards is twelve.','the-field-of-play'),
('What restarts play at the start of each half?','A kick-off',['A throw-in','A corner kick','A penalty kick'],'Each half starts with a kick-off at the centre of the field.','The ball starts on the centre mark.','the-start-and-restart-of-play'),
('Can a player commit an offside offence by receiving the ball directly from a goal kick?','No',['Yes, always','Only after half-time','Only inside the penalty area'],'There is no offside offence when receiving the ball directly from a goal kick.','This restart is an exception to offside.','offside'),
('Can a player commit an offside offence by receiving the ball directly from a throw-in?','No',['Yes, always','Only in extra time','Only at an away ground'],'Receiving the ball directly from a throw-in is an exception to offside.','Think about exceptions for restarts.','offside'),
('When is the ball completely out of play across a boundary line?','When the whole ball crosses the whole line',['When half the ball crosses','When its shadow crosses','When a player calls it out'],'The ball is out when it has wholly crossed the touchline or goal line, on the ground or in the air.','The word “whole” matters.','the-ball-in-and-out-of-play'),
('Which official enforces the Laws of the Game during the match?','The referee',['The stadium announcer','The team captain','The coach'],'The referee has authority to enforce the Laws of the Game for the match.','Look for the official with the whistle.','the-referee')]
for i,(prompt,answer,wrong,explanation,hint,law) in enumerate(rules):add(f'rule-{i+1}',prompt,answer,wrong,explanation,hint,'rules',f'https://www.theifab.com/laws/latest/{law}/','Standard adult association football · 2026/27')
classic=[(1956,'Real Madrid'),(1957,'Real Madrid'),(1958,'Real Madrid'),(1959,'Real Madrid'),(1960,'Real Madrid'),(1961,'Benfica'),(1962,'Benfica'),(1963,'AC Milan'),(1964,'Inter Milan'),(1965,'Inter Milan'),(1966,'Real Madrid'),(1967,'Celtic'),(1968,'Manchester United'),(1969,'AC Milan'),(1970,'Feyenoord'),(1971,'Ajax'),(1972,'Ajax'),(1973,'Ajax'),(1974,'Bayern Munich'),(1975,'Bayern Munich'),(1976,'Bayern Munich'),(1977,'Liverpool'),(1978,'Liverpool'),(1979,'Nottingham Forest'),(1980,'Nottingham Forest'),(1981,'Liverpool'),(1982,'Aston Villa'),(1983,'Hamburg'),(1984,'Liverpool'),(1985,'Juventus'),(1986,'Steaua București'),(1987,'Porto'),(1988,'PSV Eindhoven'),(1989,'AC Milan'),(1990,'AC Milan'),(1991,'Red Star Belgrade'),(1992,'Barcelona'),(1993,'Marseille'),(1994,'AC Milan'),(1995,'Ajax')]
for i,(year,team) in enumerate(classic):
 comp='European Cup' if year<1993 else 'Champions League'
 add(f'legend-{year}',f'Which club won the men’s {comp} final in {year}?',team,distract(team,clubs+['Benfica','Celtic','Feyenoord','Nottingham Forest','Aston Villa'],i),f'{team} won the {year} {comp} final. The competition was renamed the Champions League for the 1992/93 season.','The year refers to the final, not the start of the season.','legends',uefa_final_source(year),str(year),True)
# Difficulty is a provisional editorial estimate, not random assignment.
national_hints={'Uruguay':'A South American country whose capital is Montevideo.','Brazil':'A South American country whose capital is Brasilia.','Argentina':'A South American country whose capital is Buenos Aires.','Italy':'Its capital is Rome.','France':'Its capital is Paris.','England':'Wembley is its national stadium.','Spain':'Its capital is Madrid.','Germany':'Its capital is Berlin.','West Germany':'The team represented the western German state.','United States':'Its national flag features stars and stripes.','Norway':'Its capital is Oslo.','Japan':'Its capital is Tokyo.','Soviet Union':'A former federation whose capital was Moscow.','Czechoslovakia':'A former country that included today’s Czechia and Slovakia.','Netherlands':'Its fans are famous for wearing orange.','Denmark':'Its capital is Copenhagen.','Greece':'Its capital is Athens.','Portugal':'Its capital is Lisbon.'}
club_countries={'Real Madrid':'Spain','AC Milan':'Italy','Bayern Munich':'Germany','Liverpool':'England','Barcelona':'Spain','Manchester United':'England','Chelsea':'England','Inter Milan':'Italy','Porto':'Portugal','Ajax':'the Netherlands','Juventus':'Italy','Borussia Dortmund':'Germany','Manchester City':'England','Benfica':'Portugal','Celtic':'Scotland','Feyenoord':'the Netherlands','Nottingham Forest':'England','Aston Villa':'England','Hamburg':'Germany','Steaua București':'Romania','PSV Eindhoven':'the Netherlands','Red Star Belgrade':'Yugoslavia at the time','Marseille':'France'}
for q in bank:
 if q['category']=='world':
  q['hint']=national_hints[q['answer']]
  year=int(q['id'].split('-')[-1]);q['difficulty']='starter' if year>=2014 else 'fan' if year>=1986 else 'expert'
  if q['answer']=='Brazil':q['hint']='A South American country whose current capital is Brasília.'
  if q['id'].startswith('world-'):
   q['source']='https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1930-1978-uruguay-italy-germany-brazil-england-argentina' if year<=1978 else 'https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1982-2026-italy-argentina-germany-brazil-france-spain'
 elif q['category']=='clubs':
  n=int(q['id'].split('-')[-1]);q['hint']='This club is based in '+club_countries[q['answer']]+'.'
  q['difficulty']=('starter' if n<=4 else 'fan' if n<=8 else 'expert') if q['id'].startswith('club-clue-') else 'starter' if n>=2016 else 'fan' if n>=2008 else 'expert'
 elif q['category']=='players':
  i=int(q['id'].split('-')[-1]);q['difficulty']='starter' if i in [1,2,3,5,14,16] else 'fan' if i in [4,7,9,10,12,17,20] else 'expert'
 elif q['category']=='rules':
  i=int(q['id'].split('-')[-1]);q['difficulty']='starter' if i<=5 else 'fan' if i<=10 else 'expert'
 elif q['category']=='legends':
  year=int(q['id'].split('-')[-1]);q['difficulty']='starter' if year>=1984 else 'fan' if year>=1969 else 'expert';q['hint']='The winning club is from '+club_countries[q['answer']]+'.'
folder=root/'src/content';folder.mkdir(parents=True,exist_ok=True)
(folder/'questions.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2),encoding='utf8')
(folder/'editorial-status.json').write_text(json.dumps({'status':'development-bank','independentEditorialApproval':False,'createdAt':'2026-09-08','questions':len(bank),'note':'Original wording with reference URLs. Verify every linked source and fact independently before enabling paid release. No claim of independent sign-off.'},indent=2),encoding='utf8')
print(f'Created {len(bank)} questions, {sum(not q["premium"] for q in bank)} free, {sum(q["premium"] for q in bank)} pack questions.')
