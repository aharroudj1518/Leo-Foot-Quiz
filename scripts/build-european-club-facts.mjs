import fs from 'node:fs';
// Editorial rows checked against the linked club/competition histories on 2026-09-17.
// Keys identify facts, not wording; keep them stable when copy changes.
const packs=[];
function club(name,source,rows){packs.push({name,aliases:[],facts:rows.map(([key,topic,prompt,answer,wrong,hint,explanation,override])=>({key,topic,prompt,answer,wrong:wrong.split('|'),hint,explanation,source:override??source}))});}
club('AEK Athens FC','https://www.uefa.com/uefachampionsleague/news/0193-0e6a685603db-7f788e7b28ea-1000--aek-challenge-endures/',[
 ['founded','history','In which year did AEK begin?','1924','1904|1914|1934','Between the world wars.','AEK was established in 1924.'],
 ['origins','identity','AEK’s founders had emigrated from which city?','Constantinople','Alexandria|Thessaloniki|Rome','The name preserves a Byzantine connection.','Immigrants from Constantinople founded AEK in Athens.'],
 ['colours','identity','Which colour pair expresses AEK’s Byzantine heritage?','Black and yellow','Blue and white|Red and black|Green and white','One colour is yellow.','AEK adopted black and yellow.'],
 ['first-cup','honours','Which club did AEK defeat for their first Greek Cup in 1932?','Aris Thessaloniki','Olympiacos|Panathinaikos|PAOK','Another club associated with yellow and black.','Aris were the beaten finalists in 1932.'],
 ['six-draws','records','What unusual result did AEK record in all six 2002/03 Champions League group games?','A draw','A win|A defeat|A goalless defeat','They were unbeaten but never won.','All six of AEK’s group matches ended level.']]);
club('FK Bodø/Glimt','https://www.uefa.com/news-media/news/02a3-201463c02c67-18afed0c3b18-1000--bodo-glimt-s-sensational-six-year-european-rise/',[
 ['first-title','honours','When did Bodø/Glimt win their first Norwegian league title?','2020','1990|2000|2010','It came in the pandemic year.','Their first Norwegian championship arrived in 2020.'],
 ['ground','grounds','Which stadium hosted Bodø/Glimt’s rise through Europe?','Aspmyra Stadion','Brann Stadion|Ullevaal Stadion|Lerkendal','Its name begins with A.','Aspmyra is Glimt’s home stadium.'],
 ['arctic','identity','Which geographic circle is associated with Bodø/Glimt’s northern home?','Arctic Circle','Antarctic Circle|Tropic of Cancer|Equator','Think of polar nights.','Bodø lies in the Arctic region.'],
 ['coach-rise','managers','Who coached Glimt during their 2025 Europa League semi-final campaign?','Kjetil Knutsen','Ole Gunnar Solskjær|Ståle Solbakken|Åge Hareide','His initials are KK.','Knutsen led Glimt’s European rise.'],
 ['europa-semi','records','How far did Glimt go in the 2024/25 Europa League?','Semi-finals','Final|Quarter-finals|Round of 16','Four clubs remained.','Glimt reached the semi-finals before losing to Tottenham.']]);
club('Club Brugge KV','https://www.uefa.com/uefachampionsleague/news/0253-0e7556a61230-2252aad12079-1000--club-brugge-facts/',[
 ['founded','history','Which year marks the founding of Club Brugge?','1891','1871|1901|1921','Late in the nineteenth century.','Club Brugge began in 1891.'],
 ['nickname','identity','What does Club Brugge’s nickname Blauw-Zwart mean?','Blue and Blacks','Red Devils|White Stars|Golden Lions','It names two kit colours.','Blauw-Zwart means Blue and Blacks.'],
 ['floriana-eight','records','How many goals did Brugge score against Floriana at home in 1973?','Eight','Four|Five|Six','Two more than six.','Brugge defeated Floriana 8–0.'],
 ['europa-2015','history','Which round did Brugge reach in the 2014/15 Europa League?','Quarter-finals','Final|Semi-finals|Round of 32','Eight clubs remained.','Brugge reached the quarter-finals that season.'],
 ['porto-away','records','Which Portuguese club lost 4–0 at home to Brugge in September 2022?','Porto','Benfica|Sporting CP|Braga','The match was at the Dragão.','Brugge won 4–0 away to Porto.']]);
