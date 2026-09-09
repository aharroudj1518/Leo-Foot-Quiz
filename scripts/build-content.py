"""Original development question bank. Independent editorial approval is a release gate."""
import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
bank=[]
levels=['starter','fan','expert']
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
for i,(year,team) in enumerate(women):
 add(f'women-{year}',f'Which country won the {year} Women’s World Cup?',team,distract(team,['United States','Norway','Germany','Japan','Spain','England','Sweden','Brazil'],i),f'{team} became Women’s World Cup champions in {year}.', 'This is the women’s tournament, not the men’s competition.','world','https://www.archives.fifa.com/fifa_womens_world_cup',str(year))
euros=[(1960,'Soviet Union'),(1964,'Spain'),(1968,'Italy'),(1972,'West Germany'),(1976,'Czechoslovakia'),(1980,'West Germany'),(1984,'France'),(1988,'Netherlands'),(1992,'Denmark'),(1996,'Germany'),(2000,'France'),(2004,'Greece'),(2008,'Spain'),(2012,'Spain'),(2016,'Portugal'),(2020,'Italy'),(2024,'Spain')]
for i,(year,team) in enumerate(euros):
 pool=[x for x in ['Spain','Italy','France','Netherlands','Denmark','Germany','Greece','Portugal'] if not(team=='West Germany' and x=='Germany')]
 add(f'euro-{year}',f'Who won the men’s EURO {year} tournament?',team,distract(team,pool,i),f'{team} won EURO {year}.'+(' The 2020 edition was played in 2021.' if year==2020 else ''),'Look for the national side, not a club.','world',f'https://www.uefa.com/uefaeuro/history/seasons/{year}/',f'EURO {year}')
clubs=['Real Madrid','AC Milan','Bayern Munich','Liverpool','Barcelona','Manchester United','Chelsea','Inter Milan','Porto','Ajax','Juventus','Borussia Dortmund','Manchester City']
modern=[(2000,'Real Madrid'),(2001,'Bayern Munich'),(2002,'Real Madrid'),(2003,'AC Milan'),(2004,'Porto'),(2005,'Liverpool'),(2006,'Barcelona'),(2007,'AC Milan'),(2008,'Manchester United'),(2009,'Barcelona'),(2010,'Inter Milan'),(2011,'Barcelona'),(2012,'Chelsea'),(2013,'Bayern Munich'),(2014,'Real Madrid'),(2015,'Barcelona'),(2016,'Real Madrid'),(2017,'Real Madrid'),(2018,'Real Madrid'),(2019,'Liverpool'),(2020,'Bayern Munich'),(2021,'Chelsea'),(2022,'Real Madrid'),(2023,'Manchester City'),(2024,'Real Madrid')]
for i,(year,team) in enumerate(modern):
 add(f'clubs-{year}',f'Which club won the men’s Champions League final in {year}?',team,distract(team,clubs,i),f'{team} won the {year} final, at the end of the {year-1}/{str(year)[2:]} season.','The year is the year of the final.','clubs',f'https://www.uefa.com/uefachampionsleague/history/seasons/{year-1}/',f'{year-1}/{str(year)[2:]}',aliases=['Man United','Manchester Utd'] if team=='Manchester United' else [])
club_clues=[
('Real Madrid','Spanish club with a record number of European Cup and Champions League titles, playing in all white at the Santiago Bernabéu.','https://www.realmadrid.com/en-US/the-club/history'),
('Barcelona','Catalan club whose motto is “Més que un club”, with its home at Camp Nou.','https://www.fcbarcelona.com/en/club/history'),
('Liverpool','English club whose anthem is “You’ll Never Walk Alone”, playing at Anfield.','https://www.liverpoolfc.com/history'),
('Bayern Munich','Bavarian club and record German champions, with the Allianz Arena as home ground.','https://fcbayern.com/en/club/history'),
('Juventus','Turin club nicknamed “La Vecchia Signora” (The Old Lady), famous for black-and-white stripes.','https://www.juventus.com/en/history'),
('Ajax','Amsterdam club famed for its youth academy and for “Total Football” in the 1970s.','https://www.ajax.nl/en/club/history/'),
('Borussia Dortmund','German club known for the “Yellow Wall” terrace at the Westfalenstadion.','https://www.bvb.de/eng/BVB/History'),
('Inter Milan','Italian club in blue-and-black stripes that completed a treble in 2010 under José Mourinho.','https://www.inter.it/en/club/history'),
('Celtic','First British club to win the European Cup, in 1967, with a side remembered as the Lisbon Lions.','https://www.celticfc.com/history'),
('Nottingham Forest','English club that won back-to-back European Cups in 1979 and 1980 under Brian Clough.','https://www.nottinghamforest.co.uk/club/history'),
('Porto','Portuguese club that won the 2004 Champions League under José Mourinho.','https://www.fcporto.pt/en/club/history'),
('Benfica','Lisbon club that won consecutive European Cups in 1961 and 1962 with Eusébio.','https://www.slbenfica.pt/en-us/clube/historia')]
for i,(name,clue,url) in enumerate(club_clues):
 add(f'club-clue-{i+1}',f'Which club is this?\n\n{clue}',name,distract(name,clubs+['Benfica','Celtic','Nottingham Forest'],i),f'{name}. The clue describes this club’s identity or historical achievement, not its current form.','','clubs',url,'Club history through 2024')
