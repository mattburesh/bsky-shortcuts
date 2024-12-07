export default class KeyboardShortcutManager {
    constructor(actionMap) {
        this.actionMap = actionMap;
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', this.handleKeyEvent.bind(this));
    }

    handleKeyEvent(event) {
        // make sure keys like Enter aren't converted to lower case
        const key = event.key;
        const normalizedKey = /^[a-zA-Z]$/.test(key) ? key.toLowerCase() : key;

        const mapping = this.actionMap[normalizedKey];
        if (!mapping) return;

        if (this.shouldPreventShortcut(event, mapping.allowedModifiers)) return;

        event.preventDefault();
        mapping.action(event);
    }

    shouldPreventShortcut(event, allowedModifiers = []) {
        const shouldPrevent = 
            document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA' ||
            document.activeElement.role === 'textbox' ||
            (event.ctrlKey && !allowedModifiers.includes('ctrl')) || 
            (event.altKey && !allowedModifiers.includes('alt')) || 
            (event.shiftKey && !allowedModifiers.includes('shift')) ||
            (event.metaKey && !allowedModifiers.includes('meta'));

        return shouldPrevent;
    }

    getActionForKey(keyCode) {
        return this.actionMap[keyCode];
    }
}