club('Fenerbahçe SK','https://www.uefa.com/uefaconferenceleague/news/0277-158ca3e8dca7-a9d6dc020092-1000--club-facts-fenerbahce/',[
 ['founded','history','Fenerbahçe’s founding year appears on its crest. What is it?','1907','1887|1897|1917','Early in the twentieth century.','Fenerbahçe was founded in 1907.'],
 ['nickname','identity','Which birds feature in Fenerbahçe’s Yellow nickname?','Canaries','Eagles|Owls|Swans','Small songbirds.','Sarı Kanaryalar means Yellow Canaries.'],
 ['district','identity','Which Istanbul district is Fenerbahçe’s home district?','Kadıköy','Beşiktaş|Beyoğlu|Fatih','It lies on the Asian side.','The club statutes identify Kadıköy as its base.','https://www.fenerbahce.org/FB/files/31/3168bf02-6677-464a-8265-5a74c700fee0.pdf'],
 ['colours','identity','Which dark colour accompanies yellow in Fenerbahçe’s traditional kit?','Navy blue','Black|Maroon|Green','A deep shade of blue.','Yellow and navy are the club colours.','https://www.fenercell.com/kurumsal/kulubumuz/19'],
 ['mtk-five','records','Which Hungarian club lost 5–0 at home to Fenerbahçe in 2008 qualifying?','MTK Budapest','Ferencváros|Újpest|Debrecen','The answer includes three initials.','Fenerbahçe defeated MTK Budapest 5–0.']]);
club('Feyenoord','https://www.uefa.com/uefachampionsleague/news/023a-0e973231ec78-63a6966bd752-1000--club-facts-feyenoord/',[
 ['founded','history','In which year was Feyenoord founded?','1908','1888|1898|1928','The first decade of the twentieth century.','Feyenoord began in 1908.'],
 ['nickname','identity','Feyenoord’s De Trots van Zuid nickname means what?','The Pride of South','The Flying Dutchmen|The White Eagles|The Harbour Kings','It points to part of Rotterdam.','The nickname means The Pride of South.'],
 ['rumelange-twelve','records','How many goals did Feyenoord score away to Rumelange in 1972?','Twelve','Seven|Nine|Ten','A dozen.','Feyenoord won the UEFA Cup game 12–0.'],
 ['conference-final','honours','Feyenoord reached the first final of which new competition in 2022?','UEFA Conference League','Intertoto Cup|Cup Winners’ Cup|Nations League','UEFA’s third men’s club competition.','Feyenoord were the inaugural Conference League runners-up.'],
 ['intercontinental','honours','In which year did Feyenoord win the European/South American Cup?','1970','1960|1980|1990','The same year as their European Cup.','Feyenoord also won the intercontinental trophy in 1970.']]);
club('LASK','https://www.lask.at/de/m/club',[
 ['founded','history','Which founding year does LASK officially celebrate?','1908','1888|1928|1948','The football roots date to the early twentieth century.','LASK celebrates its football founding in 1908.'],
 ['original-name','identity','What did the original LSK initials stand for?','Linzer Sport Klub','Linzer Ski Klub|Landes Sport Kreis|Linz Stadt Kicker','The city appears in the first word.','The football club began as Linzer Sport Klub.'],
 ['colours','identity','Which two colours belong to LASK?','Black and white','Red and white|Blue and yellow|Green and black','Think of monochrome stripes.','LASK’s official colours are black and white.'],
 ['promotion-2017','history','Which year brought LASK back into Austria’s top division after their lower-league rebuilding?','2017','2009|2011|2021','It came three years after their 2014 promotion.','LASK returned to the Bundesliga in 2017.'],
 ['europe-2020','records','Which English club faced LASK in the 2019/20 Europa League round of 16?','Manchester United','Arsenal|Chelsea|Leicester City','Old Trafford is the clue.','LASK’s 2020 knockout run met Manchester United.']]);