players=[
('Lionel Messi','Barcelona → Paris Saint-Germain → Inter Miami','Argentina','https://www.intermiamicf.com/players/lionel-messi/'),
('Cristiano Ronaldo','Sporting CP → Manchester United → Real Madrid → Juventus','Portugal','https://www.realmadrid.com/en-US/the-club/history/football-legends/cristiano-ronaldo-dos-santos-aveiro'),
('Thierry Henry','Monaco → Juventus → Arsenal → Barcelona','France','https://www.arsenal.com/historic/players/thierry-henry'),
('Zinedine Zidane','Cannes → Bordeaux → Juventus → Real Madrid','France','https://www.realmadrid.com/en-US/the-club/history/football-legends/zinedine-zidane'),
('David Beckham','Manchester United → Real Madrid → LA Galaxy','England','https://www.realmadrid.com/en-US/the-club/history/football-legends/david-robert-joseph-beckham'),
('Luka Modrić','Dinamo Zagreb → Tottenham Hotspur → Real Madrid','Croatia','https://www.realmadrid.com/en-US/the-club/history/football-legends/luka-modric'),
('Didier Drogba','Guingamp → Marseille → Chelsea','Ivory Coast','https://www.chelseafc.com/en/didier-drogba'),
('Fernando Torres','Atlético Madrid → Liverpool → Chelsea','Spain','https://www.liverpoolfc.com/info/fernando-torres'),
('Luis Suárez','Groningen → Ajax → Liverpool → Barcelona','Uruguay','https://www.liverpoolfc.com/info/luis-suarez'),
('Mohamed Salah','Basel → Chelsea → Roma → Liverpool (permanent clubs shown)','Egypt','https://www.liverpoolfc.com/team/mens/player/mohamed-salah'),
('Sadio Mané','Metz → Salzburg → Southampton → Liverpool','Senegal','https://www.liverpoolfc.com/info/sadio-mane'),
('Robert Lewandowski','Lech Poznań → Borussia Dortmund → Bayern Munich → Barcelona','Poland','https://www.fcbarcelona.com/en/football/first-team/players/5109/robert-lewandowski'),
('Lucy Bronze','Liverpool → Manchester City → Lyon → Manchester City → Barcelona','England','https://www.chelseafc.com/en/teams/profile/lucy-bronze'),
('Alex Morgan','Western New York Flash → Portland Thorns → Orlando Pride','United States','https://www.ussoccer.com/players/m/alex-morgan'),
('Megan Rapinoe','The American winger who won the 2019 Women’s World Cup Golden Boot','United States','https://www.ussoccer.com/players/r/megan-rapinoe'),
('Marta','The Brazilian forward known as “Rainha”, or “Queen”','Brazil','https://www.orlandocitysc.com/pride/players/marta/'),
('Sam Kerr','Perth Glory → Western New York Flash → Sky Blue FC → Chicago Red Stars → Chelsea (selected clubs)','Australia','https://www.chelseafc.com/en/teams/profile/sam-kerr'),
('Ada Hegerberg','The Norwegian forward who won the first Women’s Ballon d’Or in 2018','Norway','https://www.uefa.com/womenschampionsleague/news/024c-0e1762cd438a-cf591c14c353-1000--hegerberg-wins-first-women-s-ballon-d-or/'),
('Alexia Putellas','The Spanish midfielder who won the Women’s Ballon d’Or in both 2021 and 2022','Spain','https://www.fcbarcelona.com/en/football/womens-football/players/711855/alexia-putellas'),
('Aitana Bonmatí','The Spanish midfielder awarded the Golden Ball at the 2023 Women’s World Cup','Spain','https://www.fcbarcelona.com/en/football/womens-football/players/711860/aitana-bonmati')]
for i,(name,clue,nation,url) in enumerate(players):
 group=[x[0] for x in players[:12] if x[0]!=name] if i<12 else [x[0] for x in players[12:] if x[0]!=name]
 add(f'player-{i+1}',f'Who is this player?\n\n{clue}',name,distract(name,group,i),f'{name} represents {nation}. '+('These are selected stops in their club career, in order; the path is not a current-club claim.' if '→' in clue else 'The clue describes this player’s historical achievement.'),f'This player represents {nation}.','players',url,'Career / achievements through 2024',aliases=[name.split()[-1]] if name not in ['Luis Suárez'] else ['Luis Suarez'])
