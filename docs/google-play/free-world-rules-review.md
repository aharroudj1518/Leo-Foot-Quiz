# Free world and rules content review

Review date: **2026-10-06 UTC**. Reviewers: Codex `news_service`, with a separate Codex `rules_editorial` review of the rules subset. This records an independent **automated editorial review**, not a human sign-off, licensing clearance, or verification of payment flows.

Scope: **63 existing free questions** — 22 men's World Cup winners, nine Women's World Cup winners, 17 EURO winners and 15 laws questions. The source of record is `src/content/questions.json`; `scripts/build-content.py` remains the generator owner's responsibility. Every scoped prompt, answer, displayed option, hint, explanation, era and source URL was examined. The review covers the questions listed below, not every possible football fact or tournament edition.

## Findings and corrections

All 48 world answer keys match the cited primary evidence. Their date-specific prompts and explanations correctly describe historical winners, without asserting that those teams are still the current champions. The 17 EURO edition URLs resolve to the correct edition; none needs an offset correction. In particular, **EURO 2020 was played in 2021**, and **Czechoslovakia**, rather than a modern successor alone, is the historical 1976 winner.

The existing [men's FIFA archive index](https://www.archives.fifa.com/fifa_world_cup) and [women's FIFA archive index](https://www.archives.fifa.com/fifa_womens_world_cup) are reachable. They are navigation pages listing tournaments and hosts, not direct winner evidence. Replace the 31 World Cup question sources with the more specific FIFA sources below; calling the old links broken would be inaccurate.

| IDs | Replacement source |
| --- | --- |
| `world-1930`, `world-1934`, `world-1938`, `world-1950`, `world-1954`, `world-1958`, `world-1962`, `world-1966`, `world-1970`, `world-1974`, `world-1978` | [FIFA champions, 1930–1978](https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1930-1978-uruguay-italy-germany-brazil-england-argentina) |
| `world-1982`, `world-1986`, `world-1990`, `world-1994`, `world-1998`, `world-2002`, `world-2006`, `world-2010`, `world-2014`, `world-2018`, `world-2022` | [FIFA champions, 1982–2026](https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1982-2026-italy-argentina-germany-brazil-france-spain) |
| `women-1991`, `women-1999`, `women-2015`, `women-2019` | [FIFA: USA all-time record](https://inside.fifa.com/associations/USA) |
| `women-1995` | [FIFA: Norway all-time record](https://inside.fifa.com/en/associations/NOR) |
| `women-2003`, `women-2007` | [FIFA: Germany all-time record](https://inside.fifa.com/associations/GER) |
| `women-2011` | [FIFA: Japan all-time record](https://inside.fifa.com/associations/jpn) |
| `women-2023` | [FIFA: Spain all-time record](https://inside.fifa.com/associations/ESP) |

Recommended hint precision: use `A South American country whose current capital is Brasília.` for Brazil. The original present-tense clue is not a false statement, but **world-1958** benefits from explicit contemporary framing: Brazil moved its capital in 1960. [Brazilian law setting the transfer date](https://www.planalto.gov.br/ccivil_03/leis/l3273.htm).

Optional answer compatibility: the four United States winner questions may accept `USA`, `US` and `United States of America`; `euro-1960` may accept `USSR`. These are not blockers for the current multiple-choice world mode. Do not replace historical names with modern successor countries as canonical answers.

The 15 rules answer keys are correct. Six questions need wording precision: `rule-1` maximum player count; `rule-2` starting minimum rather than an absolute continuation claim; `rule-9` stationary ball and penalty-mark centre; `rule-11` centre-mark hint; `rule-12` and `rule-13` offside **offence**, distinguished from position. Exact wording and all 15 primary-source checks are in [the separate rules evidence record](free-rules-editorial-evidence.md).

## All 48 world questions: evidence ledger

The men's winner checks combine FIFA's two champions articles above with the opened association records below. FIFA records aggregate the pre-reunification men's titles under Germany; the corresponding historical articles identify West Germany. The displayed answer remains period-appropriate.

| Question ID | Confirmed answer | Direct primary corroboration |
| --- | --- | --- |
| `world-1930` | Uruguay | [FIFA Uruguay](https://inside.fifa.com/en/associations/URU) |
| `world-1934` | Italy | [FIFA Italy](https://inside.fifa.com/associations/ITA) |
| `world-1938` | Italy | [FIFA Italy](https://inside.fifa.com/associations/ITA) |
| `world-1950` | Uruguay | [FIFA Uruguay](https://inside.fifa.com/en/associations/URU) |
| `world-1954` | West Germany | [FIFA Germany](https://inside.fifa.com/associations/GER) |
| `world-1958` | Brazil | [FIFA Brazil](https://inside.fifa.com/associations/BRA) |
| `world-1962` | Brazil | [FIFA Brazil](https://inside.fifa.com/associations/BRA) |
| `world-1966` | England | [FIFA champions, 1930–1978](https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1930-1978-uruguay-italy-germany-brazil-england-argentina) |
| `world-1970` | Brazil | [FIFA Brazil](https://inside.fifa.com/associations/BRA) |
| `world-1974` | West Germany | [FIFA Germany](https://inside.fifa.com/associations/GER) |
| `world-1978` | Argentina | [FIFA Argentina](https://inside.fifa.com/en/associations/ARG) |
| `world-1982` | Italy | [FIFA Italy](https://inside.fifa.com/associations/ITA) |
| `world-1986` | Argentina | [FIFA Argentina](https://inside.fifa.com/en/associations/ARG) |
| `world-1990` | West Germany | [FIFA Germany](https://inside.fifa.com/associations/GER) |
| `world-1994` | Brazil | [FIFA Brazil](https://inside.fifa.com/associations/BRA) |
| `world-1998` | France | [FIFA France](https://inside.fifa.com/associations/FRA) |
| `world-2002` | Brazil | [FIFA Brazil](https://inside.fifa.com/associations/BRA) |
| `world-2006` | Italy | [FIFA Italy](https://inside.fifa.com/associations/ITA) |
| `world-2010` | Spain | [FIFA Spain](https://inside.fifa.com/associations/ESP) |
| `world-2014` | Germany | [FIFA Germany](https://inside.fifa.com/associations/GER) |
| `world-2018` | France | [FIFA France](https://inside.fifa.com/associations/FRA) |
| `world-2022` | Argentina | [FIFA Argentina](https://inside.fifa.com/en/associations/ARG) |
| `women-1991` | United States | [FIFA USA](https://inside.fifa.com/associations/USA) |
| `women-1995` | Norway | [FIFA Norway](https://inside.fifa.com/en/associations/NOR) |
| `women-1999` | United States | [FIFA USA](https://inside.fifa.com/associations/USA) |
| `women-2003` | Germany | [FIFA Germany](https://inside.fifa.com/associations/GER) |
| `women-2007` | Germany | [FIFA Germany](https://inside.fifa.com/associations/GER) |
| `women-2011` | Japan | [FIFA Japan](https://inside.fifa.com/associations/jpn) |
| `women-2015` | United States | [FIFA USA](https://inside.fifa.com/associations/USA) |
| `women-2019` | United States | [FIFA USA](https://inside.fifa.com/associations/USA) |
| `women-2023` | Spain | [FIFA Spain](https://inside.fifa.com/associations/ESP) |
| `euro-1960` | Soviet Union | [UEFA 1960](https://www.uefa.com/uefaeuro/history/seasons/1960/) |
| `euro-1964` | Spain | [UEFA 1964](https://www.uefa.com/uefaeuro/history/seasons/1964/) |
| `euro-1968` | Italy | [UEFA 1968](https://www.uefa.com/uefaeuro/history/seasons/1968/) |
| `euro-1972` | West Germany | [UEFA 1972](https://www.uefa.com/uefaeuro/history/seasons/1972/) |
| `euro-1976` | Czechoslovakia | [UEFA 1976](https://www.uefa.com/uefaeuro/history/seasons/1976/); [UEFA tournament guide](https://www.uefa.com/uefaeuro/history/news/025a-0eb2be3e9998-da51342d4529-1000--euro-1976-all-you-need-to-know/) |
| `euro-1980` | West Germany | [UEFA 1980](https://www.uefa.com/uefaeuro/history/seasons/1980/) |
| `euro-1984` | France | [UEFA 1984](https://www.uefa.com/uefaeuro/history/seasons/1984/) |
| `euro-1988` | Netherlands | [UEFA 1988](https://www.uefa.com/uefaeuro/history/seasons/1988/) |
| `euro-1992` | Denmark | [UEFA 1992](https://www.uefa.com/uefaeuro/history/seasons/1992/) |
| `euro-1996` | Germany | [UEFA 1996](https://www.uefa.com/uefaeuro/history/seasons/1996/) |
| `euro-2000` | France | [UEFA 2000](https://www.uefa.com/uefaeuro/history/seasons/2000/) |
| `euro-2004` | Greece | [UEFA 2004](https://www.uefa.com/uefaeuro/history/seasons/2004/) |
| `euro-2008` | Spain | [UEFA 2008](https://www.uefa.com/uefaeuro/history/seasons/2008/) |
| `euro-2012` | Spain | [UEFA 2012](https://www.uefa.com/uefaeuro/history/seasons/2012/) |
| `euro-2016` | Portugal | [UEFA 2016](https://www.uefa.com/uefaeuro/history/seasons/2016/) |
| `euro-2020` | Italy | [UEFA 2020](https://www.uefa.com/uefaeuro/history/seasons/2020/); [UEFA final dated 11 July 2021](https://www.uefa.com/news/0259-0e8ef42865e4-5c7f552e7662-1000--full-lowdown-euro-2020-final/) |
| `euro-2024` | Spain | [UEFA 2024](https://www.uefa.com/uefaeuro/history/seasons/2024/) |

## Method and limits

- Each FIFA/UEFA result was compared with the local answer, including tournament year and men's/women's scope. Prompts explicitly name the edition. All four displayed choices were inspected for uniqueness and answer ambiguity. No additional correct displayed choice was found.
- The simple world explanations repeat the checked winner/year fact and do not add unsupported claims. Geographic hints were assessed for clarity and consistency with the answer; a separate external atlas audit of every stable capital-city clue was not performed. Historical Brazil framing was checked against a Brazilian government source and flagged above.
- All 17 UEFA edition pages were opened. The FIFA archive indexes and the association records cited above were opened and readable. Several FIFA URLs initially timed out; a timeout is a retrieval limitation, not proof of a broken public link. Norway's `/en/associations/NOR` and Japan's lowercase `/associations/jpn` were the successfully retrieved routes used in this record.
- FIFA's two champions articles produced empty extracted bodies in a direct open. Their substantive primary-source text was available in indexed web-search results and was inspected there, with the independent association-page corroboration listed above. This document does not misrepresent that as a successful full-body direct fetch of those two pages.
- IFAB `/latest/` is mutable. The rules subset was checked against the displayed **2026/27** edition, and it needs re-review when the laws edition changes. The evidence record enumerates all `rule-1` through `rule-15` IDs and all ten law URLs.
- General-knowledge repetition, topic breadth, distractor difficulty and monetization value are product judgments; verified answers alone do not establish player retention or willingness to pay. This review adds neither federation affiliation nor rights to use federation branding.
- This review did not inspect premium content, the other free categories, translations, rendering, billing, or the bundled news edition. Those require their own evidence. The combined release manifest should bind the complete reviewed bank to its final content hash after all generator corrections.

## Finalization

The generator owner applied the corrections. The regenerated `src/content/questions.json` was independently re-read on **2026-10-06**: all **31 FIFA source replacements**, all **five Brazil hint clarifications**, and all **seven changed fields across six rules questions** match this review. All 48 world IDs are present exactly once in the evidence ledger; each still has four distinct options and the correct answer exactly once. Optional country aliases were left unchanged because current world play uses multiple choice.

The reviewed **63-question subset** has SHA-256 `b56ed13ded5e289ba22eaf7de77c99bd86fd950358a19f34b1a0f8a189c29b7e`. Reproduction: select free questions with category `world` or `rules`, preserving bank order; serialize with Python `json.dumps(subset, ensure_ascii=False, sort_keys=True, separators=(',', ':'))`; hash the UTF-8 bytes. This is a subset digest, not the full-bank release digest. The full-bank manifest must separately bind all reviewed categories to the final generated bank.
