# bsky-shortcuts 

A browser extension for adding shortcuts to bsky.app.

## Install

[![Available from FireFox Add-ons](assets/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/bsky-shortcuts/)
[![Available in the Chrome Web Store](assets/chrome.png)](https://chrome.google.com/webstore/detail/bsky-shortcuts/cimigenihbmedhakgecdgbjgmplfjkjj/1)

## Development

### Firefox

1. Make sure your `Node.js` version is >= 16
2. Run `npm install`
3. Run `npx webpack --config webpack.config.js`
4. Visit the [firefox addon debugging page](about:debugging#/runtime/this-firefox)
    1. (or enter `about:debugging#/runtime/this-firefox` in the address bar)
5. Click `Load Temporary Add-on`, and select `bsky-shortcuts/build`

### Chrome

1. Make sure your `Node.js` version is >= 16
2. run 'npm install'
3. run `npx webpack --config webpack.config.js`
4. Visit the [chrome extensions page](chrome://extensions/)
    1. (or enter `chrome://extensions/` in the Chrome address bar)
5. Enable `Developer mode` in the top right
6. Click `Load unpacked` in the top left and select the `bsky-shortcuts/build` folder

## Shortcuts 

| Key | Action | Status      |
|-----|--------|-------------|
| J   | Move Down | Complete    |
| K   | Move Up | Complete    |
| L   | Like Post | Complete    |
| R   | Reply  | Complete    |
| T   | Repost / Quote | In Progress |
| N   | New Post | Complete    |
| Enter | Open Post | Broken[^1]  |
| /   | Focus Search | Complete |
| ?   | Show Shortcuts | In Progress |
| C   | Cycle Saved Feeds | Broken[^2]    |

[^1]: https://github.com/mattburesh/bsky-shortcuts/issues/1
[^2]: https://github.com/mattburesh/bsky-shortcuts/issues/11