rules=[
('In a standard eleven-a-side match, how many players can one team have on the field?','11',['9','10','12'],'A team has at most eleven players on the field, including one goalkeeper.','Include the goalkeeper.','the-players'),
('What is the minimum number of players a team must have for a match to start or continue?','7',['5','6','8'],'A match may not start or continue if either team has fewer than seven players.','It is fewer than eleven but more than six.','the-players'),
('How long is each half in a standard adult match, before added time?','45 minutes',['30 minutes','40 minutes','60 minutes'],'A standard match consists of two equal halves of 45 minutes, subject to permitted modifications.','Two halves make 90 minutes.','the-duration-of-the-match'),
('How long may the half-time interval normally last at most?','15 minutes',['5 minutes','25 minutes','30 minutes'],'The half-time interval must not exceed 15 minutes.','A quarter of an hour.','the-duration-of-the-match'),
('Which card normally signals a player is sent off?','Red',['Yellow','Green','Blue'],'A red card communicates a sending-off.','It is the colour often used for stop.','fouls-and-misconduct'),
('Which card communicates a caution?','Yellow',['Red','White','Purple'],'A yellow card communicates a caution.','Think of a warning colour.','fouls-and-misconduct'),
('Can a goal be scored directly from a throw-in?','No',['Yes, in either goal','Yes, only at home','Yes, only in extra time'],'A goal cannot be scored directly from a throw-in.','A throw-in is different from a corner kick.','the-throw-in'),
('How must a player deliver the ball at a throw-in?','With both hands',['With one hand','With either foot','With the head'],'At delivery, the thrower uses both hands and throws from behind and over the head.','One hand alone is not enough.','the-throw-in'),
('Where is a penalty kick taken from?','The penalty mark',['The centre spot','The corner arc','The halfway line'],'The ball is placed on the penalty mark for a penalty kick.','It is inside the penalty area.','the-penalty-kick'),
('How far is the penalty mark from the midpoint between the goalposts?','11 metres',['5 metres','9 metres','16 metres'],'The penalty mark is 11 metres (12 yards) from the midpoint between the posts.','The distance in yards is twelve.','the-field-of-play'),
('What restarts play at the start of each half?','A kick-off',['A throw-in','A corner kick','A penalty kick'],'Each half starts with a kick-off at the centre of the field.','Players begin at the halfway line.','the-start-and-restart-of-play'),
('Can a player be offside directly from a goal kick?','No',['Yes, always','Only after half-time','Only inside the penalty area'],'There is no offside offence when receiving the ball directly from a goal kick.','This restart is an exception to offside.','offside'),
('Can a player be offside directly from a throw-in?','No',['Yes, always','Only in extra time','Only at an away ground'],'Receiving the ball directly from a throw-in is an exception to offside.','Think about exceptions for restarts.','offside'),
('When is the ball completely out of play across a boundary line?','When the whole ball crosses the whole line',['When half the ball crosses','When its shadow crosses','When a player calls it out'],'The ball is out when it has wholly crossed the touchline or goal line, on the ground or in the air.','The word “whole” matters.','the-ball-in-and-out-of-play'),
('Which official enforces the Laws of the Game during the match?','The referee',['The stadium announcer','The team captain','The coach'],'The referee has authority to enforce the Laws of the Game for the match.','Look for the official with the whistle.','the-referee')]
for i,(prompt,answer,wrong,explanation,hint,law) in enumerate(rules):add(f'rule-{i+1}',prompt,answer,wrong,explanation,hint,'rules',f'https://www.theifab.com/laws/latest/{law}/','Standard adult association football · 2026/27')
classic=[(1956,'Real Madrid'),(1957,'Real Madrid'),(1958,'Real Madrid'),(1959,'Real Madrid'),(1960,'Real Madrid'),(1961,'Benfica'),(1962,'Benfica'),(1963,'AC Milan'),(1964,'Inter Milan'),(1965,'Inter Milan'),(1966,'Real Madrid'),(1967,'Celtic'),(1968,'Manchester United'),(1969,'AC Milan'),(1970,'Feyenoord'),(1971,'Ajax'),(1972,'Ajax'),(1973,'Ajax'),(1974,'Bayern Munich'),(1975,'Bayern Munich'),(1976,'Bayern Munich'),(1977,'Liverpool'),(1978,'Liverpool'),(1979,'Nottingham Forest'),(1980,'Nottingham Forest'),(1981,'Liverpool'),(1982,'Aston Villa'),(1983,'Hamburg'),(1984,'Liverpool'),(1985,'Juventus'),(1986,'Steaua București'),(1987,'Porto'),(1988,'PSV Eindhoven'),(1989,'AC Milan'),(1990,'AC Milan'),(1991,'Red Star Belgrade'),(1992,'Barcelona'),(1993,'Marseille'),(1994,'AC Milan'),(1995,'Ajax')]
for i,(year,team) in enumerate(classic):
 comp='European Cup' if year<1993 else 'Champions League'
 add(f'legend-{year}',f'Which club won the men’s {comp} final in {year}?',team,distract(team,clubs+['Benfica','Celtic','Feyenoord','Nottingham Forest','Aston Villa'],i),f'{team} won the {year} {comp} final. The competition was renamed the Champions League for the 1992/93 season.','The year refers to the final, not the start of the season.','legends',f'https://www.uefa.com/uefachampionsleague/history/seasons/{year-1}/',str(year),True)
