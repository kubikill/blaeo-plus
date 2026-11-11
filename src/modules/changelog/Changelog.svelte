<div class="main">
  <h3>v1.3.0-beta.4 - November 11th, 2026</h3>
  <ul>
    <li>Optimize rendering game lists and enqueueing</li>
  </ul>
  <h3>v1.3.0-beta.3 - November 10th, 2026</h3>
  <ul>
    <li>Optimized enqueueing games to the backend for fetching data</li>
    <li>Fixed games without achievements being constantly enqueued for SteamHunters data refresh</li>
  </ul>
  <h3>v1.3.0-beta.2 - November 10th, 2026</h3>
  <ul>
    <li>Fixed filters and list pickers having broken styling on Firefox</li>
  </ul>
  <h3>v1.3.0-beta.1 - November 9th, 2026</h3>
  <ul>
    <li>
      Added SteamHunters integration
      <ul>
        <li>Game lists can now show SH median time to complete</li>
        <li>Added links to view the game on SteamHunters</li>
        <li>HLTB list maker can use SH "median time to complete" to make lists instead of the HLTB times</li>
        <li>HLTB list maker can use SH "median time to complete" as a fallback in case HLTB times aren't available (and vice versa)</li>
        <li>Quick rearrange can use SH "median time to complete" to sort games</li>
      </ul>
    </li>
    <li>
      HLTB list maker: added filtering games by lists
      <ul>
        <li>Lists can be whitelisted: only games on those lists will be used by the list maker</li>
        <li>Lists can be blacklisted: games on those lists will be ignored by the list maker</li>
        <li>If a game is on both a whitelist and blacklist, there is an option to decide which takes priority</li>
      </ul>
    </li>
    <li>
      Added game report feature
      <ul>
        <li>Can now report games that are linked to the wrong game on HLTB, or games marked as "not on HLTB" even though they actually are on HLTB</li>
        <li>Can now report games that aren't actually games (software, movies etc.) or demos/playtests</li>
      </ul>
    </li>
    <li>Added buttons to quickly add and remove games when rearranging a list</li>
    <li>Added option to ignore "A" and "The" in titles when using "Quick rearrange" in lists</li>
    <li>Added compatibility icons for SteamOS, Steam Machine and Steam Frame, as well as options to filter by their compatibility</li>
    <li>Added option to hide Steam tags for selected game progresses (completed, beaten etc.)</li>
    <li>Added filtering by Steam tags in grid view on lists</li>
    <li>Added option to select a range of games in bulk remove by shift-clicking the checkboxes</li>
    <li>Added cog icons in the settings menu next to options that have additional settings</li>
    <li>Changed the appearance of Steam tags on game pages to be more compact</li>
    <li>Updated the wording for Steam Deck compatibility strings (and fixed 4 missing)</li>
    <li>Fixed filtering RPG Steam tags - it no longer shows games with JRPG tags as well</li>
    <li>Fixed integration syncs running WAAAAY too often (embarrassingly, they used to run every 86 seconds this whole time... now they run once every 24 hours, as they should)</li>
    <li>Fixed sorting by Steam Deck status on game lists</li>
    <li>Fixed Steam tags duplicating after going back to a games page using the browser's back button</li>
    <li>Fixed several crashes across the whole script</li>
    <li>Removed "add links to ProtonDB pages" toggle in the options, as there's no real reason to toggle it off since it doesn't cost any space (the toggle was broken and didn't work anyway. kubi wtf)</li>
    <li>Significant code rewrite to simplify the codebase</li>
    <li>
      Performance improvements
      <ul>
        <li>Slightly faster loading of game lists</li>
        <li>Integration data is now downloaded on demand for games on current list, instead of downloading the whole database</li>
      </ul>
    </li>
    <li>Updated dependencies</li>
  </ul>
  <h4>AI disclaimer</h4>
  <p>Starting from v1.3.0-beta.1, this project uses Claude Code during the development of it.<br />AI is used for:</p>
  <ul>
    <li>assistance during development</li>
    <li>verifying code quality</li>
    <li>cleaning up and improving human-made comments and code</li>
    <li>automated testing</li>
    <li>double-checking code after human review</li>
  </ul>
  <p>I (kubikill) take full responsibility for any work produced by AI.</p>
  <p>v1.2.7 is the last completely AI-free version and the BLAEO+ backend will continue to support it.</p>
  <h3>v1.2.7 - November 10th, 2025</h3>
  <ul>
    <li>Fix regression from last update that caused the HLTB list maker to break</li>
  </ul>
  <h3>v1.2.6 - October 28th, 2025</h3>
  <ul>
    <li>Added "Cache" tab in BLAEO+ options to view last cache update times and buttons to force update them</li>
    <li>Fixed Steam store integration data syncing even when integration is disabled</li>
    <li>Fixed userscript breaking when invalid JSON is received during HLTB/Linux/Steam store sync</li>
  </ul>
  <h3>v1.2.5 - January 2nd, 2025</h3>
  <ul>
    <li>Fix tags not appearing due to backend changes</li>
    <li>Fix Steam tags filter not appearing if all other filters are disabled</li>
  </ul>
  <h3>v1.2.4 - January 1st, 2025</h3>
  <ul>
    <li>
      Added Steam store integration
      <ul>
        <li>Gets data about Steam tags</li>
        <li>Disabled by default; visit options to enable</li>
      </ul>
    </li>
    <li>Added Steam tags filters</li>
    <li>Fixed some breaking issues if a game had missing Steam Deck compatibility data</li>
  </ul>
  <h3>v1.2.3 - March 3rd, 2024</h3>
  <ul>
    <li>BLAEO fix: The "My games" dropdown no longer extends past the screen and is now scrollable if too large to fit on screen</li>
    <li>Fixed displaying HLTB data for games that did not have their HLTB data fetched yet</li>
    <li>Fixed HLTB list maker not working when encountering games that did not have their HLTB data fetched yet</li>
    <li>Fixed list backups tab breaking when encountering games that did not have their HLTB data fetched yet</li>
  </ul>
  <h3>v1.2.2 - January 15th, 2024</h3>
  <ul>
    <li>Added a "bulk remove missing games" feature</li>
    <li>Added "missing games" and "uncategorized games" shortcuts to the "My games" dropdown in the header</li>
    <li>Added full width game table option (disabled by default, enable it in options)</li>
    <li>Fixed achievements column being too wide on "Recently played" page when HLTB integration is enabled</li>
    <li>Fixed ProtonDB badges in list view not linking to game page on ProtonDB</li>
    <li>Endless games icon and HLTB time to beat will now fit on one line if there is enough space</li>
    <li>Performance optimizations</li>
  </ul>
  <h3>v1.2.1 - December 29th, 2023</h3>
  <ul>
    <li>
      Changes and fixes to HLTB list maker presets:
      <ul>
        <li>Added success messages when saving, loading or deleting presets</li>
        <li>Added confirmation prompt when overwriting existing presets</li>
        <li>Saving a preset without a name now autogenerates a name for it</li>
        <li>Fixed presets being overwritten while changing list maker options</li>
      </ul>
    </li>
  </ul>
  <h3>v1.2.0 - December 29th, 2023</h3>
  <ul>
    <li>
      Added option to automatically add games to lists by their HLTB times in the "Manage list" section in BLAEO settings
      <ul>
        <li>Games can be excluded by progress</li>
        <li>Games that are MP-only, endless or have no HLTB data can be ignored or added to separate lists</li>
        <li>Backups are created before submitting lists to BLAEO (can be accessed through BLAEO+ settings)</li>
        <li>Presets can be saved to be reused later</li>
      </ul>
    </li>
    <li>Endless games are now marked with an icon shown near the main time to beat field</li>
    <li>Refactored links to ProtonDB pages - now ratings link to ProtonDB and the "Add links to ProtonDB pages" option was removed since it's no longer needed</li>
    <li>Fixed some BLAEO+ styles unintentionally leaking into user posts</li>
    <li>Fixed errors sometimes caused by games missing ProtonDB and Steam Deck info if those features are enabled</li>
    <li>Fixed some missing Deck Verified status messages</li>
    <li>Fixed Deck Verified icons being clipped in grid view when ProtonDB integration is disabled</li>
    <li>Fixed wrong order of ProtonDB and Deck Verified columns in "Won on SteamGifts" and "Recently played" lists</li>
  </ul>
  <h3>v1.1.1 - September 21st, 2023</h3>
  <ul>
    <li>Fixed update notice appearing again after navigating to other pages without refreshing</li>
    <li>Fixed ProtonDB and Steam Deck Verified data being synced on each visit to BLAEO (now syncs once every 24 hours)</li>
    <li>Fixed wrong game name being used in Steam Deck Verified detail modals on list pages</li>
    <li>Fixed missing cleanup logic for HTML elements created by BLAEO+</li>
  </ul>
  <h3>v1.1.0 - September 20th, 2023</h3>
  <ul>
    <li>
      Added ProtonDB and Steam Deck Verified integration
      <ul>
        <li>Disabled by default; visit options to enable</li>
      </ul>
    </li>
    <li>Added ProtonDB rating and Steam Deck Verified status filters</li>
    <li>
      Added blacklists; can be used to collapse or completely hide posts and/or comments
      <ul>
        <li>Defaults to hiding post and comments completely; visit options to adjust</li>
      </ul>
    </li>
    <li>Added quick rearranging to rearrange game lists by name, playtime or HLTB time to beat</li>
    <li>Added update notifier</li>
    <li>Added option to show HLTB times in one column in table view</li>
    <ul>
      <li>Disabled by default; visit options to enable</li>
    </ul>
    <li>Added changelog and about tabs to the options menu</li>
    <li>Save/load post draft feature is now enabled by default on new installs</li>
    <li>Code cleanup and refactoring</li>
    <li>Updated project dependencies</li>
  </ul>
  <h3>v1.0.4 - June 21st, 2023</h3>
  <ul>
    <li>Change URL address of BLAEO+ backend due to expiration of previous domain</li>
  </ul>
  <h3>v1.0.3 - April 23rd, 2023</h3>
  <ul>
    <li>Added post saving/loading</li>
    <li>Adjustments to the options menu layout</li>
    <li>HLTB links and time to beat are now available in games list view</li>
    <li>Fix mobile post layout breaking posts on user profiles</li>
    <li>Fix duplicated elements from BLAEO+ when using browser back/return buttons</li>
    <li>Updated project dependencies</li>
  </ul>
  <h3>v1.0.2 - April 20th, 2023</h3>
  <ul>
    <li>Add alternative mobile layouts for posts and comments</li>
    <li>Replace mobile message badge with link - now messages can be accessed without having to expand the header menu</li>
    <li>Fix script sometimes being initialized twice</li>
  </ul>
  <h3>v1.0.1 - April 16th, 2023</h3>
  <ul>
    <li>Automatically send games to the backend if there is no data on them</li>
    <li>Add userscript metadata, including download/update links as well as homepage and support URL</li>
    <li>Fix HLTB sync</li>
    <li>Fix preview comments feature not working due to invalid authenticity token</li>
    <li>Fix unfinished save/load feature being enabled by default</li>
  </ul>
  <h3>v1.0.0 - April 16th, 2023</h3>
  <ul>
    <li>Initial release</li>
  </ul>
</div>