club('LOSC Lille','https://www.losc.fr/palmares',[
 ['founded','history','In which year did the merger creating LOSC take place?','1944','1924|1934|1954','Near the end of the Second World War.','The Lille clubs merged in 1944.','https://www.losc.fr/actualites-foot-lille/1944-2014-souvenez-vous-il-y-70-ans'],
 ['merger','identity','Which two clubs merged to create LOSC?','Olympique Lillois and SC Fives','RC Lens and US Boulogne|Roubaix and Tourcoing|Valenciennes and Dunkerque','Both were local Lille rivals.','Olympique Lillois joined Sporting Club Fivois.','https://www.losc.fr/actualites-foot-lille/1944-2014-souvenez-vous-il-y-70-ans'],
 ['nickname','identity','Which animal gives Lille their Les Dogues nickname?','Mastiffs','Foxes|Eagles|Wolves','A large breed of dog.','Dogues are mastiff-type dogs.','https://losc.fr/en/node/14883'],
 ['first-title','honours','When did LOSC win its first post-merger French championship?','1946','1936|1956|1966','Two years after the merger.','LOSC won the 1946 championship.'],
 ['cup-hattrick','records','How many consecutive French Cups did Lille win from 1946 to 1948?','Three','Two|Four|Five','Count the three years inclusively.','Lille won the cup in 1946, 1947 and 1948.']]);
club('Paris Saint-Germain','https://www.psg.fr/en/the-club/facilities/parc-des-princes/history',[
 ['founded','history','In which year was Paris Saint-Germain created?','1970','1950|1960|1980','The decade of disco was beginning.','PSG was created in 1970.','https://www.psg.fr/en/content/the-paris-derby-where-it-all-began-psg-history-ligue-1-2025-2026'],
 ['ground','grounds','Which stadium became PSG’s permanent home in 1974?','Parc des Princes','Stade de France|Stade Vélodrome|Stade Gerland','Its name translates as Park of the Princes.','PSG settled at the Parc des Princes in 1974.'],
 ['ground-roots','grounds','Which sport was the original Parc des Princes built for in 1897?','Cycling','Tennis|Cricket|Ice hockey','It was a velodrome.','The first Parc was a cycling venue.'],
 ['architect','grounds','Who designed the modern Parc des Princes?','Roger Taillibert','Gustave Eiffel|Norman Foster|Santiago Calatrava','A French architect with initials RT.','Roger Taillibert designed the modern stadium.'],
 ['guingamp-nine','records','Which club suffered PSG’s 9–0 home league win in January 2019?','Guingamp','Rennes|Nantes|Lorient','A Breton club with a red-and-black identity.','PSG beat Guingamp 9–0.','https://en.psg.fr/teams/club/content/50-years-at-the-parc-in-numbers']]);
club('FC Porto','https://www.fcporto.pt/pt/noticias/20240928-pt-seremos-sempre-um-clube-dos-socios-e-para-os-socios',[
 ['founded','history','Which year does Porto recognise as its founding year?','1893','1873|1903|1923','Late in the nineteenth century.','Porto recognises 28 September 1893.'],
 ['founder','identity','Who founded FC Porto in 1893?','António Nicolau d’Almeida','Cosme Damião|José Alvalade|Herbert Kilpin','His surname is d’Almeida.','António Nicolau d’Almeida founded the club.'],
 ['revival','history','Who revived Porto in 1906?','José Monteiro da Costa','Eusébio|Fernando Peyroteo|Béla Guttmann','His name includes Monteiro.','José Monteiro da Costa relaunched Porto in 1906.'],
 ['ground-predecessor','grounds','Which ground did the Estádio do Dragão replace?','Estádio das Antas','Estádio da Luz|Estádio do Restelo|Estádio do Bessa','Its name begins with Antas.','The Dragão succeeded the Antas stadium.','https://ligaportugalstorage.blob.core.windows.net/backoffice/assets/FC_Porto_Guia_do_Adepto_2025_26_7d4ba8f106.pdf'],
 ['ground-opening','grounds','In which year did Porto’s Dragão stadium open?','2003','1993|1998|2008','Just before Portugal hosted EURO 2004.','The Dragão opened in 2003.','https://www.fcporto.pt/pt/noticias/20230928-pt-130-o-aniversario-do-fc-porto-assinalado-com-o-hastear-da-bandeira']]);