# Difficulty is a provisional editorial estimate, not random assignment.
national_hints={'Uruguay':'A South American country whose capital is Montevideo.','Brazil':'A South American country whose capital is Brasilia.','Argentina':'A South American country whose capital is Buenos Aires.','Italy':'Its capital is Rome.','France':'Its capital is Paris.','England':'Wembley is its national stadium.','Spain':'Its capital is Madrid.','Germany':'Its capital is Berlin.','West Germany':'The team represented the western German state.','United States':'Its national flag features stars and stripes.','Norway':'Its capital is Oslo.','Japan':'Its capital is Tokyo.','Soviet Union':'A former federation whose capital was Moscow.','Czechoslovakia':'A former country that included today’s Czechia and Slovakia.','Netherlands':'Its fans are famous for wearing orange.','Denmark':'Its capital is Copenhagen.','Greece':'Its capital is Athens.','Portugal':'Its capital is Lisbon.'}
club_countries={'Real Madrid':'Spain','AC Milan':'Italy','Bayern Munich':'Germany','Liverpool':'England','Barcelona':'Spain','Manchester United':'England','Chelsea':'England','Inter Milan':'Italy','Porto':'Portugal','Ajax':'the Netherlands','Juventus':'Italy','Borussia Dortmund':'Germany','Manchester City':'England','Benfica':'Portugal','Celtic':'Scotland','Feyenoord':'the Netherlands','Nottingham Forest':'England','Aston Villa':'England','Hamburg':'Germany','Steaua București':'Romania','PSV Eindhoven':'the Netherlands','Red Star Belgrade':'Yugoslavia at the time','Marseille':'France'}
for q in bank:
 if q['category']=='world':
  q['hint']=national_hints[q['answer']]
  year=int(q['id'].split('-')[-1]);q['difficulty']='starter' if year>=2014 else 'fan' if year>=1986 else 'expert'
  if q['id'].startswith('world-'):q['source']='https://www.archives.fifa.com/fifa_world_cup'
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
visual=folder/'visual-questions.json'
if visual.exists(): bank.extend(json.loads(visual.read_text(encoding='utf8')))
connections=folder/'connection-questions.json'
if connections.exists(): bank.extend(json.loads(connections.read_text(encoding='utf8')))
(folder/'questions.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2),encoding='utf8')
(folder/'editorial-status.json').write_text(json.dumps({'status':'development-bank','independentEditorialApproval':False,'createdAt':'2026-09-08','questions':len(bank),'note':'Original wording with reference URLs. Verify every linked source and fact independently before enabling paid release. No claim of independent sign-off.'},indent=2),encoding='utf8')
print(f'Created {len(bank)} questions, {sum(not q["premium"] for q in bank)} free, {sum(q["premium"] for q in bank)} pack questions.')
