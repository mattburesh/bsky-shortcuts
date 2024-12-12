import config from '../config/shortcuts.json';
import KeyboardShortcutManager from './keyboard-handler';
import ShortcutsModal from './shortcuts-modal';
import DOMUtils from './dom-utils';
import Logger from '../utils/logger';
import * as css from "../../assets/style.css";

class BlueSkyShortcuts {
    constructor() {
        this.currentFeedIndex = 0;
        this.feedTabs = [];
        this.currentPost = null;
        this.currentController = null;

        this.logger = new Logger();
        this.initializeExtension();
        this.shortcutsModal = new ShortcutsModal();
    }

    async initializeExtension() {
        try {
            await this.waitForAppLoad();
            this.setupShortcuts();
            this.setupFeedTabs();
        } catch (error) {
            this.logger.error('Extension initialization failed', error);
        }
    }

    async waitForAppLoad() {
        await DOMUtils.waitForElement('div[data-testid="followingFeedPage-feed-flatlist"]');
    }

    setupFeedTabs() {
        try {
            const tabContainer = document.querySelector('[data-testid="homeScreenFeedTabs"] > div > div');
            this.feedTabs = [...tabContainer.children].map(tab => ({
                element: tab,
                isActive: tab.firstChild.style.getPropertyValue('border-bottom-color') ? true : false
            }));

            this.currentFeedIndex = this.feedTabs.findIndex(tab => tab.isActive);
        } catch (error) {
            this.logger.error('Failed to initialize feed tabs', error);
        }
    }

    setupShortcuts() {
        const actionMap = {
            [config.shortcuts.nextPost]: {
                action: this.moveToNextPost.bind(this)
            },
            [config.shortcuts.previousPost]: {
                action: this.moveToPreviousPost.bind(this)
            },
            [config.shortcuts.likePost]: {
                action: this.likePost.bind(this)
            },
            [config.shortcuts.replyToPost]: {
                action: this.replyToPost.bind(this)
            },
            [config.shortcuts.cycleFeed]: {
                action: this.cycleFeed.bind(this),
                allowedModifiers: ['shift']
            },
            [config.shortcuts.openPost]: {
                action: this.openPost.bind(this)
            },
            [config.shortcuts.focusSearch]: {
                action: this.focusSearch.bind(this)
            },
            [config.shortcuts.expandPhoto]: {
                action: this.expandPhoto.bind(this)
            },
            [config.shortcuts.loadMore]: {
                action: this.loadMore.bind(this)
            },
            [config.shortcuts.showShortcuts]: {
                action: () => this.shortcutsModal.toggle(),
                allowedModifiers: ['shift']
            }
        };

        new KeyboardShortcutManager(actionMap);
    }

    moveToNextPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();

        if (!visiblePosts.length) {
            this.logger.warn('No visible posts found');
            return;
        }
        
        if (!this.currentPost) {
            this.currentPost = visiblePosts[0];
        } else {
            const currentIndex = visiblePosts.indexOf(this.currentPost);
            const nextIndex = Math.min(currentIndex + 1, visiblePosts.length - 1);
            this.currentPost = visiblePosts[nextIndex];
        }

        DOMUtils.safelyScrollIntoView(this.currentPost);
    }

    moveToPreviousPost() {
        const visiblePosts = DOMUtils.findVisiblePosts();

        if (!visiblePosts.length) {
            this.logger.warn('No visible posts found');
            return;
        }
        
        if (!this.currentPost) {
            this.currentPost = visiblePosts[visiblePosts.length - 1];
        } else {
            const currentIndex = visiblePosts.indexOf(this.currentPost);
            const previousIndex = Math.max(currentIndex - 1, 0);
            this.currentPost = visiblePosts[previousIndex];
        }

        DOMUtils.safelyScrollIntoView(this.currentPost);
    }

    likePost() {
        let like =
            this.currentPost.querySelector('[aria-label*="Like ("]') ??
            this.currentPost.querySelector('[aria-label*="Unlike ("]')
        like.click()
    }

    replyToPost() {
        let reply = this.currentPost.querySelector('[aria-label*="Reply ("]')
        reply.click()
    }

    cycleFeed(event) {
        if (this.currentController) {
            this.currentController.abort();
        }

        const direction = event.shiftKey ? -1 : 1;
        this.currentFeedIndex = (this.currentFeedIndex + direction + this.feedTabs.length) % this.feedTabs.length;
        this.feedTabs[this.currentFeedIndex].element.click();
        this.currentPost = null;
        this.waitForFeedLoad();
    }

    waitForFeedLoad() {
        const feedSelector = `[data-testid*="-feed-flatlist"]:nth-child(${this.currentFeedIndex + 1})`;
        
        this.currentController = new AbortController();

        DOMUtils.waitForElement(feedSelector, 5000, this.currentController.signal)
            .then(feed => {
                const firstPost = feed.querySelector('div[data-testid*="feedItem-by-"]');
                this.currentPost = firstPost;
            })
            .catch(error => {
                if (error !== 'cancelled') {
                    this.logger.error('Failed to load feed', error);
                }
            });
    }

    // don't know if this needs to exist, believe the shortcut exists on bsky.app
    newPost() {}

    openPost() {
        const postLinks = [...this.currentPost.querySelectorAll('a[role="link"]')];
    
        const postLink = postLinks.find(link => 
            /^https:\/\/bsky\.app\/profile\/[^/]+\/post\/[a-zA-Z0-9]+$/.test(link.href)
        );

        if (postLink) {
            postLink.click();
        } else {
            this.logger.warn('No valid post link found');
        }
    }

    expandPhoto() {
        const photoLink = this.currentPost.querySelector('img[src*="feed_thumbnail"]:not(a img)');

        if (photoLink) {
            photoLink.click();
        } else {
            this.logger.warn('No valid photo link found');
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('input[aria-label="Search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select(); // Optional: select all text for easy replacement
            return;
        }
    
        const searchAnchor = document.querySelector('a[aria-label="Search"]');
        if (searchAnchor) {
            searchAnchor.click();
            
            DOMUtils.waitForElement('input[aria-label="Search"]')
                .then(element => {
                    element.focus();
                    element.select();
                })
                .catch(error => {
                    this.logger.error('Failed to find search input', error);
                });
        }
    }

    loadMore() {
        const loadPostsButton = document.querySelector('[aria-label*="Load new posts"]') ?? null;

        if (loadPostsButton) {
            loadPostsButton.click();
            this.currentPost = null;
            this.moveToNextPost();
        }
    }
}

new BlueSkyShortcuts();