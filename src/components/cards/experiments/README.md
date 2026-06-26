# Card Experiments

This folder is reserved for card variants that are not part of the production UI.

Production pages should import:

```js
import { SkillCard } from "../cards/SkillCard";
```

If a card variant is being tested, place it here and lazy-load it from a playground or preview route. Do not import experiment files from production pages unless the variant is intentionally promoted.

The previous oversized `SkillCard.jsx` contained many experimental variants in one production file. That file was replaced before this archive folder existed, and this workspace has no Git history, so the exact old variant source is not available to move here now.
