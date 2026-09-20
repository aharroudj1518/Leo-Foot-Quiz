const iso:Record<string,string>={ALB:'AL',ALG:'DZ',ANG:'AO',ARG:'AR',ARM:'AM',AUS:'AU',AUT:'AT',AZE:'AZ',BEL:'BE',BFA:'BF',BIH:'BA',BRA:'BR',CAN:'CA',CIV:'CI',CMR:'CM',COD:'CD',COL:'CO',CPV:'CV',CRO:'HR',CUW:'CW',CZE:'CZ',DEN:'DK',DOM:'DO',ECU:'EC',EGY:'EG',ESP:'ES',FIN:'FI',FRA:'FR',GAB:'GA',GAM:'GM',GEO:'GE',GER:'DE',GHA:'GH',GLP:'GP',GNB:'GW',GRE:'GR',GUI:'GN',HON:'HN',HUN:'HU',IDN:'ID',IRL:'IE',ISL:'IS',ITA:'IT',JAM:'JM',JPN:'JP',KAZ:'KZ',KOR:'KR',KOS:'XK',KSA:'SA',LBY:'LY',LUX:'LU',MAR:'MA',MEX:'MX',MLI:'ML',MNE:'ME',MOZ:'MZ',MTN:'MR',NED:'NL',NGA:'NG',NOR:'NO',NZL:'NZ',PAN:'PA',PAR:'PY',POL:'PL',POR:'PT',ROU:'RO',RSA:'ZA',RUS:'RU',RWA:'RW',SEN:'SN',SRB:'RS',SUI:'CH',SUR:'SR',SVK:'SK',SVN:'SI',SWE:'SE',TUN:'TN',TUR:'TR',UKR:'UA',URU:'UY',USA:'US',UZB:'UZ',VEN:'VE'};
export function nationalityFlag(code:string){
 const subdivision:Record<string,string>={ENG:'gbeng',SCO:'gbsct',WAL:'gbwls'};
 if(subdivision[code])return String.fromCodePoint(0x1f3f4,...[...subdivision[code]].map(c=>0xe0000+c.charCodeAt(0)),0xe007f);
 // Northern Ireland has no distinct Unicode flag; retain its unambiguous code.
 return iso[code]?[...iso[code]].map(c=>String.fromCodePoint(0x1f1e6+c.charCodeAt(0)-65)).join(''):code;
}
