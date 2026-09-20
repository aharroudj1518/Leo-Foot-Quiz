import fs from 'node:fs';
const root=new URL('../src/content/',import.meta.url);
const packs=[];
// Hand-written questions. Each pack retains its inspected historical source.
function club(name,source,rows){packs.push({name,source,rows});}
club('AEK Athens FC','https://www.aekfc.gr/pages/history.aspx?lang=el',[
['AEK broke new ground in Europe in 1977. How far did they go in the UEFA Cup?','Semi-finals','Final|Quarter-finals|Round of 16','Only four clubs remained.','AEK reached the UEFA Cup semi-finals in 1977.'],
['Which trophy pair made 1978 a double-winning year for AEK?','Greek league and Greek Cup','Greek Cup and UEFA Cup|Greek league and European Cup|UEFA Cup and Super Cup','Both trophies were domestic.','AEK followed their European run with the Greek league-and-cup double in 1978.'],
['Which businessman took charge in 1974 before AEK’s late-1970s revival?','Loukas Barlos','Dimitris Melissanidis|Sokratis Kokkalis|Giannis Alafouzos','His surname begins with B.','Loukas Barlos took over in 1974 and backed the team’s transformation.']]);
club('Aston Villa','https://www.uefa.com/uefachampionsleague/news/0254-0d7b1e154752-f2cfb521c62d-1000--1981-82-withe-brings-villa-glory/',[
['One finish made Villa European champions in 1982. Who supplied it?','Peter Withe','Gary Shaw|Tony Morley|Gordon Cowans','Think of Villa’s centre-forward.','Peter Withe scored the only goal of the 1982 European Cup final.'],
['Villa’s first European Cup campaign ended with the trophy. Which German club did they beat in the final?','Bayern Munich','Hamburg|Borussia Dortmund|Eintracht Frankfurt','The opponents came from Bavaria.','Villa defeated Bayern Munich 1–0 in the final.'],
['Villa fans conquered Europe in 1982 in which city?','Rotterdam','London|Paris|Rome','De Kuip is the clue.','The 1982 final was played at De Kuip in Rotterdam.']]);
club('Atlético de Madrid','https://www.uefa.com/uefaeuropaleague/news/0250-0c50f4f42d9b-b99f75c54493-1000--forlan-double-gives-atletico-glory/',[
['Two goals, including an extra-time winner: who was Atlético’s hero in the 2010 Europa League final?','Diego Forlán','Sergio Agüero|Fernando Torres|Antoine Griezmann','The striker represented Uruguay.','Diego Forlán scored both Atlético goals in the 2–1 win.'],
['Which London club stood between Atlético and the 2010 Europa League trophy?','Fulham','Chelsea|Arsenal|Tottenham Hotspur','Their home is Craven Cottage.','Atlético beat Fulham in the inaugural Europa League final.'],
['Atlético’s 2010 European triumph ended a wait of how many years for major continental silverware?','48','18|28|38','The previous success was in 1962.','The 2010 win ended a 48-year wait after the 1962 Cup Winners’ Cup.']]);
club('Borussia Dortmund','https://www.uefa.com/uefachampionsleague/news/0239-0e9729e32785-129364f01c3f-1000--20-years-on-dortmund-s-european-champions/',[
['Off the bench, first touch, a chip over the keeper. Which Dortmund player did that in the 1997 final?','Lars Ricken','Andreas Möller|Michael Zorc|Stéphane Chapuisat','A local academy product with the initials LR.','Lars Ricken scored Dortmund’s third goal moments after coming on.'],
['Before Ricken’s chip, which striker had already scored twice for Dortmund in the 1997 final?','Karl-Heinz Riedle','Jan Koller|Márcio Amoroso|Stéphane Chapuisat','His surname begins with R.','Karl-Heinz Riedle scored twice in the first half against Juventus.'],
['Who coached Dortmund to their first Champions League title in 1997?','Ottmar Hitzfeld','Jürgen Klopp|Thomas Tuchel|Matthias Sammer','He later won the competition with Bayern too.','Ottmar Hitzfeld’s Dortmund beat Juventus 3–1 in Munich.']]);
club('FC Barcelona','https://www.fcbarcelona.com/en/news/1098924/20-may-1992-fc-barcelona-win-european-cup',[
['A defender’s free-kick finally brought Barça the European Cup in 1992. Name him.','Ronald Koeman','Carles Puyol|Migueli|Albert Ferrer','The Dutchman was famous for his powerful shooting.','Ronald Koeman scored in extra time against Sampdoria.'],
['Which former Barça player coached the 1992 European Cup-winning Dream Team?','Johan Cruyff','Pep Guardiola|Frank Rijkaard|Luis Enrique','Total Football and the number 14 are clues.','Johan Cruyff coached Barcelona to their first European Cup.'],
['Barça’s first European Cup was won at which famous stadium?','Wembley','Camp Nou|San Siro|Hampden Park','The final was played in London.','Barcelona beat Sampdoria 1–0 at Wembley in 1992.']]);
club('FK Bodø/Glimt','https://www.skysports.com/football/bodo-glimt-vs-roma/teams/457557',[
['Bodø/Glimt stunned José Mourinho’s Roma in October 2021. What was the score?','6–1','3–0|4–2|5–3','Glimt scored half a dozen.','Bodø/Glimt beat Roma 6–1 in the Conference League group stage.'],
['Which Glimt striker scored in both halves of that 6–1 win over Roma?','Erik Botheim','Victor Boniface|Kasper Høgh|Jens Petter Hauge','His initials are EB.','Erik Botheim scored in the eighth and 52nd minutes.'],
['Which winger also scored twice for Glimt against Roma in that 2021 match?','Ola Solbakken','Patrick Berg|Amahl Pellegrino|Hugo Vetlesen','His first name is Ola.','Ola Solbakken scored Glimt’s fourth and sixth goals.']]);
club('Club Brugge KV','https://www.uefa.com/uefachampionsleague/news/0224-0e91681f7d73-40aa98506bea-1000--watch-when-club-brugge-fell-to-liverpool-at-wembley/',[
['Club Brugge reached the 1978 European Cup final. Which English club faced them?','Liverpool','Nottingham Forest|Aston Villa|Leeds United','The same opponents had beaten Brugge in the 1976 UEFA Cup final.','Liverpool faced Club Brugge in both the 1976 UEFA Cup and 1978 European Cup finals.'],
['Which Austrian coach led Club Brugge to Wembley in 1978?','Ernst Happel','Raymond Goethals|Guy Thys|Hugo Broos','He had already won the European Cup with Feyenoord.','Ernst Happel coached the 1978 finalists.'],
['Which future Belgium coach played in Club Brugge’s 1978 finalist squad?','René Vandereycken','Marc Wilmots|Roberto Martínez|Domenico Tedesco','His initials are RV.','René Vandereycken was among the players in Happel’s Brugge side.']]);
club('Como 1907','https://comofootball.com/en/history/',[
['Como’s origin story includes a travelling show. Whose circus was involved in a 1906 match by the lake?','Buffalo Bill’s','Barnum’s|Cirque du Soleil|Moscow State Circus','Think of an American Wild West show.','The club history describes a game involving members of Buffalo Bill’s circus before Como was founded.'],
['The number in Como 1907’s name marks what?','The club’s founding year','The stadium’s capacity|A record goal total|The first promotion year','It is a date, not a score.','Como Football Club was founded in May 1907.'],
['Which lakeside ground has been Como’s home since 1927?','Giuseppe Sinigaglia','Giuseppe Meazza|Stadio Brianteo|Stadio Bentegodi','It shares its first name with San Siro’s official name.','The Giuseppe Sinigaglia stadium opened in 1927.']]);
club('Fenerbahçe SK','https://www.uefa.com/newsfiles/UCL/2008/301906_LU.pdf',[
['A Brazilian football icon coached Fenerbahçe in their 2008 Champions League quarter-final. Who?','Zico','Sócrates|Dunga|Romário','His nickname was the White Pelé.','Zico coached Fenerbahçe against Chelsea in the 2008 quarter-finals.'],
['Which Brazilian playmaker wore Fenerbahçe’s number 20 against Chelsea in 2008?','Alex','Diego|Kaká|Rivaldo','He became an Istanbul club legend.','Alex was listed with number 20 in that quarter-final side.'],
['Which goalkeeper was in Fenerbahçe’s starting side for the 2008 quarter-final first leg?','Volkan Demirel','Rüştü Reçber|Mert Günok|Altay Bayındır','His first name is Volkan.','Volkan Demirel started against Chelsea on 2 April 2008.']]);
club('Feyenoord','https://www.feyenoord.com/en/our-club/organisation/history',[
['An extra-time lob won Feyenoord the 1970 European Cup. Which Swedish striker scored it?','Ove Kindvall','Henrik Larsson|Zlatan Ibrahimović|John Guidetti','His initials are OK.','Ove Kindvall’s lob beat Celtic at San Siro.'],
['Which free-kick specialist helped fire Feyenoord to the 2002 UEFA Cup?','Pierre van Hooijdonk','Robin van Persie|Dirk Kuyt|Roy Makaay','Supporters called him Pi-Air.','Pierre van Hooijdonk was central to Feyenoord’s 2002 triumph.'],
['Which Feyenoord midfielder links the 1970 European Cup win with the 1974 UEFA Cup win?','Wim van Hanegem','Giovanni van Bronckhorst|Ruud Gullit|Georginio Wijnaldum','His surname begins with van H.','Wim van Hanegem played a major part in both European successes.']]);
club('LASK','https://www.lask.at/de/m/news/eine-zeitreise-mit-manfred-pichler-ins-historische-double-jahr-1965',[
['LASK’s historic double arrived in which year?','1965','1975|1985|1995','It was in the middle of the 1960s.','LASK won the Austrian championship and cup in 1965.'],
['Two goals at Hohe Warte secured LASK’s 1965 title. Which pair scored them?','Dolfi Blutsch and Gyula Szabo','Hans Krankl and Herbert Prohaska|Toni Polster and Andreas Herzog|Ivica Vastić and Mario Haas','Think of the Linz heroes of the 1960s.','Dolfi Blutsch and Gyula Szabo scored in the 2–0 victory over First Vienna.'],
['LASK clinched the 1965 league title with a 2–0 win over which club?','First Vienna','Rapid Vienna|Austria Vienna|Sturm Graz','The match was at Hohe Warte.','Goals from Dolfi Blutsch and Gyula Szabo beat Vienna at Hohe Warte.']]);
club('RB Leipzig','https://www.uefa.com/uefachampionsleague/news/0260-101fb313a33d-349eb78c4d93-1000--leipzig-2-1-atletico-tyler-adams-scores-late-winner/',[
['A late strike took Leipzig into the 2020 Champions League semi-finals. Which American scored it?','Tyler Adams','Weston McKennie|Christian Pulisic|Giovanni Reyna','His initials are TA.','Tyler Adams scored Leipzig’s late winner against Atlético.'],
['Which Spanish club did Leipzig eliminate to reach their first Champions League semi-final?','Atlético Madrid','Real Madrid|Barcelona|Sevilla','Diego Simeone coached the opponents.','Leipzig beat Atlético Madrid 2–1 in the 2020 quarter-final.'],
['How far did Leipzig’s 2020 win over Atlético take them for the first time?','Champions League semi-finals','Champions League final|Europa League final|Club World Cup final','Only four Champions League clubs remained.','The victory made Leipzig debut Champions League semi-finalists.']]);
club('LOSC Lille','https://www.losc.fr/actualites-foot-lille/forbach-losc-1-3-avec-s%C3%A9rieux-et-application',[
['Before becoming a Chelsea star, which Belgian scored for Lille in their January 2011 cup win at Forbach?','Eden Hazard','Kevin De Bruyne|Dries Mertens|Romelu Lukaku','His younger brother is Thorgan.','Eden Hazard scored Lille’s opener against Forbach.'],
['Which Ivorian winger joined Hazard on Lille’s scoresheet against Forbach in 2011?','Gervinho','Didier Drogba|Salomon Kalou|Nicolas Pépé','He later played for Arsenal and Roma.','Gervinho scored Lille’s third goal in the 3–1 cup win.'],
['Which coach was in charge of Lille during that 2010/11 cup campaign?','Rudi Garcia','Christophe Galtier|Marcelo Bielsa|Paulo Fonseca','His first name is Rudi.','Rudi Garcia was Lille’s coach in the 2010/11 season.']]);
club('Liverpool FC','https://www.liverpoolfc.com/news/features/351604-liverpool-2005-champions-league-final-istanbul',[
['Istanbul, 2005: Liverpool are 3–0 down. Who heads in the first goal of the comeback?','Steven Gerrard','Xabi Alonso|Jamie Carragher|Luis García','The captain led the way.','Steven Gerrard’s header began Liverpool’s second-half comeback.'],
['Whose saved penalty became Liverpool’s equaliser when he buried the rebound in Istanbul?','Xabi Alonso','Vladimír Šmicer|Djibril Cissé|John Arne Riise','A Spanish midfielder who later played for Real Madrid.','Xabi Alonso followed up Dida’s save to make it 3–3.'],
['Which keeper saved Shevchenko’s shoot-out penalty to complete Liverpool’s 2005 miracle?','Jerzy Dudek','Pepe Reina|Alisson Becker|Sander Westerveld','The goalkeeper represented Poland.','Jerzy Dudek’s save settled the shoot-out for Liverpool.']]);
club('Manchester City','https://www.mancity.com/citytv/features/2017/may/9320-aguero-watches-goal',[
['City fans only need to hear “93:20”. Which striker does that moment belong to?','Sergio Agüero','Edin Džeko|Carlos Tévez|Mario Balotelli','Argentina’s Kun.','Sergio Agüero scored the title-winning goal against QPR in 2012.'],
['Which club almost denied City the title on the final day in 2012?','Queens Park Rangers','Sunderland|Stoke City|Wigan Athletic','The London club is often called QPR.','City beat Queens Park Rangers 3–2 on the final day.'],
['Agüero’s 2012 winner ended City’s league-title wait of how long?','44 years','24 years|34 years|54 years','City’s previous league title was in 1968.','The win delivered City’s first league championship in 44 years.']]);
club('Manchester United','https://www.manutd.com/en/club/history/history-by-decade/1990-1999',[
['Barcelona, 1999: which United substitute scored the last-gasp Champions League winner?','Ole Gunnar Solskjær','Teddy Sheringham|Andy Cole|Dwight Yorke','The Norwegian was known for decisive goals from the bench.','Solskjær scored after Sheringham’s equaliser to beat Bayern 2–1.'],
['Which United winger slalomed through Arsenal to score in the 1999 FA Cup semi-final replay?','Ryan Giggs','David Beckham|Jesper Blomqvist|Andrei Kanchelskis','The Welshman played on the left.','Ryan Giggs scored the famous solo goal against Arsenal.'],
['Which captain inspired United’s comeback from 2–0 down at Juventus in the 1999 semi-final?','Roy Keane','Steve Bruce|Eric Cantona|Gary Neville','An Irish midfielder.','Roy Keane helped United turn the second leg around in Turin.']]);
club('SSC Napoli','https://www.uefa.com/uefaeuropaleague/news/0220-0e900e20b899-617d991b0678-1000--snap-shot-maradona-s-napoli-reign-supreme/',[
['Which Argentine number 10 captained Napoli’s 1989 UEFA Cup-winning side?','Diego Maradona','Lionel Messi|Juan Román Riquelme|Pablo Aimar','Naples later named its stadium after him.','Diego Maradona captained Napoli’s European winners.'],
['Which German club faced Napoli in the two-legged 1989 UEFA Cup final?','VfB Stuttgart','Bayern Munich|Werder Bremen|Hamburg','They wear white with a red chest band.','Napoli beat Stuttgart 5–4 on aggregate.'],
['Which Brazilian striker partnered Maradona in Napoli’s 1989 European-winning attack?','Careca','Romário|Bebeto|Ronaldo','His name starts with C.','Careca was part of Napoli’s 1989 UEFA Cup-winning team.']]);
club('Paris Saint-Germain','https://en.psg.fr/teams/club/content/50-legendary-matches-paris-european-glory-psg-uefa-retro',[
['A long-range free-kick won PSG the 1996 Cup Winners’ Cup. Which defender struck it?','Bruno N’Gotty','Alain Roche|Paul Le Guen|Patrick Colleter','His first name is Bruno.','Bruno N’Gotty scored the only goal against Rapid Vienna.'],
['Which Austrian club did Paris beat for European glory in 1996?','Rapid Vienna','Austria Vienna|Sturm Graz|LASK','Their name suggests speed.','PSG defeated Rapid Vienna 1–0.'],
['PSG’s 1996 European final was played in which city?','Brussels','Paris|Vienna|Amsterdam','The King Baudouin Stadium hosted it.','Paris won the Cup Winners’ Cup in Brussels.']]);
club('FC Porto','https://www.uefa.com/uefachampionsleague/news/019d-0e6ae5999141-82ce41064ec4-1000/',[
['Which Porto playmaker scored the second goal in the 2004 Champions League final?','Deco','Maniche|Costinha|Pedro Mendes','He later played for Barcelona and Chelsea.','Deco scored Porto’s second goal against Monaco.'],
['Which Porto substitute completed the scoring in the 2004 final?','Dmitri Alenichev','Benni McCarthy|Pedro Emanuel|Sérgio Conceição','He represented Russia.','Dmitri Alenichev scored the third goal in the 3–0 win.'],
['Which teenager opened Porto’s scoring in that 2004 Champions League final?','Carlos Alberto','Anderson|Hulk|Falcao','His first name is Carlos.','Carlos Alberto put Porto ahead against Monaco.']]);
club('Real Betis Balompié','https://www.realbetisbalompie.es/club/la-historia',[
['Betis were Spanish league champions before the Civil War. In which year?','1935','1925|1945|1955','The title came in the mid-1930s.','Betis won the Spanish league in 1935.'],
['Which 1970s year brought Betis their first Copa del Rey?','1977','1971|1973|1979','It has two sevens.','Betis lifted the Copa del Rey in 1977.'],
['Which domestic trophy did Betis win again in 2022?','Copa del Rey','La Liga|Segunda División|Spanish Super Cup','It is Spain’s knockout cup.','Betis won the 2022 Copa del Rey.']]);
club('Real Madrid C.F.','https://www.realmadrid.com/en-US/news/football/first-team/latest-news/21-years-since-la-novena',[
['A ball drops from the sky in Glasgow. Which Madrid midfielder volleys in the 2002 final winner?','Zinedine Zidane','Luís Figo|Guti|Claude Makélélé','The Frenchman wore number 5.','Zidane’s volley settled the 2002 final against Leverkusen.'],
['Which German club were beaten by Zidane’s famous volley in 2002?','Bayer Leverkusen','Bayern Munich|Borussia Dortmund|Schalke 04','Their nickname is Die Werkself.','Real Madrid beat Bayer Leverkusen in the final.'],
['What does “La Novena” mean in Madrid’s European story?','The ninth European Cup','The ninth league title|Nine straight final wins|A nine-goal final','Novena is Spanish for ninth.','The 2002 triumph was Madrid’s ninth European Cup.']]);
club('AS Roma','https://www.asroma.com/en/news/64160/gallery-roma-make-history-in-tirana',[
['Who supplied Roma’s winning goal in the first Conference League final?','Nicolò Zaniolo','Tammy Abraham|Lorenzo Pellegrini|Henrikh Mkhitaryan','His initials are NZ.','Zaniolo scored the only goal of the 2022 final.'],
['Which coach led Roma to the 2022 Conference League trophy?','José Mourinho','Luciano Spalletti|Claudio Ranieri|Rudi Garcia','The Portuguese coach is called the Special One.','José Mourinho coached Roma’s winners.'],
['Which Dutch club did Roma defeat in the 2022 final in Tirana?','Feyenoord','Ajax|PSV Eindhoven|AZ Alkmaar','The club is from Rotterdam.','Roma beat Feyenoord 1–0 in Tirana.']]);
club('ŠK Slovan Bratislava','https://www.uefa.com/uefachampionsleague/news/025a-0ea797bce7dc-b164f7bcd164-1000--sk-slovan-bratislava-five-claims-to-fame/',[
['Slovan pulled off a famous 1969 European final upset against which club?','Barcelona','Real Madrid|AC Milan|Bayern Munich','The opponents wear blue and garnet.','Slovan beat Barcelona 3–2 in the Cup Winners’ Cup final.'],
['Which European trophy did Slovan win in 1969?','Cup Winners’ Cup','European Cup|UEFA Cup|Intertoto Cup','It was for national cup winners.','Slovan won the 1969 Cup Winners’ Cup.'],
['Which coach led Slovan to their 1969 European trophy?','Michal Vičan','Václav Ježek|Jozef Vengloš|Ján Kozák','His first name is Michal.','Michal Vičan coached the team that beat Barcelona in Basel.']]);
club('Sabah FC','https://sabahfc.az/club/history',[
['Sabah are a young club. In which year were they founded?','2017','1997|2007|1987','The club began in the late 2010s.','Sabah FC was founded on 8 September 2017.'],
['Which established Serbian club did Sabah beat 2–0 at home in European qualifying in 2023?','Partizan','Red Star Belgrade|Vojvodina|Čukarički','Their colours are black and white.','Sabah won the home leg against Partizan 2–0.'],
['Where did Sabah finish in their first season in Azerbaijan’s First Division?','Fifth','First|Second|Third','They finished just outside the top four.','Sabah finished fifth in the 2017/18 First Division.']]);
club('SK Slavia Praha','https://www.slavia.cz/cze/article/historie-803',[
['Which Slavia winger joined Manchester United after EURO 1996?','Karel Poborský','Vladimír Šmicer|Radek Bejbl|Patrik Berger','Remember his famous lob for the Czech Republic.','Karel Poborský moved from Slavia to Manchester United.'],
['Which future Liverpool player left Slavia for Lens in 1996?','Vladimír Šmicer','Tomáš Rosický|Milan Baroš|Pavel Nedvěd','He later scored in the Istanbul final.','Vladimír Šmicer moved to Lens after EURO 1996.'],
['Alongside a domestic title, Slavia reached which stage of the UEFA Cup in 1996?','Semi-finals','Final|Quarter-finals|Round of 32','They were one of the last four.','Slavia reached the 1996 UEFA Cup semi-finals.']]);
club('Sporting Clube de Portugal','https://www.uefa.com/uefachampionsleague/news/023c-0e976af10937-6aed2a57b183-1000--memories-of-ronaldo-s-debut-on-this-day-in-2002/',[
['Which future five-time Ballon d’Or winner made his Sporting senior debut in August 2002?','Cristiano Ronaldo','Luís Figo|Ricardo Quaresma|Nani','He was born in Madeira.','Cristiano Ronaldo made his Sporting first-team debut on 14 August 2002.'],
['Ronaldo’s Sporting debut came against which Italian club?','Inter Milan','AC Milan|Juventus|Lazio','Their traditional shirts are blue and black.','He came on against Inter in Champions League qualifying.'],
['Which club signed Ronaldo from Sporting in 2003?','Manchester United','Real Madrid|Arsenal|Barcelona','Sir Alex Ferguson was the manager.','Ronaldo moved from Sporting to Manchester United in 2003.']]);
club('VfB Stuttgart','https://www.vfb.de/de/1893/club/vfb-e-v-/geschichte/chronik/19--mai-2007/',[
['Which Stuttgart midfielder headed the winner that sealed the 2007 Bundesliga title?','Sami Khedira','Thomas Hitzlsperger|Pavel Pardo|Roberto Hilbert','He later played for Real Madrid and Juventus.','Khedira headed Stuttgart’s winner against Cottbus.'],
['Before Khedira’s winner, who equalised with a volley in Stuttgart’s 2007 title decider?','Thomas Hitzlsperger','Mario Gómez|Cacau|Antonio da Silva','His powerful shooting earned him the nickname The Hammer.','Hitzlsperger’s volley brought Stuttgart level.'],
['Which club did Stuttgart beat on the last day to clinch the 2007 title?','Energie Cottbus','Schalke 04|Werder Bremen|Hamburg','Their name begins with Energie.','Stuttgart beat Energie Cottbus 2–1.']]);
club('Viking FK','https://www.vikingfotball.no/nyheter/fire-nye-aeresmedlemmer-utnevnt',[
['Which Viking player won league titles in 1972, 1973, 1974, 1975 and 1979?','Inge Valen','Brede Hangeland|Erik Nevland|Bjarte Lunde Aarsheim','His surname begins with V.','Inge Valen joined Viking in 1972 and won those five championships.'],
['Viking’s golden run from 1972 to 1975 brought how many consecutive league titles?','Four','Two|Three|Five','Count both the first and last year.','Viking won the Norwegian league in all four seasons from 1972 through 1975.'],
['Viking’s record marksman scored 202 goals. Who was he?','Reidar Kvammen','Erik Nevland|Egil Østenstad|Inge Valen','His initials are RK.','Viking’s club records credit Reidar Kvammen with 202 goals.','https://www.vikingfotball.no/om-klubben']]);
club('Villarreal CF','https://www.uefa.com/uefaeuropaleague/news/0269-125f1aaaeb0d-c59e8a06ac14-1000--villarreal-1-1-manchester-united-aet-11-10-pens-spanish-side/',[
['Which Villarreal keeper scored his penalty and then saved De Gea’s to win the 2021 Europa League?','Gerónimo Rulli','Sergio Asenjo|Pepe Reina|Diego López','The goalkeeper is Argentine.','Gerónimo Rulli decided the shoot-out against Manchester United.'],
['Every outfield player had taken a penalty. What was Villarreal’s winning shoot-out score in the 2021 final?','11–10','5–4|8–7|10–9','The goalkeepers took the last two kicks.','Villarreal won the penalty shoot-out 11–10.'],
['Which coach won the 2021 Europa League with Villarreal?','Unai Emery','Manuel Pellegrini|Marcelino|Quique Setién','He had already won it with Sevilla.','Unai Emery guided Villarreal to the trophy in Gdańsk.']]);
club('FC Bayern München','https://fcbayern.com/en/news/matchreports/2013/05/super-bayern-crowned-champions-of-europe',[
['Which Bayern winger finally found the winner at Wembley in the 2013 Champions League final?','Arjen Robben','Franck Ribéry|Thomas Müller|Xherdan Shaqiri','The Dutchman was known for cutting in onto his left foot.','Arjen Robben scored the late winner against Dortmund.'],
['Which Croatian striker opened Bayern’s scoring in that 2013 final?','Mario Mandžukić','Ivica Olić|Mario Gómez|Claudio Pizarro','He later played for Atlético and Juventus.','Mario Mandžukić put Bayern ahead at Wembley.'],
['Which veteran coach led Bayern to their 2013 European triumph?','Jupp Heynckes','Pep Guardiola|Louis van Gaal|Ottmar Hitzfeld','His first name is Jupp.','Jupp Heynckes coached Bayern’s 2013 winners.']]);
club('Galatasaray A.Ş.','https://www.uefa.com/uefaeuropaleague/news/016e-0e6a3091ff2c-b6d02ad6a643-1000/',[
['Which English club did Galatasaray beat on penalties to win the 2000 UEFA Cup?','Arsenal','Liverpool|Chelsea|Leeds United','The opponents are known as the Gunners.','Galatasaray beat Arsenal in the final shoot-out.'],
['Which Italian club did Galatasaray beat before dropping into their successful 1999/2000 UEFA Cup run?','AC Milan','Inter Milan|Juventus|Roma','The club wears red and black.','A win over AC Milan secured Galatasaray’s UEFA Cup entry.'],
['Galatasaray’s 2000 UEFA Cup win was a European first for clubs from which country?','Türkiye','Greece|Romania|Bulgaria','Galatasaray are based in Istanbul.','The triumph brought Türkiye its first major European club honour.']]);
club('PSV Eindhoven','https://www.psv.nl/en/club/history/history-2',[
['Which PSV keeper saved António Veloso’s penalty to win the 1988 European Cup?','Hans van Breukelen','Jan van Beveren|Gomes|Ronald Waterreus','His surname begins with van B.','Hans van Breukelen made the decisive save against Benfica.'],
['Which Portuguese club faced PSV in the 1988 European Cup final?','Benfica','Porto|Sporting CP|Braga','Their nickname is the Eagles.','PSV defeated Benfica on penalties in Stuttgart.'],
['Which prolific striker is remembered as “Mister PSV”?','Willy van der Kuijlen','Ruud van Nistelrooy|Romário|Ronaldo','His first name is Willy.','Willy van der Kuijlen’s long PSV career earned him that nickname.']]);
club('FC Shakhtar Donetsk','https://www.uefa.com/uefaeuropaleague/news/01d9-0e7233534cb2-ca7dcb346335-1000--jadson-the-difference-as-shakhtar-triumph/',[
['Which Brazilian scored Shakhtar’s extra-time winner in the 2009 UEFA Cup final?','Jádson','Fernandinho|Willian|Ilsinho','His name begins with J.','Jádson scored the winner against Werder Bremen.'],
['Which Shakhtar striker opened the scoring in the 2009 UEFA Cup final?','Luiz Adriano','Brandão|Alex Teixeira|Eduardo','His first name is Luiz.','Luiz Adriano put Shakhtar ahead in Istanbul.'],
['Shakhtar won the last final played under which competition name in 2009?','UEFA Cup','Cup Winners’ Cup|Intertoto Cup|European Cup','It became the Europa League the following season.','Shakhtar were the final UEFA Cup winners before the Europa League rebrand.']]);
club('Arsenal FC','https://www.arsenal.com/history/the-wenger-years/the-2004-invincibles?ts=dn',[
['What nickname honours Arsenal’s unbeaten 2003/04 league champions?','The Invincibles','The Busby Babes|The Lisbon Lions|The Galácticos','They finished the league season without a defeat.','Arsenal’s 2003/04 champions are known as the Invincibles.'],
['Arsenal’s unbeaten league sequence stretched across seasons. How many matches did it reach?','49','38|42|55','It was eleven more than a full 38-game season.','The unbeaten run lasted 49 league matches from May 2003 to October 2004.'],
['Which young Spanish midfielder scored when Arsenal broke the unbeaten league record against Blackburn in 2004?','Cesc Fàbregas','Mikel Arteta|Santi Cazorla|José Antonio Reyes','He later played for Barcelona and Chelsea.','Fàbregas was among the scorers in Arsenal’s record-breaking win over Blackburn.']]);
club('FC Internazionale Milano','https://www.inter.it/it/notizie/2021-05-22-otd-triplete-champions-madrid-inter-bayern-monaco',[
['Two clinical finishes made Inter champions of Europe in 2010. Which striker scored both?','Diego Milito','Samuel Eto’o|Goran Pandev|Mario Balotelli','His nickname was Il Principe.','Diego Milito scored both goals in Inter’s 2–0 final win.'],
['Which Dutch playmaker supplied the return pass for Milito’s first goal in the 2010 final?','Wesley Sneijder','Arjen Robben|Clarence Seedorf|Rafael van der Vaart','He wore Inter’s number 10.','Sneijder returned Milito’s headed pass before the opening goal.'],
['Who coached Inter’s treble-winning side in 2010?','José Mourinho','Roberto Mancini|Rafael Benítez|Antonio Conte','The Portuguese coach left for Real Madrid that summer.','José Mourinho coached Inter to the league, cup and Champions League treble.']]);
club('RC Lens','https://www.rclens.fr/fr/club/histoire/champions',[
['Who scored the goal at Auxerre that sealed Lens’ 1998 league title?','Yoann Lachor','Tony Vairelles|Anto Drobnjak|Vladimír Šmicer','His initials are YL.','Yoann Lachor equalised in the 1–1 draw that secured the title.'],
['Who captained Lens’ 1998 French champions?','Jean-Guy Wallemme','Éric Sikora|Guillaume Warmuz|Frédéric Déhu','His first name is Jean-Guy.','Jean-Guy Wallemme captained the title-winning team.'],
['Lens needed what result at Auxerre on the last day of 1997/98 to become champions?','At least a draw','A win by two goals|A win by three goals|A defeat by one goal','One point was enough.','A 1–1 draw gave Lens the point they needed.']]);
club('AC Milan','https://www.acmilan.com/en/club/history',[
['Which English founder chose Milan’s red-and-black identity in 1899?','Herbert Kilpin','Alfred Edwards|Nereo Rocco|Gianni Rivera','His initials are HK.','Herbert Kilpin was a founder of Milan and associated red and black with the club’s identity.'],
['Which Milan coach won back-to-back European Cups in 1989 and 1990?','Arrigo Sacchi','Fabio Capello|Carlo Ancelotti|Nils Liedholm','He changed football with pressing and an organised defensive line.','Arrigo Sacchi led Milan to two European Cups.'],
['Milan filled the Ballon d’Or podium in 1988. Which Dutch trio occupied it?','Van Basten, Gullit and Rijkaard','Cruyff, Neeskens and Rep|Bergkamp, Overmars and Seedorf|Robben, Sneijder and Van Persie','All three played together at Milan.','Marco van Basten, Ruud Gullit and Frank Rijkaard occupied the top three places in 1988.'],
['Which year brought Milan their first European Cup, at Wembley?','1963','1953|1973|1983','It was in the early 1960s.','Milan became European champions for the first time in 1963.']]);
const teams=JSON.parse(fs.readFileSync(new URL('sources/champions-league-2026-27.json',root),'utf8'));
const chapters=JSON.parse(fs.readFileSync(new URL('squad-chapters.json',root),'utf8'));
const aliases={'FC Barcelona':'Barcelona','Arsenal FC':'Arsenal','Liverpool FC':'Liverpool','FC Bayern München':'Bayern Munich','FC Internazionale Milano':'Inter Milan','SSC Napoli':'Napoli','AS Roma':'Roma','Real Madrid C.F.':'Real Madrid','Real Betis Balompié':'Real Betis','Villarreal CF':'Villarreal','Atlético de Madrid':'Atlético Madrid','Como 1907':'Como'};
const questions=[];
for(const pack of packs){
 const matches=[...teams.filter(c=>c.name===pack.name),...chapters.filter(c=>(c.name===pack.name||c.name===aliases[pack.name])&&c.competition!=='champions-league')];
 for(const c of matches)for(const [i,row] of pack.rows.entries()){
  const [prompt,answer,wrong,hint,explanation,source=pack.source]=row;
  questions.push({id:`${c.code}-story-${i+1}`,prompt,answer,options:[answer,...wrong.split('|')],hint,explanation,source,category:'squads',difficulty:i===2?'expert':'fan',era:'Club history',premium:false,squadCode:c.code,clubTopic:'history'});
 }
}
for(const team of teams)if(!questions.some(q=>q.squadCode===team.code))throw new Error('No stories: '+team.name);
fs.writeFileSync(new URL('club-history.json',root),JSON.stringify(questions,null,2)+'\n');
console.log(`${questions.length} sourced club-history questions written.`);
