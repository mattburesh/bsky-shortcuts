import { waitForElement } from "./util"

export class Feed {
    activeFeed = 0
    feeds

    previousPost = null
    currentPost = null
    nextPost = null

    isPostOpen = false
    previousReply = null
    currentReply = null
    nextReply = null

    feedListButtons = []
    reload = true

    constructor(postElements) {
        this.getPinnedFeeds()
        this.rebuildFeeds()
    }

    cycleFeeds() {
        console.log("cycle called...")
        // rebuild the list of feeds
        if (this.currentPost) this.currentPost.style.removeProperty("border")
        this.rebuildFeeds()
        this.currentPost = null
        this.nextPost = null
        this.previousPost = null

        // loop through the feeds, and switch to the next one
        for (let i = 0; i < this.feeds.length; i++) {
            // if we're on the last iteration, reset to the beginning
            if (this.activeFeed === this.feedListButtons.length - 1) {
                this.activeFeed = 0
                this.feedListButtons[0].click()
                this.reload = false
                break
            }

            // otherwise, increment the active feed and click the corresponding button
            if (i === this.activeFeed + 1) {
                this.activeFeed++
                this.feedListButtons[i].click()
                break
            }
        }

        this.reinitializePostValues(this.feeds[this.activeFeed])
    }

    getPinnedFeeds() {
        let feeds = []
        try {
            feeds = document.querySelector(
                '[data-testid="homeScreenFeedTabs"] > div > div'
            ).children
        } catch (e) {
            console.log("getPinnedFeeds error: " + e)
        }
        if (typeof feeds !== "undefined") {
            let feedId = 0;
            for (let item of feeds) {
                if (item.firstChild.style.getPropertyValue('border-bottom-color')) {
                    item.activetab = true
                    this.activeFeed = feedId
                } 
                this.feedListButtons.push(item)
                feedId++
            }
        }
    }

    likeToggleCurrentPost() {
        let like =
            this.currentPost.querySelector('[aria-label*="Like ("]') ??
            this.currentPost.querySelector('[aria-label*="Unlike ("]')
        like.click()
    }

    loadNewPosts() {
        let loadPostsButton =
            document.querySelector('[aria-label*="Load new posts"]') ?? null
        if (loadPostsButton) {
            loadPostsButton.click()
            this.previousPost = this.currentPost
            this.currentPost = null
            this.toggleCurrentPostHighlight()
        }
    }

    moveToNextPost() {
        if (this.currentPost !== null) {
            this.currentPost = this.currentPost.nextSibling
        } else {
            let posts = [...document.querySelectorAll('div[data-testid*="feedItem-by-"]')]
            posts = posts.filter((el) => {
                if (el.offsetParent !== null) {
                    return true
                }

                return false
            })

            console.log(posts)
            this.currentPost = posts[0].parentElement.parentElement
        }
        
        this.previousPost = this.currentPost.previousSibling ?? this.currentPost
        this.nextPost = this.currentPost.nextSibling
        this.toggleCurrentPostHighlight()
        this.currentPost.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        })
    }

    moveToPreviousPost() {
        if (!this.previousPost) return false

        this.currentPost = this.previousPost
        this.previousPost = this.currentPost.previousSibling ?? this.currentPost
        this.nextPost = this.currentPost.nextSibling
        this.toggleCurrentPostHighlight()
        this.currentPost.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        })
    }

    /**
     * Open the selected post
     *
     * The first instance of a url that matches the regex below should be the link for a given post
     *
     * Todo: Replies that show up in a feed would need to be handled differently
     */
    openCurrentPost() {
        let links = this.currentPost.querySelectorAll('a[role="link"]')

        // here's a really bad regex that should probably be fixed
        const re = /^https:\/\/bsky.app\/profile\/.*\/post\/[a-zA-Z0-9]*$/
        links.forEach((element) => {
            if (re.exec(element.href)) element.click()
        })
    }

    rebuildFeeds() {
        this.feeds = Array.from(
            document.querySelectorAll('[data-testid*="-feed-flatlist"]')
        )
    }

    quoteCurrentPost() {}

    replyToCurrentPost() {
        let reply = this.currentPost.querySelector('[aria-label*="Reply ("]')
        reply.click()
    }

    repostCurrentPost() {}

    /**
     * This is an extremely stupid solution for feed cycling
     *
     * Every time we cycle to the next feed we need to wait for it's posts to be there in order to setup the nextPost.
     * Once we get through the list one time, the mutation observer no longer sees any changes, since the posts are part
     * of the DOM. So, after the first time through all feeds don't use the mutation observer.
     * @param postElements
     */
    reinitializePostValues(postElements) {
        if (!this.reload) {
            this.previousPost = null
            this.currentPost = null
            this.nextPost = postElements.children[0].children[0]
        }
        this.waitForPosts(postElements).then((element) => {
            this.previousPost = null
            this.currentPost = null
            this.nextPost = postElements.children[0].children[0]
        })
    }

    toggleCurrentPostHighlight() {
        if (this.previousPost) this.previousPost.style.removeProperty("border")
        if (this.nextPost) this.nextPost.style.removeProperty("border")
        if (this.currentPost) this.currentPost.style.border = "2px solid blue"
    }

    waitForPosts(element, reload) {
        return new Promise((resolve) => {
            const observer = new MutationObserver((mutations) => {
                let count = 0
                for (const mutations of mutations) {
                    count++
                    if (count > 12) {
                        observer.disconnect()
                        resolve(true)
                    }
                }
            })

            let config = {
                characterData: true,
                childList: true,
                subtree: true,
            }

            observer.observe(element, config)
        })
    }
}
