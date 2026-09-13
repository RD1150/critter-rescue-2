# Native Icon and Splash Asset Manifest

The native wrapper is configured, but the generated iOS and Android projects need final platform-sized icon and splash files before external testing. Keep those source files in the release machine’s ignored `resources/` directory; do not add binary build assets or signing material to this repository.

| Native asset | Approved source | Release-machine action |
| --- | --- | --- |
| App icon source | `https://crittergame-jtesdgpd.manus.space/manus-storage/game-logo_a4abbdba.png` | Download as `resources/icon.png`; review it at small sizes for the App Store and Play Console. |
| Splash source | A centered copy of the approved game logo on the existing deep-forest green background `#103B2A` | Save as `resources/splash.png` with generous empty space around the logo. |
| Generated platform outputs | `ios/App/App/Assets.xcassets` and `android/app/src/main/res` | Generate only after `pnpm cap:add:ios` / `pnpm cap:add:android`, then inspect and commit the non-secret generated sources. |

```bash
mkdir -p resources
curl -L 'https://crittergame-jtesdgpd.manus.space/manus-storage/game-logo_a4abbdba.png' -o resources/icon.png
# Add the reviewed, green-background splash image as resources/splash.png.
pnpm cap:assets
```

The production release owner must visually inspect the generated adaptive Android icon, iPhone/iPad icons, and splash screen on real devices. If the source logo includes small text, create a simplified icon-only crop first; an App Store or Google Play icon must remain clear at small sizes.