club('ŠK Slovan Bratislava','https://www.uefa.com/uefachampionsleague/news/025a-0ea797bce7dc-b164f7bcd164-1000--sk-slovan-bratislava-five-claims-to-fame/',[
 ['founded','history','In which year did Slovan Bratislava begin?','1919','1899|1909|1939','Just after the First World War.','Slovan was formed in 1919.'],
 ['nickname','identity','What does Slovan’s Belasí nickname mean?','Sky blues','Red Stars|White Eagles|Black Wolves','A light colour.','Belasí means Sky blues.'],
 ['traditional-ground','grounds','What is the name of Slovan’s traditional Bratislava home?','Tehelné pole','Letná|Eden|Strahov','The name refers to a brickfield.','Tehelné pole is Slovan’s traditional home.'],
 ['temporary-ground','grounds','Which ground hosted Slovan during the redevelopment of Tehelné pole?','Štadión Pasienky','Ernst Happel Stadion|Stadion Maksimir|Puskás Aréna','A nearby Bratislava ground.','Slovan temporarily played at Pasienky.'],
 ['popluhar-award','records','Which Slovan defender became Slovakia’s footballer of the twentieth century?','Ján Popluhár','Martin Škrtel|Milan Škriniar|Peter Pekarík','He played in the 1962 World Cup final.','Popluhár received Slovakia’s century honour.']]);
club('Sabah FC','https://sabahfc.az/club/history',[
 ['first-top-flight','history','Which season was Sabah’s first in Azerbaijan’s Premier League?','2018/19','2016/17|2020/21|2022/23','The season after their formation campaign.','Sabah entered the top flight in 2018/19.'],
 ['first-top-flight-win','history','Who were Sabah’s opponents in their first Premier League victory?','Keşlə','Neftçi|Qarabağ|Zirə','The club was later renamed Shamakhi.','Sabah won their first top-flight match 1–0 against Keşlə.'],
 ['first-european-tie','records','Which Latvian club did Sabah eliminate on their European debut?','RFS','Riga FC|Liepāja|Ventspils','Three initials.','Sabah beat RFS in both legs in 2023.'],
 ['european-home','grounds','Which ground hosted Sabah’s home European debut in Masazır?','Bank Respublika Arena','Tofiq Bahramov Stadium|Dalga Arena|Bakcell Arena','Its name includes a bank.','The RFS return match was at Bank Respublika Arena.'],
 ['first-trophy','honours','Which trophy became Sabah’s first major title in 2025?','Azerbaijan Cup','Azerbaijan Premier League|UEFA Conference League|Azerbaijan Super Cup','They beat Qarabağ in the final.','Sabah won the 2025 Azerbaijan Cup.']]);
club('SK Slavia Praha','https://www.slavia.cz/eng/article/slavia-celebrates-the-125th-anniversary-30179',[
 ['founded','history','Which year marks Slavia Prague’s founding?','1892','1872|1902|1922','Before the twentieth century.','Slavia was founded in November 1892.'],
 ['first-sport','identity','Slavia began with which sport before football?','Cycling','Rowing|Cricket|Tennis','Two wheels, no motor.','Slavia originated as a student cycling club.'],
 ['colours','identity','Which pair forms Slavia’s traditional divided shirt?','Red and white','Blue and black|Green and white|Yellow and blue','A red star accompanies it.','Slavia’s traditional shirt is red and white.'],
 ['mitropa','honours','In which year did Slavia win the Central European (Mitropa) Cup?','1938','1928|1948|1958','Just before the Second World War.','Slavia won the Central European Cup in 1938.'],
 ['first-ucl-group','records','Which season brought Slavia’s first Champions League group-stage appearance?','2007/08','1997/98|2002/03|2012/13','Arsenal were among their opponents.','Slavia debuted in the groups in 2007/08.']]);
