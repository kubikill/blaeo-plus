# BLAEO+

A userscript for Backlog Assassins Extraordinaire that adds new features and QoL improvements to the site.

[Install](https://github.com/kubikill/blaeo-plus/releases/latest/download/blaeo-plus.user.js)  
[Support, feedback and bug reports](https://steamcommunity.com/groups/attackyourbacklog/discussions/1/7155698768546603592/)

## Features

- Filters for game library pages: filter games by their progress, tags or available modes (singleplayer/multiplayer/co-op).
- How Long to Beat integration - see how long it takes to beat your games directly within your BLAEO library pages, or go directly to the game's HLTB page
- ProtonDB integration - view ProtonDB ratings directly within your BLAEO library pages, or go directly to the game's ProtonDB page
- Steam Hardware compatibility integration - view compatibility status for Steam Deck, OS, Machine and Frame within your BLAEO library pages
- SteamHunters integration - show median time to complete for each game
- Blacklist - hide or collapse posts and/or comments from blacklisted users
- Quick rearrange lists by game name, playtime or HLTB time to beat
- HLTB list maker - automatically add games to lists by HLTB time to beat or SteamHunters median time to complete, with options to handle MP-only, endless games and games without enough time to beat reports differently
- Preview comments on posts before adding them
- Save and load post drafts, with autosaving posts on preview/leaving page
- QoL improvements - new post shortcut in header, unread messages link is now visible on mobile without having to expand the header menu, alternative post/comment layouts on mobile

## Images

![](https://i.imgur.com/lTzxMaE.png)
![](https://i.imgur.com/OW9oIg5.png)

## How to install

1. Install any extension for your browser that manages userscripts (for example, Tampermonkey or Violentmonkey)
2. Click on [Install](https://github.com/kubikill/blaeo-plus/releases/latest/download/blaeo-plus.user.js)
3. The extension will prompt you to install the userscript, install it
4. If using Tampermonkey on Chrome, Edge or other Chrome-based browsers, [give Tampermonkey permission to execute userscripts or enable your browser's developer mode](https://www.tampermonkey.net/faq.php#Q209)
5. Go to BLAEO. The userscript should take effect. You can verify that it works by clicking the dropdown by your avatar in the header and checking if the "BLAEO+ settings" is there.

## Tested on

- Firefox with Violentmonkey
- Firefox (Android) with Tampermonkey
- Chrome with Tampermonkey

## Unsupported browsers/userscript extensions

- Opera version of Tampermonkey (breaks comment preview, quick rearrange and HLTB list maker features) - Opera users are advised to install Tampermonkey from the Chrome Web Store instead

## AI disclaimer

Starting from v1.3.0-beta.1, this project uses Claude Code to assist with the development of this project.
AI is used for:

- assistance during development
- verifying code quality
- cleaning up and improving comments and code
- automated testing
- double-checking code after human review

I (kubikill) take full responsibility for any work produced by AI.
v1.2.7 is the last completely AI-free version and the BLAEO+ backend will continue to support it.
