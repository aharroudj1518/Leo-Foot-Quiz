# Player gallery expansion — 11 September 2026

The offline gallery now has 25 photographic player questions (previously five), including seven women and seven additional former players. The complete bank contains 1,448 questions; 34 use visual clues. Gallery rounds draw up to ten unseen questions and retain collection progress.

Twenty new Commons photographs are bundled in assets/players. manifest.json records the source page, creator, copyright licence and link, retrieval date, file hash, and visual inspection. All twenty were inspected for visible faces and answer-revealing player-name captions. This inspection is not independent factual or commercial-rights approval. asset-register.json retains review-required status for release.

The importer accepts only explicit CC BY, CC BY-SA, CC0 or public-domain metadata and verified Wikimedia image hosts. It refuses to overwrite an existing manifest. New imports must be reviewed before add-visual-content.mjs permits them into the bank. Do not run it against the reviewed collection to refresh images silently.

Cartoons remain an outstanding requirement. Previously found noncommercial/no-derivatives cartoons cannot supply the commercial collection, and the image service rejected the earlier named-player illustration request. A consistent commissioned or appropriately licensed collection is still needed. These photos do not fulfill that requirement.

Visual inspection also identified a pre-existing web portrait sizing defect that cropped faces. Explicit image dimensions now constrain images to the clue frame; the browser regression test checks image bounds.