club('Sporting Clube de Portugal','https://www.sporting.pt/en/club/history/Founding-members',[
 ['founded','history','In which year was Sporting Clube de Portugal founded?','1906','1886|1896|1926','Early in the twentieth century.','Sporting was founded in 1906.'],
 ['founder','identity','Which Sporting founding figure gives his name to the club’s stadium?','José Alvalade','Cosme Damião|Pinto da Costa|Luís Figo','His first name was José.','José Alvalade was a founding figure.'],
 ['crest-animal','identity','Which animal has long stood on Sporting’s badge?','Lion','Eagle|Dragon|Wolf','A big cat.','A rampant lion is Sporting’s traditional emblem.','https://backoffice.sporting.pt/en/club/history/the-badge'],
 ['kit-colours','identity','Which two colours make Sporting’s famous hoops?','Green and white','Blue and white|Red and black|Yellow and navy','The first colour represents hope.','Sporting wear green and white.','https://backoffice.sporting.pt/en/club/history/the-kit'],
 ['new-ground-year','grounds','When did Sporting’s present José Alvalade stadium open?','2003','1983|1993|2013','The year before EURO 2004.','The new ground opened in August 2003.','https://www.sporting.pt/en/club/history/stadium-history']]);
club('Viking FK','https://www.vikingfotball.no/om-klubben/engelsk/history-of-viking-football-club',[
 ['founded','history','In which year was Viking founded?','1899','1879|1909|1929','The final year of the 1800s.','Viking began in August 1899.'],
 ['home-city','identity','Which Norwegian city is Viking’s home?','Stavanger','Bergen|Trondheim|Tromsø','A city associated with Norway’s oil industry.','Viking was founded in Stavanger.'],
 ['nickname','identity','What does Viking’s De mørkeblå nickname mean?','The Dark Blues','The Red Army|The White Knights|The Golden Eagles','It describes their shirt colour.','The nickname means The Dark Blues.'],
 ['original-kit','identity','What colour were Viking’s original shirts before they switched to dark blue?','White','Green|Red|Black','The badge caused problems during washing.','Viking originally wore white shirts.'],
 ['first-title','honours','In which year did Viking win their first Norwegian league championship?','1958','1938|1948|1968','Late in the 1950s.','Viking’s first league title came in 1958.']]);
club('Galatasaray A.Ş.','https://www.galatasaray.org/en/s/general-information/185',[
 ['founded','history','Which year marks Galatasaray’s founding?','1905','1885|1895|1915','Early in the twentieth century.','Galatasaray was founded in 1905.'],
 ['founder','identity','Who was Galatasaray’s founding president?','Ali Sami Yen','Şükrü Saracoğlu|Süleyman Seba|Ziya Songülen','The old stadium carried his name.','Ali Sami Yen was the first president.','https://www.galatasaray.org/en/s/galatasaray-spor-kulubu-1905/3'],
 ['school-roots','identity','What institution brought Galatasaray’s founders together?','Galatasaray High School','A naval academy|A railway company|A mining company','They were classmates.','The club grew from Galatasaray High School.','https://www.galatasaray.org/en/s/galatasaray-spor-kulubu-1905/3'],
 ['kit-colours','identity','Which pair became Galatasaray’s famous colours?','Red and yellow','Blue and white|Green and black|Purple and white','One colour is associated with gold.','Galatasaray adopted red and yellow.','https://www.galatasaray.org/en/s/story-of-our-colors/186'],
 ['colours-debut','history','Against whose football team did Galatasaray first wear red and yellow in 1908?','The cruiser Barham','A Paris school|An Athens university|A Vienna factory','Their opponents came from a British ship.','The colour debut was against Barham’s team.','https://www.galatasaray.org/en/s/story-of-our-colors/186']]);
