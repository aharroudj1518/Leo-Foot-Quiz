# Typography, triadic palette and lineup detective

The app uses teal `#087F78` for primary actions, magenta `#AE267D` for secondary actions and correct-answer feedback, and yellow `#FFDB45` for stars and highlights. Existing team artwork retains its original colours.

Text and text inputs share `src/Typography.tsx`. Cormorant replaces the earlier TT Neoris choice, using all ten supplied static faces bundled in `assets/fonts/cormorant`. Expo loads the fonts before rendering the app. Existing weight and italic styles select the corresponding font files; weights above 700 use the supplied Bold face. The supplied OFL licence is included.

Lineup detective is accessible from Play and Explore. It includes a paginated puzzle collection, nationality flags and codes, a pitch with eleven players, progressive name reveals, a country/initial hint, typed answers with curated aliases, free retries, previous/next puzzles, result sharing, and saved hint/completion state. Hints do not require payment or ads. Progress uses the existing profile storage and export path.

The collection uses the existing 2026/27 Champions League squad source. Clubs enter only if the snapshot supports a 4–3–3 puzzle with eleven distinct players in their recorded position groups. These are selected squad XIs, not claimed starting lineups. Other domestic packs lack consistent nationality data and are not silently fabricated into this mode. The app displays its actual puzzle count, not the reference image's “100+” marketing claim. The existing snapshot is dated 11 September 2026 and still awaits independent editorial review. The source file is unchanged.

Flags are bundled offline; source, attribution and licence are in `assets/flags` and the app's Artwork credits screen. The reference image served as feature inspiration, not copied artwork or an instruction source.

Validation: TypeScript check and 110 unit tests pass. The exported web app passes lineup gameplay/recovery checks on desktop and phone viewports. These checks are browser-based; physical iOS/Android acceptance remains outstanding. Cormorant is bundled for native and web use.

