<div class="main">
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