club('PSV Eindhoven','https://www.psv.nl/en/club/history/overview',[
 ['founded','history','In which year was PSV officially founded?','1913','1893|1903|1923','One year before the First World War.','PSV was founded in August 1913.'],
 ['company-roots','identity','Which company’s workers formed PSV?','Philips','Shell|Heineken|KLM','An electronics company.','PSV began as a sports club for Philips employees.'],
 ['ground','grounds','Which stadium is PSV’s traditional home?','Philips Stadion','De Kuip|Johan Cruijff ArenA|De Grolsch Veste','It shares the founding company’s name.','PSV play at Philips Stadion.'],
 ['first-european-title','honours','Which European trophy did PSV win in 1978?','UEFA Cup','European Cup|Cup Winners’ Cup|Intertoto Cup','The Europa League’s predecessor.','PSV won the 1978 UEFA Cup.','https://www.psv.nl/en/media/article/the-final-from-78-that-was-no-final-at-all'],
 ['rijvers','managers','Who coached PSV to their first European trophy in 1978?','Kees Rijvers','Guus Hiddink|Dick Advocaat|Bobby Robson','His first name was Kees.','Kees Rijvers led PSV’s 1978 winners.','https://www.psv.nl/en/media/article/the-team-of-78']]);
club('FC Shakhtar Donetsk','https://shakhtar.com/en/club/timeline/',[
 ['founded','history','In which year did Shakhtar’s story begin?','1936','1916|1926|1946','In the middle of the 1930s.','The team was created in 1936.'],
 ['original-name','history','What was Shakhtar originally called?','Stakhanovets','Dynamo Donetsk|Metalist Donetsk|Spartak Donetsk','Named after miner Aleksei Stakhanov.','The original club name was Stakhanovets.'],
 ['name-meaning','identity','What does Shakhtar mean in Ukrainian?','Miner','Sailor|Soldier|Farmer','The Donbas coalfields are the clue.','Shakhtar means miner.'],
 ['kit-colours','identity','Which two colours are associated with Shakhtar’s kit?','Orange and black','Green and white|Blue and yellow|Purple and gold','One resembles a glowing coal.','Orange and black are the club colours.'],
 ['donbas-arena','grounds','Which Donetsk stadium was built as Shakhtar’s home?','Donbas Arena','Olympic Stadium Kyiv|Metalist Stadium|Arena Lviv','It is named after the region.','The Donbas Arena was built for Shakhtar in Donetsk.']]);
club('RC Lens','https://www.rclens.fr/fr/club/rclens-depuis-1906',[
 ['founded','history','In which year was Racing Club de Lens founded?','1906','1886|1896|1926','Early in the twentieth century.','Lens began in 1906.'],
 ['kit-colours','identity','What does Lens’ Sang et Or identity mean?','Blood and Gold','Blue and Black|Green and White|Silver and Red','The second colour is a precious metal.','Sang et Or means Blood and Gold.'],
 ['ground','grounds','Which stadium has been Lens’ home since 1933?','Bollaert-Delelis','Pierre-Mauroy|Stade Océane|Stade de la Meinau','Its name honours Bollaert and Delelis.','The stadium opened in June 1933.'],
 ['mining-crest','identity','Which piece of mining equipment appears on Lens’ crest?','A miner’s lamp','A drilling rig|A railway wagon|A winding wheel','It lights the way underground.','The badge includes a miner’s lamp.'],
 ['league-cup','honours','Which trophy did Lens win in 1999, one year after their league title?','Coupe de la Ligue','Coupe de France|UEFA Cup|Champions League','France’s former league cup.','Lens won the 1999 Coupe de la Ligue.']]);
fs.writeFileSync(new URL('../src/content/club-facts-europe.json',import.meta.url),JSON.stringify(packs,null,2)+'\n');
console.log(`${packs.length} European clubs; ${packs.reduce((n,p)=>n+p.facts.length,0)} sourced facts.`);
