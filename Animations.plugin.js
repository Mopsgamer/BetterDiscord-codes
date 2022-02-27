/**
 * @name Animations
 * @version 1.2.10
 * @description This plugin is designed to animate different objects (lists, buttons, panels, etc.) with the ability to set delays, durations, types and sequences of these animations.
 * @author Mops
 * @authorLink https://github.com/Mopsgamer/
 * @authorId 538010208023347200
 * @website https://github.com/Mopsgamer/BetterDiscord-codes/tree/Animations
 * @source https://raw.githubusercontent.com/Mopsgamer/BetterDiscord-codes/Animations/Animations.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Mopsgamer/BetterDiscord-codes/Animations/Animations.plugin.js
 */

 module.exports = (() => {
    const config = {
        info: {
            name: 'Animations',
            authors: [
                {
                    name: 'Mops',
                    discord_id: '538010208023347200',
                    github_username: 'Mopsgamer',
                }
            ],
            version: '1.2.10',
            description: 'This plugin is designed to animate different objects (lists, buttons, panels, etc.) with the ability to set delays, durations, types and sequences of these animations.',
            github: 'https://github.com/Mopsgamer/Animations/blob/main/Animations.plugin.js',
            github_raw: 'https://raw.githubusercontent.com/Mopsgamer/Animations/main/Animations.plugin.js',
        },
        changelog: [
            { "title": "New Stuff", "items": ["Adding localization: Chinese, Taiwan (Thanks JimLi999!), Ukrainian."] },
            { "title": "Improvements", "type": "improved", "items": ["Reworked the tabs of the groups, now the setting will be more comfortable.", "Sliders have been replaced by input boxes."] },
            //{ "title": "Fixes", "type": "fixed", "items": ["Fixed performance issues."] }
        ],
        main: 'index.js',
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(', '); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }
        load() {
            BdApi.showConfirmationModal('Library Missing', `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: 'Download Now',
                cancelText: 'Cancel',
                onConfirm: () => {
                    require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
                        if (error) return require('electron').shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
                        await new Promise(r => require('fs').writeFile(require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

            const
                { DiscordModules, DiscordAPI, PluginUtilities, PluginUpdater, DOMTools, Modals, WebpackModules } = Api,
                { Logger, Patcher, Settings, Tooltip, ReactComponents } = Library,
                { React, ReactDOM } = BdApi;

            return class Animations extends Plugin {

                constructor() {
                    super();

                    this.defaultSettings = {
                        lists: {
                            enabled: true,
                            name: 'opacity',
                            page: 0,
                            sequence: 'fromFirst',
                            selectors: '',
                            custom: {
                                enabled: false,
                                frames: ['', '', '', ''],
                                page: 0
                            },
                            duration: 0.4,
                            delay: 0.04,
                            limit: 65
                        },
                        buttons: {
                            enabled: true,
                            name: 'opacity',
                            page: 0,
                            sequence: 'fromLast',
                            selectors: '',
                            custom: {
                                enabled: false,
                                frames: ['', '', '', ''],
                                page: 0
                            },
                            duration: 0.3,
                            delay: 0.2
                        },
                        messages: {
                            enabled: true,
                            name: 'opacity',
                            page: 0,
                            custom: {
                                enabled: false,
                                frames: ['', '', '', ''],
                                page: 0
                            },
                            duration: 0.4,
                            delay: 0.04,
                            limit: 30
                        },
                        popouts: {
                            enabled: true,
                            name: 'opacity',
                            page: 0,
                            selectors: '',
                            custom: {
                                enabled: false,
                                frames: ['', '', '', ''],
                                page: 0
                            },
                            duration: 0.5
                        }
                    }

                    this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                }

                getName() { return config.info.name }
                getAuthor() { return config.info.authors.map(a => a.name).join(', ') }
                getDescription() { return config.info.description }
                getVersion() { return config.info.version }

                colors = {
                    red: '#ed4245',
                    green: '#3ba55d',
                    yellow: '#faa81a'
                }

                static selectorsLists = [
                    /*active threads button*/
                    `.${WebpackModules.getByProps('channelName', 'icon').wrapper}`,
                    /*threads button > list*/
                    `.${WebpackModules.getByProps('container', 'bullet').container}`,
                    /*search*/
                    `.${WebpackModules.getByProps('searchResultGroup').searchResultGroup}`,
                    /*members*/
                    `.${WebpackModules.getByProps('botTag', 'member').member}:not([class*=placeholder])`,
                    /*member-groups*/
                    `h2.${WebpackModules.getByProps('membersGroup').membersGroup}`,
                    /*servers*/
                    `#app-mount .${WebpackModules.getByProps('guilds', 'sidebar').guilds} [class*="listItem"]:not([class*="listItemWrapper"])`,
                    /*friends*/
                    `.${WebpackModules.getByProps('peopleListItem').peopleListItem}`,
                    /*channels*/
                    `.${WebpackModules.getByProps('channel', 'subtext').channel}`,
                    `.${WebpackModules.getByProps('privateChannelsHeaderContainer').privateChannelsHeaderContainer}`,
                    /*discovery categories*/
                    `.${WebpackModules.getByProps('categoryItem').categoryItem}`,
                    /*discord settings list*/
                    `.${WebpackModules.getByProps('side').side} *`,
                    /*discord settings*/
                    `main.${WebpackModules.getByProps('contentColumnDefault').contentColumnDefault} > div:not(#bd-editor-panel):not(.bd-controls):not(.bd-empty-image-container):not(.bd-addon-list):not(.bd-settings-group) > div:first-child > *:not(.${WebpackModules.getByProps('image', 'desaturate').image})`,
                    `main.${WebpackModules.getByProps('contentColumnDefault').contentColumnDefault} > div:not(#bd-editor-panel):not(.bd-controls):not(.bd-empty-image-container):not(.bd-addon-list):not(.bd-settings-group) > div:not(.bd-settings-group):not(:first-child)`,
                    `main.${WebpackModules.getByProps('contentColumnDefault').contentColumnDefault} > div:not(#bd-editor-panel):not(.bd-controls):not(.bd-empty-image-container):not(.bd-addon-list):not(.bd-settings-group) > h2`,
                    `.bd-addon-card`,
                    /*alert elements*/
                    `.${WebpackModules.getByProps('focusLock').focusLock} .${WebpackModules.getByProps('scrollerBase', 'thin').scrollerBase}:not(.bd-addon-modal-settings) > div`,
                    /*public servers*/
                    `.${WebpackModules.getAllByProps('guildList', 'subtitle')[1].guildList} > .${WebpackModules.getByProps('loaded', 'card').loaded}`
                ]

                static selectorsButtons = [
                    /*chat input buttons*/
                    `.${WebpackModules.getByProps('actionButtons', 'wrapper').actionButtons} button`,
                    /*voice opened buttons*/
                    `.${WebpackModules.getByProps('buttons', 'focusRing').buttons} > *`,
                    /*toolbar*/
                    `.${WebpackModules.getByProps('toolbar', 'container').toolbar} > *`,
                    `.${WebpackModules.getByProps('toolbar', 'children').children} > *`,
                    `.${WebpackModules.getByProps('tabBar', 'peopleColumn').tabBar} > .${WebpackModules.getByProps('item', 'peopleColumn').item}`
                ]

                static selectorsPopouts = [
                    `[role="dialog"].${WebpackModules.getByProps('focusLock').focusLock} > *:not(.bd-addon-modal)`
                ]

                static names = [
                    'circle',
                    'polygon',
                    'opacity',
                    'slime',
                    'brick-right',
                    'brick-left',
                    'brick-up',
                    'brick-down',
                    'in',
                    'out',
                    'slide-right',
                    'slide-left',
                    'slide-up',
                    'slide-up-right',
                    'slide-up-left',
                    'slide-down',
                    'slide-down-right',
                    'slide-down-left',
                    'skew-right',
                    'skew-left',
                    'wide-skew-right',
                    'wide-skew-left',
                ]

                static sequences = [
                    'fromFirst',
                    'fromLast',
                ]

                static modules = {
                    Button: WebpackModules.getByProps('button', 'sizeIcon').button,
                    ButtonSizeSmall: WebpackModules.getByProps('button', 'sizeIcon').sizeSmall,
                    ButtonText: WebpackModules.getByProps('buttonText', 'giftIcon').buttonText,
                    ContentThin: WebpackModules.getByProps('content', 'thin').content,
                    ContainerDefault: WebpackModules.getByProps('containerDefault').containerDefault,
                    ContainerDefaultSpaceBeforeCategory: WebpackModules.getByProps('containerDefault', 'spaceBeforeCategory').containerDefault,
                    ContainerSpine: WebpackModules.getByProps('container', 'spine').container,
                    ChatContent: WebpackModules.getByProps('chatContent').chatContent,
                    DividerReplying: WebpackModules.getByProps('divider', 'replying').divider,
                    InputDefault: WebpackModules.getByProps('inputDefault', 'focused').inputDefault,
                    IsSending: WebpackModules.getByProps('isSending').isSending,
                    IsFailed: WebpackModules.getByProps('isFailed').isFailed,
                    Message: WebpackModules.getByProps('message').message,
                    MessageListItem: WebpackModules.getByProps('messageListItem').messageListItem,
                    Side: WebpackModules.getByProps('side').side,
                    ScrollbarDefault: WebpackModules.getByProps('scrollbarDefault').scrollbarDefault,
                    TextArea: WebpackModules.getByProps('textArea').textArea,
                    Offline: WebpackModules.getByProps('offline').offline,
                    GuildsSidebar: WebpackModules.getByProps('guilds', 'sidebar').guilds,
                    WrapperTypeThread: WebpackModules.getByProps('wrapper', 'typeThread').wrapper,
                    VideoLead: WebpackModules.getByProps('video', 'lead').video
                }

                get countStyles() {
                    let result = '';

                    ;((this.isValidSelector(this.settings.lists.selectors)&&this.settings.lists.selectors.trim()!='')?this.settings.lists.selectors.split(",").map(item => item.trim()):Animations.selectorsLists)
                    .forEach((selector, i) => { if(!this.settings.lists.enabled) return;

                        let count = this.settings.lists.limit;

                        if (this.settings.lists.sequence == 'fromFirst') for (var i = 1; i < count + 1; i++) {
                            result += `${selector}:nth-child(${i}) `
                                + `{animation-delay: ${((i - 1) * this.settings.lists.delay).toFixed(2)}s}\n\n`
                        }
                        if (this.settings.lists.sequence == 'fromLast') for (var i = 1; i < count + 1; i++) {
                            result += `${selector}:nth-last-child(${i}) `
                                + `{animation-delay: ${((i - 1) * this.settings.lists.delay).toFixed(2)}s}\n\n`
                        }
                    
                    })

                    ;((this.isValidSelector(this.settings.buttons.selectors)&&this.settings.buttons.selectors.trim()!='')?this.settings.buttons.selectors.split(",").map(item => item.trim()):Animations.selectorsButtons)
                    .forEach(selector => { if(!this.settings.buttons.enabled) return;

                        let count = 20;

                        if (this.settings.buttons.sequence == 'fromFirst') for (var i = 1; i < count + 1; i++) {
                            result += `${selector}:nth-child(${i}) `
                                + `{animation-delay: ${((i - 1) * this.settings.buttons.delay).toFixed(2)}s}\n\n`
                        }
                        if (this.settings.buttons.sequence == 'fromLast') for (var i = 1; i < count + 1; i++) {
                            result += `${selector}:nth-last-child(${i}) `
                                + `{animation-delay: ${((i - 1) * this.settings.buttons.delay).toFixed(2)}s}\n\n`
                        }

                    })

                    return result;

                }



                threadsWithChannels = (removeAnimations = false) => {

                        if (!this.settings.lists.enabled) return;
                        var channelsListElements = document.querySelectorAll(`#channels .${Animations.modules.ContentThin} > [class]`);
                        var count = document.querySelectorAll(`#channels .${Animations.modules.ContentThin} > [class]`)?.length ?? 40;

                        for (var i = 0, threadsCount = 0; i < count; i++) {
                            let children = channelsListElements[(this.settings.lists.sequence == "fromFirst" ? i : count - i - 1)];
                            if (!children) return;

                            if (children.classList.contains(Animations.modules.ContainerDefault)
                                || children.classList.contains(Animations.modules.ContainerDefaultSpaceBeforeCategory)
                                || children.classList.contains(Animations.modules.WrapperTypeThread)
                            ) {
                                if (removeAnimations) {
                                    children.style.transform = 'none'
                                }
                                else {
                                    children.style.animationDelay = `${((i + threadsCount) * this.settings.lists.delay).toFixed(2)}s`;
                                    children.style.animationName = this.settings.lists.custom.enabled &&
                                        this.settings.lists.custom.frames[this.settings.lists.custom.page].trim() != '' &&
                                        this.isValidCSS(this.settings.lists.custom.frames[this.settings.lists.custom.page])
                                        ? 'custom-lists' : this.settings.lists.name;
                                }
                            }

                            else if (children.classList.contains(Animations.modules.ContainerSpine)) {
                                var threadsForkElement = children.querySelector(`.${Animations.modules.ContainerSpine} > svg`);
                                var threadsListElements = children.querySelectorAll(`.${Animations.modules.ContainerDefault}`);

                                threadsForkElement.style.animationDelay = `${((i + threadsCount) * this.settings.lists.delay).toFixed(2)}s`;
                                threadsForkElement.style.animationName = 'slide-right';

                                for (var j = 0; j < threadsListElements.length; j++) {
                                    threadsCount += (j ? 1 : 0);
                                    let thread = threadsListElements[(this.settings.lists.sequence == "fromFirst" ? j : threadsListElements.length - j - 1)];
                                    if (removeAnimations) {
                                        thread.style.transform = 'none'
                                    }
                                    else {
                                        thread.style.animationDelay = `${((i + threadsCount) * this.settings.lists.delay).toFixed(2)}s`;
                                        thread.style.animationName = this.settings.lists.custom.enabled && this.settings.lists.custom.frames[this.settings.lists.custom.page].trim() != '' ? 'custom-lists' : this.settings.lists.name;
                                    }
                                }
                            }

                        }
                }

                async changeStyles(delay=0) {
                    var createKeyFrame = function(name, originalName, rotate=0, opacity=1) {
                        var keyframes = {
                            "in":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1.3) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "out":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(0.7) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "opacity":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "slime":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                25% {
                                    transform-origin: 50%;
                                    transform: scale(1.3, 0.7) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                50% {
                                    transform-origin: 50%;
                                    transform: scale(0.8, 1.2) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                75% {
                                    transform-origin: 50%;
                                    transform: scale(1.1, 0.9) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "polygon":
                            `@keyframes ${name} {
                                0% {
                                    clip-path:  polygon(40% 40%, 50% 25%, 60% 40%, 75% 50%, 60% 60%, 50% 75%, 40% 60%, 25% 50%);
                                    transform: rotate(${rotate}deg);
                                }
                                99% {
                                    clip-path: polygon(0 0, 50% 0, 100% 0, 100% 50%, 100% 100%, 50% 100%, 0 100%, 0 50%);
                                    transform: rotate(${rotate}deg);
                                }
                                100% {
                                    transform: rotate(${rotate}deg);
                                }
                            }`,
                            "circle":
                            `@keyframes ${name} {
                                0% {
                                    clip-path: circle(25%);
                                    transform: rotate(${rotate}deg);
                                }
                                99% {
                                    clip-path: circle(100%);
                                    transform: rotate(${rotate}deg);
                                }
                                100% {
                                    transform: rotate(${rotate}deg);
                                }
                            }`,
                            "brick-up":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 500%) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "brick-right":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(-500%, 0) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "brick-left":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(500%, 0) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "brick-down":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, -500%) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: scale(1) translate(0, 0) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "slide-right":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 0% 50%;
                                    transform: scaleX(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'0% 50%':'50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                            "slide-left":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 100% 50%;
                                    transform: scaleX(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'100% 50%':'50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                            "slide-up":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50% 100%;
                                    transform: scaleY(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'50% 100%':'50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                            "slide-down":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50% 0%;
                                    transform: scaleY(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'50% 0%':'50%'};
                                    transform: scale(1) translate(0) rotate(${rotate}deg);
                                }
                            }`,
                            "slide-up-right":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 0% 100%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'0% 100%':'50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                            "slide-up-left":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 100%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'100%':'50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                            "slide-down-right":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 0%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'0%':'50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                            "slide-down-left":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 100% 0%;
                                    transform: scale(0) rotate(${rotate}deg);
                                }
                                100% {
                                    transform-origin: ${rotate!=90?'100% 0%':'50%'};
                                    transform: scale(1) rotate(${rotate}deg) translate(0);
                                }
                            }`,
                            "skew-right":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewX(-30deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skewX(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "skew-left":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewX(30deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skewX(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "wide-skew-right":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewY(15deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skew(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`,
                            "wide-skew-left":
                            `@keyframes ${name} {
                                0% {
                                    transform-origin: 50%;
                                    transform: skewY(-15deg) scale(1) rotate(${rotate}deg);
                                    opacity: 0;
                                }
                                100% {
                                    transform-origin: 50%;
                                    transform: skew(0) scale(1) rotate(${rotate}deg);
                                    opacity: ${opacity};
                                }
                            }`
                        }

                        return keyframes[originalName]
                        
                    }

                    var keyframes = (()=>{
                        var result = '';

                        Animations.names.forEach(
                            animName=>{
                                result+=`
                                ${createKeyFrame(animName, animName, 0)}\n
                                ${createKeyFrame(`${animName}_offline`, animName, 0, 0.3)}\n
                                ${createKeyFrame(`${animName}_90`, animName, 90)}\n
                                `
                            }
                        )

                        return result
                    })()

                    let animPrevStyles = (() => {
                        let result = '';

                        ;(["lists", "buttons", "messages", "popouts"]).forEach(type=>{
                            if (!Animations.names.includes(this.settings[type].name)) {
                                this.settings[type].name = this.defaultSettings[type].name;
                                PluginUtilities.saveSettings(this.getName(), this.settings);
                            }
                        });

                        ;(["lists", "buttons"]).forEach(type=>{
                            if (!Animations.sequences.includes(this.settings[type].sequence)) {
                                this.settings[type].sequence = this.defaultSettings[type].sequence;
                                PluginUtilities.saveSettings(this.getName(), this.settings);
                            }
                        });

                        Animations.names.forEach(animName => {
                            for (var i = 1; i < 5; i++) {
                                result += `.animPreview[data-animation="${animName}"]:hover > .animPreviewTempsContainer > .animTempBlock:nth-child(${i})`
                                    + ` {
                                        transform: scale(0); animation-name: ${animName};
                                        animation-fill-mode: forwards;
                                        animation-duration: 0.3s;
                                        animation-delay: ${(i - 1) * 0.06}s;
                                    }\n`
                            }
                        })

                        return result;
                    })()

                    let nthStyles = (() => {
                        let result = '';

                        result += `.animPreview:hover .animTempBlock {animation-name: out; animation-duration: 0.3s;}\n\n`;
                        for (var i = 1; i < 4+1+1; i++) {
                            result += `[data-animation="fromFirst"] .animTempBlock:nth-child(${i})
                            {animation-delay:${((i - 1) * 0.06).toFixed(2)}s}\n\n`
                        }
                        for (var i = 1; i < 4+1+1; i++) {
                            result += `[data-animation="fromLast"] .animTempBlock:nth-last-child(${i})
                            {animation-delay:${((i - 1) * 0.06).toFixed(2)}s}\n\n`
                        }

                        for (var i = 1; i < this.settings.messages.limit; i++) {
                            result += `.${Animations.modules.MessageListItem}:nth-last-child(${i}) > .${Animations.modules.Message}
                            {animation-delay:${((i - 1) * this.settings.messages.delay).toFixed(2)}s}\n`
                        }

                        return result;
                    })()

                    this.styles = `
                /*lists limit*/
                .${Animations.modules.Side} > :nth-child(n+${this.settings.lists.limit}),
                .${Animations.modules.ContentThin} > :nth-child(n+${this.settings.lists.limit})
                {animation: none !important; transform: none !important}

                ${!this.settings.lists.enabled ? '' : `
                /* wawes */
                /*channels*/
                .${Animations.modules.ContainerDefaultSpaceBeforeCategory},
                .${Animations.modules.ContainerDefault}
                {
                    transform: scaleX(0);
                    animation-fill-mode: forwards;
                    animation-duration: ${this.settings.lists.duration}s;
                }

                /* members offline */
                .${Animations.modules.Offline}
                {
                    animation-name: ${this.settings.lists.name}_offline !important;
                }

                ${this.settings.lists.selectors?this.settings.lists.selectors:Animations.selectorsLists.join(', ')}
                {
                    transform: scaleX(0);
                    animation-name: ${this.settings.lists.custom.enabled &&
                                    this.settings.lists.custom.frames[this.settings.lists.custom.page].trim() != '' &&
                                    this.isValidCSS(this.settings.lists.custom.frames[this.settings.lists.custom.page])
                                    ? 'custom-lists' : this.settings.lists.name};
                    animation-fill-mode: forwards;
                    animation-duration: ${this.settings.lists.duration}s;
                }

                ${!BdApi.Themes.isEnabled('Horizontal Server List')? '' : `
                #app-mount .${Animations.modules.GuildsSidebar} [class*=listItem]:not([class*=listItemWrapper]) {
                    transform: scaleX(0) rotate(90deg);
                    animation-name: ${this.settings.lists.name}_90;
                }
                `}
                `}

                ${!this.settings.buttons.enabled ? '' : `
                ${this.settings.buttons.selectors?this.settings.buttons.selectors:Animations.selectorsButtons.join(', ')}
                {
                    transform: scaleX(0);
                    animation-name: ${this.settings.buttons.custom.enabled &&
                                    this.settings.buttons.custom.frames[this.settings.buttons.custom.page].trim() != '' &&
                                    this.isValidCSS(this.settings.buttons.custom.frames[this.settings.buttons.custom.page])
                                    ? 'custom-buttons' : this.settings.buttons.name};
                    animation-fill-mode: forwards;
                    animation-duration: ${this.settings.buttons.duration}s;
                }
                `}

                ${!this.settings.popouts.enabled ? '' : `
                ${this.settings.popouts.selectors?this.settings.popouts.selectors:Animations.selectorsPopouts.join(', ')}
                {
                    transform: scaleX(0);
                    animation-name: ${this.settings.popouts.custom.enabled &&
                                    this.settings.popouts.custom.frames[this.settings.popouts.custom.page].trim() != '' &&
                                    this.isValidCSS(this.settings.popouts.custom.frames[this.settings.popouts.custom.page])
                                    ? 'custom-popouts' : this.settings.popouts.name};
                    animation-duration: ${this.settings.popouts.duration}s;
                }
                `}

                ${!this.settings.messages.enabled ? '' : `
                /* messages */
                .${Animations.modules.MessageListItem} > .${Animations.modules.Message}
                {
                    transform: scale(0);
                    animation-fill-mode: forwards;
                    animation-name: ${this.settings.messages.custom.enabled &&
                                    this.settings.messages.custom.frames[this.settings.messages.custom.page].trim() != '' &&
                                    this.isValidCSS(this.settings.messages.custom.frames[this.settings.messages.custom.page])
                                    ? 'custom-messages' : this.settings.messages.name};
                    animation-duration: ${this.settings.messages.duration}s;
                }

                /*lines-forward-messages fix*/
                .${Animations.modules.DividerReplying} {z-index: 0}
                `}

                /**Non-custom**/

                /*threads fork*/
                .${Animations.modules.ContainerSpine} > svg {
                    transform: scale(0);
                    transform-oringin: 100% 50%;
                    animation-timing-function: linear;
                    animation-duration: ${this.settings.lists.duration}s;
                    animation-fill-mode: forwards;
                }

                /*discord changelog video*/
                .${Animations.modules.VideoLead} {
                    animation-name: out !important;
                }

                /**Keyframes**/

                ${keyframes}

                \n${animPrevStyles}
                \n${nthStyles}

                /*Custom keyframes*/
                
                @keyframes custom-lists {
                    ${this.settings.lists.custom.frames[this.settings.lists.custom.page]}
                }

                @keyframes custom-buttons {
                    ${this.settings.buttons.custom.frames[this.settings.buttons.custom.page]}
                }

                @keyframes custom-messages {
                    ${this.settings.messages.custom.frames[this.settings.messages.custom.page]}
                }

                @keyframes custom-popouts {
                    ${this.settings.popouts.custom.frames[this.settings.popouts.custom.page]}
                }
                    `;

                    PluginUtilities.removeStyle('Animations-main');
                    PluginUtilities.removeStyle('Animations-count');

                    await this.wait(delay)
                    
                    PluginUtilities.addStyle('Animations-main', this.styles);
                    PluginUtilities.addStyle('Animations-count', this.countStyles);
                    this.threadsWithChannels();
                }

                closeSettings() {
                    document.querySelector('.bd-addon-modal-footer > .bd-button')?.click()
                }

                wait(ms) {
                    return new Promise((rs, rj)=>setTimeout(rs, ms))
                }

                isValidCSS(text){
                    if(text.trim()=='') return false;
                    var id = 'CSSValidChecker';
                    var css = `@keyframes KEYFRAME_VALIDATOR {\n${text}\n}`
                    BdApi.injectCSS(id, css)
                    var isValid = document.querySelector("head > bd-head > bd-styles > #" + id).sheet.rules[0]?.cssText.replace(/;| |\n/g, "") === css.replace(/;| |\n/g, "")
                    BdApi.clearCSS(id)
                    return isValid
                }

                isValidSelector(text) {
                    try{
                        document.querySelectorAll(text)
                    } catch {return false}
                    return true
                }

                getSettingsPanel() {

                    switch(DiscordModules.UserSettingsStore.locale) {

                        //This is for translating the plugin (I won't do that, of course, a hundred labels) (possibly)

                        // case '*your language code*':
                        //     var TEMPS = *...copy from the bottom and translate*
                        // break;

                        case 'fr':
                            var TEMPS = {
                                TOOLTIPS: {
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Dernier changement',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: 'Rechercher des mises à jour',
                                    BUTTON_ANIMATIONS_RESET: 'Réinitialise tous les paramètres',
                                    BUTTON_ANIMATIONS_REBUILD: 'Récrer les styles. Quand le plugin sera redémarré, les styles seront recrées',
                                    BUTTON_ANIMATIONS_ISSUES: 'Lien vers GitHub',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: 'Lien vers GitHub',
                                    BUTTON_LISTS_SWITCH: 'Activer/désactiver l\'animation des listes',
                                    BUTTON_BUTTONS_SWITCH: 'Activer/désactiver l\'animation des boutons',
                                    BUTTON_MESSAGES_SWITCH: 'Activer/désactiver l\'animation des messages',                                
                                    BUTTON_POPOUTS_SWITCH: 'Activer/désactiver l\'animation des pop-out',                                
                                    BUTTON_RESET_LISTS: 'Réinitialise les paramètres de listes',
                                    BUTTON_RESET_BUTTONS: 'Réinitialise les paramètres de boutons',
                                    BUTTON_RESET_MESSAGES: 'Réinitialise les paramètres de messages',
                                    BUTTON_RESET_POPOUTS: 'Réinitialise les paramètres de pop-out',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: 'Restore les selecteurs par défauts',
                                    BUTTON_SELECTORS_LISTS_CLEAR: 'Vider le champs de texte',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: 'Restore les selecteurs par défauts',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: 'Vider le champs de texte',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: 'Restore les selecteurs par défauts',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: 'Vider le champs de texte'
                                },
                                LABELS: {
                                    BUTTON_ANIMATIONS_RESET: 'Tout réinitialiser',
                                    BUTTON_ANIMATIONS_RESET_RESETING: 'Réinitialisation...',
                                    BUTTON_ANIMATIONS_REBUILD: 'Récréation des animations',
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Changelog',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: 'Mise à jour',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_SEARCHING: 'Recherche de mise à jour...',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_TIMEOUT: 'Temps de recherche excéder',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_ERROR: 'Une erreur est apparue',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_OLDER: (version_='{version}')=>`v${version_} - Mise à jour`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_TITLE: 'Votre version est obsolète',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (toi)  →  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_NOTE: 'Le plugin va être mis à jour.',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_NEWER: (version_='{version}')=>`v${version_} - Votre version`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_TITLE: 'Votre version est la plus récente',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (toi)  ←  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_NOTE: 'Votre version est la plus récente.',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_LATEST: (version_='{version}')=>`v${version_} - Dernière version`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_TITLE: 'Votre version est la plus récente',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_COMPARE: (yourV_, githubV_)=>`v${yourV_} (toi)  ↔  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_NOTE: 'Le plugin va être restoré.',
                                    BUTTON_ANIMATIONS_ISSUES: 'Problème',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: 'Discussions',
                                    BUTTON_LISTS_SWITCH: 'Listes',
                                    BUTTON_BUTTONS_SWITCH: 'Boutons',
                                    BUTTON_MESSAGES_SWITCH: 'Messages',
                                    BUTTON_POPOUTS_SWITCH: 'Popouts',
                                    BUTTON_RESET_LISTS: 'Réinitialiser listes',
                                    BUTTON_RESET_BUTTONS: 'Réinitialiser boutons',
                                    BUTTON_RESET_MESSAGES: 'Réinitialiser messages',
                                    BUTTON_RESET_POPOUTS: 'Réinitialiser popouts',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: 'Par défaut',
                                    BUTTON_SELECTORS_LISTS_CLEAR: 'Vider',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: 'Par défaut',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: 'Vider',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: 'Par défaut',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: 'Vider',

                                    FIELD_NAME: 'Nom',
                                    FIELD_SEQUENCE: 'Séquence',
                                    FIELD_DELAY: 'Delai',
                                    FIELD_LIMIT: 'Limite',
                                    FIELD_DURATION: 'Durée',

                                    FIELD_LISTS_NAME_NOTE: (default_='{default}')=>`[${default_}] L'animation à utiliser pour l'animation des éléments d'une liste.`,
                                    FIELD_LISTS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] La séquence de comment se créer les éléments d'une liste.`,
                                    FIELD_LISTS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Le délai avant l'apparition de chaque éléments d'une liste en seconde.`,
                                    FIELD_LISTS_LIMIT_NOTE: (default_='{default}')=>`[${default_}] Le nombre maximum d'élément d'une liste qui seront animé.`,
                                    FIELD_LISTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] La durée de l'animation de chaque éléments d'une liste.`,

                                    FIELD_BUTTONS_NAME_NOTE: (default_='{default}')=>`[${default_}] L'animation à utiliser pour l'animation des boutons.`,
                                    FIELD_BUTTONS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] La séquence de comment se créer les boutons.`,
                                    FIELD_BUTTONS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Le délai avant l'apparition de chaque boutons en seconde.`,
                                    FIELD_BUTTONS_DURATION_NOTE: (default_='{default}')=>`[${default_}] La durée de l'animation de chaque boutons.`,

                                    FIELD_MESSAGES_NAME_NOTE: (default_='{default}')=>`[${default_}] L'animation à utiliser pour l'animation des messages.`,
                                    FIELD_MESSAGES_DELAY_NOTE: (default_='{default}')=>`[${default_}] La séquence de comment se créer les messages.`,
                                    FIELD_MESSAGES_LIMIT_NOTE: (default_='{default}')=>`[${default_}] Le délai avant l'apparition de chaque messages en seconde.`,
                                    FIELD_MESSAGES_DURATION_NOTE: (default_='{default}')=>`[${default_}] La durée de l'animation de chaque messages.`,

                                    FIELD_POPOUTS_NAME_NOTE: (default_='{default}')=>`[${default_}] L'animation à utiliser pour l'animation des popout.`,
                                    FIELD_POPOUTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] La durée de l'animation de chaque popout.`,

                                    FIELD_LISTS_SELECTORS: 'Selecteurs de listes',
                                    FIELD_LISTS_SELECTORS_NOTE: 'Si vous laissez le champ vide, les selecteurs par défaut réapparaitrons au redémarrage. Les changement de selecteurs sont sauvegardé dès l\'écriture (si le code est valide). Le séparateur est une virgule (,).',
                                    FIELD_BUTTONS_SELECTORS: 'Selecteurs de boutons',
                                    FIELD_BUTTONS_SELECTORS_NOTE: 'Si vous laissez le champ vide, les selecteurs par défaut réapparaitrons au redémarrage. Les changement de selecteurs sont sauvegardé dès l\'écriture (si le code est valide). Le séparateur est une virgule (,).',
                                    FIELD_POPOUTS_SELECTORS: 'Selecteurs de popout',
                                    FIELD_POPOUTS_SELECTORS_NOTE: 'Si vous laissez le champ vide, les selecteurs par défaut réapparaitrons au redémarrage. Les changement de selecteurs sont sauvegardé dès l\'écriture (si le code est valide). Le séparateur est une virgule (,).',

                                    PREVIEW_SELECTING: 'Selection',
                                    PREVIEW_EDITING: 'Edition',
                                    PREVIEW_BUTTON_TEMPLATE: 'Modèle',
                                    PREVIEW_BUTTON_CLEAR: 'Vider',
                                    PREVIEW_BUTTON_LOAD: 'Charger',
                                    PREVIEW_BUTTON_SAVE: 'Sauvegarder',
                                    PREVIEW_PLACEHOLDER_HINT: 'L\'élément animé a "scale(0)" dans sa transformation,\n donc votre transmation doit contenir "scale(1)" dans la dernière étape(100%).',
                                    PREVIEW_IN: 'Dessus',
                                    PREVIEW_OUT: 'Dessous',
                                    PREVIEW_CIRCLE: 'Cercle',
                                    PREVIEW_POLYGON: 'Polygone',
                                    PREVIEW_OPACITY: 'Opacité',
                                    PREVIEW_SLIME: 'Slime',
                                    PREVIEW_BRICK_RIGHT: 'Brique droite',
                                    PREVIEW_BRICK_LEFT: 'Brique gauche',
                                    PREVIEW_BRICK_UP: 'Brick du dessus',
                                    PREVIEW_BRICK_DOWN: 'Brick du dessous',
                                    PREVIEW_SLIDE_RIGHT: 'Glissade droite',
                                    PREVIEW_SLIDE_LEFT: 'Glissade gauche',
                                    PREVIEW_SLIDE_UP: 'Glissade du dessus',
                                    PREVIEW_SLIDE_DOWN: 'Glissade du dessous',
                                    PREVIEW_SLIDE_UP_RIGHT: 'Glissade dessus (droite)',
                                    PREVIEW_SLIDE_UP_LEFT: 'Glissade dessus (gauche)',
                                    PREVIEW_SLIDE_DOWN_RIGHT: 'Glissade dessous (droite)',
                                    PREVIEW_SLIDE_DOWN_LEFT: 'Glissade dessous (gauche)',
                                    PREVIEW_SKEW_RIGHT: 'Inclinaison droite',
                                    PREVIEW_SKEW_LEFT: 'Inclinaison gauche',
                                    PREVIEW_WIDE_SKEW_RIGHT: 'Grande Inclinaison droite',
                                    PREVIEW_WIDE_SKEW_LEFT: 'Grande Inclinaison gauche',

                                    PREVIEW_VERTICAL_FROM_FIRST: '↓',
                                    PREVIEW_VERTICAL_FROM_LAST: '↑',
                                    PREVIEW_HORIZONTAL_FROM_FIRST: '→',
                                    PREVIEW_HORIZONTAL_FROM_LAST: '←',

                                    GROUP_LISTS: 'Listes',
                                    GROUP_BUTTONS: 'Boutons',
                                    GROUP_MESSAGES: 'Messages',
                                    GROUP_POPOUTS: 'Popout',
                                    
                                    GROUP_ADVANCED: 'Avancés',
                                }
                            }
                        break;

                        case 'uk':
                            var TEMPS = {
                                TOOLTIPS: {
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Останні зміни',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: 'Перевіряє оновлення',
                                    BUTTON_ANIMATIONS_RESET: 'Скидає усі налаштування',
                                    BUTTON_ANIMATIONS_REBUILD: 'Перестворює стилі. При перезавантаженні плагіну стилі також перестворюються',
                                    BUTTON_ANIMATIONS_ISSUES: 'Посилання на GitHub',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: 'Посилання на GitHub',
                                    BUTTON_LISTS_SWITCH: 'Перемикання списків',
                                    BUTTON_BUTTONS_SWITCH: 'Перемикання кнопок',
                                    BUTTON_MESSAGES_SWITCH: 'Перемикання повідомлень',                                
                                    BUTTON_POPOUTS_SWITCH: 'Перемикання вспливаючих вікон',                                
                                    BUTTON_RESET_LISTS: 'Скидає налаштування списків',
                                    BUTTON_RESET_BUTTONS: 'Скидає налаштування кнопок',
                                    BUTTON_RESET_MESSAGES: 'Скидає налаштування повідомлень',
                                    BUTTON_RESET_POPOUTS: 'Скидає налаштування вспливаючих вікон',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: 'Відновлює заводські селектори',
                                    BUTTON_SELECTORS_LISTS_CLEAR: 'Очищає тектове поле',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: 'Відновлює заводські селектори',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: 'Очищає тектове поле',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: 'Відновлює заводські селектори',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: 'Очищає тектове поле'
                                },
                                LABELS: {
                                    BUTTON_ANIMATIONS_RESET: 'Скинути все',
                                    BUTTON_ANIMATIONS_RESET_RESETING: 'Скидання...',
                                    BUTTON_ANIMATIONS_REBUILD: 'Перестворити анімації',
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Список змін',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: 'Оновити',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_SEARCHING: 'Пошук оновлень...',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_TIMEOUT: 'Перевищено час очікування',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_ERROR: 'Сталася помилка',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_OLDER: (version_='{version}')=>`v${version_} - Оновити`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_TITLE: 'Ваша версія застаріла',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (ваша)  →  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_NOTE: 'Плагін буде оновлено',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_NEWER: (version_='{version}')=>`v${version_} - Ваша версія`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_TITLE: 'Ваша версія новіша',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (ваша)  ←  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_NOTE: 'Плагін буде деоновлений.',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_LATEST: (version_='{version}')=>`v${version_} - Остання версія`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_TITLE: 'Ваша версія остання',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_COMPARE: (yourV_, githubV_)=>`v${yourV_} (ваша)  ↔  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_NOTE: 'Плагін буде перевстановлено.',
                                    BUTTON_ANIMATIONS_ISSUES: 'Проблеми',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: 'Обговорення',
                                    BUTTON_LISTS_SWITCH: 'Списки',
                                    BUTTON_BUTTONS_SWITCH: 'Кнопки',
                                    BUTTON_MESSAGES_SWITCH: 'Повідомлення',
                                    BUTTON_POPOUTS_SWITCH: 'Вспл. вікна',
                                    BUTTON_RESET_LISTS: 'Скинути списки',
                                    BUTTON_RESET_BUTTONS: 'Скинути кнопки',
                                    BUTTON_RESET_MESSAGES: 'Скинути повідомлення',
                                    BUTTON_RESET_POPOUTS: 'Скинути вспл. вікна',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: 'За замовчуванням',
                                    BUTTON_SELECTORS_LISTS_CLEAR: 'Очистити',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: 'За замовчуванням',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: 'Очистити',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: 'За замовчуванням',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: 'Очистити',
    
                                    FIELD_NAME: 'Назва',
                                    FIELD_SEQUENCE: 'Напрямок',
                                    FIELD_DELAY: 'Затримка',
                                    FIELD_LIMIT: 'Ліміт',
                                    FIELD_DURATION: 'Тривалість',
    
                                    FIELD_LISTS_NAME_NOTE: (default_='{default}')=>`[${default_}] Назва анимації елементів списку при їх появі.`,
                                    FIELD_LISTS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] Напрямок в якому вибудовуватимуться елементи списку.`,
                                    FIELD_LISTS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Затримка перед появою кожного елемента списку в секундах.`,
                                    FIELD_LISTS_LIMIT_NOTE: (default_='{default}')=>`[${default_}] Максимальна кількість елементів у списку, для яких відтворюватиметься анімація.`,
                                    FIELD_LISTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Швидкість відтворення анімації в секундах для кожного списку після затримки.`,
    
                                    FIELD_BUTTONS_NAME_NOTE: (default_='{default}')=>`[${default_}] Назва анімації кнопок при їх появі.`,
                                    FIELD_BUTTONS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] Послідовність, у якій вибудовуються кнопки.`,
                                    FIELD_BUTTONS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Затримка перед появою кожної кнопки в секундах.`,
                                    FIELD_BUTTONS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Швидкість відтворення анімації в секундах для кожної кнопки після затримки.`,
    
                                    FIELD_MESSAGES_NAME_NOTE: (default_='{default}')=>`[${default_}] Назва анімації повідомлень при їх появі.`,
                                    FIELD_MESSAGES_DELAY_NOTE: (default_='{default}')=>`[${default_}] Затримка перед появою кожного повідомлення в секундах.`,
                                    FIELD_MESSAGES_LIMIT_NOTE: (default_='{default}')=>`[${default_}] Максимальна кількість повідомлень у списку, для яких відтворюватиметься анімація.`,
                                    FIELD_MESSAGES_DURATION_NOTE: (default_='{default}')=>`[${default_}] Швидкість відтворення анімації в секундах для кожного повідомлення після затримки.`,
    
                                    FIELD_POPOUTS_NAME_NOTE: (default_='{default}')=>`[${default_}] Назва анімації вспливаючих вікон при їх появі.`,
                                    FIELD_POPOUTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Швидкість відтворення анімації в секундах для вспливаючих вікон.`,
    
                                    FIELD_LISTS_SELECTORS: 'Селектори списків',
                                    FIELD_LISTS_SELECTORS_NOTE: 'Якщо залишити це поле порожнім, при перезавантаженні тут відображатимуться селектори за замовчуванням. Зміни селекторів зберігаються під час введення (якщо код коректний). Розділювачем є кома (,).',
                                    FIELD_BUTTONS_SELECTORS: 'Селектори кнопок',
                                    FIELD_BUTTONS_SELECTORS_NOTE: 'Якщо залишити це поле порожнім, при перезавантаженні тут відображатимуться селектори за замовчуванням. Зміни селекторів зберігаються під час введення (якщо код коректний). Розділювачем є кома (,).',
                                    FIELD_POPOUTS_SELECTORS: 'Селектори вспливаючих вікон',
                                    FIELD_POPOUTS_SELECTORS_NOTE: 'Якщо залишити це поле порожнім, при перезавантаженні тут відображатимуться селектори за замовчуванням. Зміни селекторів зберігаються під час введення (якщо код коректний). Розділювачем є кома (,).',
                                    PREVIEW_SELECTING: 'Обирати',
                                    PREVIEW_EDITING: 'Редагувати',
                                    PREVIEW_BUTTON_TEMPLATE: 'Шаблон',
                                    PREVIEW_BUTTON_CLEAR: 'Очистити',
                                    PREVIEW_BUTTON_LOAD: 'Завантажити',
                                    PREVIEW_BUTTON_SAVE: 'Зберегти',
                                    PREVIEW_PLACEHOLDER_HINT: 'Анімовані елементи мають "scale(0)" у трансформації,\nтому ваша анімація повинна мати "scale(1)" на останньому кадрі (100%).',
                                    PREVIEW_IN: 'Вхід',
                                    PREVIEW_OUT: 'Вихід',
                                    PREVIEW_CIRCLE: 'Коло',
                                    PREVIEW_POLYGON: 'Полігон',
                                    PREVIEW_OPACITY: 'Прозорість',
                                    PREVIEW_SLIME: 'Слиз',
                                    PREVIEW_BRICK_RIGHT: 'Цеглина праворуч',
                                    PREVIEW_BRICK_LEFT: 'Цеглина ліворуч',
                                    PREVIEW_BRICK_UP: 'Цеглина вгору',
                                    PREVIEW_BRICK_DOWN: 'Цеглина вниз',
                                    PREVIEW_SLIDE_RIGHT: 'Ковзання праворуч',
                                    PREVIEW_SLIDE_LEFT: 'Ковзання ліворуч',
                                    PREVIEW_SLIDE_UP: 'Ковзання вгору',
                                    PREVIEW_SLIDE_DOWN: 'Ковзання вниз',
                                    PREVIEW_SLIDE_UP_RIGHT: 'Ковзання вгору (праворуч)',
                                    PREVIEW_SLIDE_UP_LEFT: 'Ковзання вгору (ліворуч)',
                                    PREVIEW_SLIDE_DOWN_RIGHT: 'Ковзання вниз (праворуч)',
                                    PREVIEW_SLIDE_DOWN_LEFT: 'Ковзання вниз (ліворуч)',
                                    PREVIEW_SKEW_RIGHT: 'Перекіс праворуч',
                                    PREVIEW_SKEW_LEFT: 'Перекіс ліворуч',
                                    PREVIEW_WIDE_SKEW_RIGHT: 'Широкий перекіс праворуч',
                                    PREVIEW_WIDE_SKEW_LEFT: 'Широкий перекіс ліворуч',
    
                                    PREVIEW_VERTICAL_FROM_FIRST: '↓',
                                    PREVIEW_VERTICAL_FROM_LAST: '↑',
                                    PREVIEW_HORIZONTAL_FROM_FIRST: '→',
                                    PREVIEW_HORIZONTAL_FROM_LAST: '←',
    
                                    GROUP_LISTS: 'Списки',
                                    GROUP_BUTTONS: 'Кнопки',
                                    GROUP_MESSAGES: 'Повідомлення',
                                    GROUP_POPOUTS: 'Вспл. вікна',
                                    
                                    GROUP_ADVANCED: 'Розширені',
                                }
                            }
                        break;

                        case 'ru':
                            var TEMPS = {
                                TOOLTIPS: {
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Последние изменения',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: 'Проверяет обновления',
                                    BUTTON_ANIMATIONS_RESET: 'Сбрасывает все настройки',
                                    BUTTON_ANIMATIONS_REBUILD: 'Пересоздаёт стили. При перезагрузке плагина стили тоже пересоздаются',
                                    BUTTON_ANIMATIONS_ISSUES: 'Ссылка на GitHub',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: 'Ссылка на GitHub',
                                    BUTTON_LISTS_SWITCH: 'Переключение списков',
                                    BUTTON_BUTTONS_SWITCH: 'Переключение кнопок',
                                    BUTTON_MESSAGES_SWITCH: 'Переключение сообщений',                                
                                    BUTTON_POPOUTS_SWITCH: 'Переключение всплывающих окон',                                
                                    BUTTON_RESET_LISTS: 'Сбрасывает настройки списков',
                                    BUTTON_RESET_BUTTONS: 'Сбрасывает настройки кнопок',
                                    BUTTON_RESET_MESSAGES: 'Сбрасывает настройки сообщений',
                                    BUTTON_RESET_POPOUTS: 'Сбрасывает настройки всплывающих окон',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: 'Восстанавливает заводские селекторы',
                                    BUTTON_SELECTORS_LISTS_CLEAR: 'Очищает тектовое поле',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: 'Восстанавливает заводские селекторы',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: 'Очищает тектовое поле',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: 'Восстанавливает заводские селекторы',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: 'Очищает тектовое поле'
                                },
                                LABELS: {
                                    BUTTON_ANIMATIONS_RESET: 'Сбросить всё',
                                    BUTTON_ANIMATIONS_RESET_RESETING: 'Сбрасывание...',
                                    BUTTON_ANIMATIONS_REBUILD: 'Пересоздать анимации',
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Список изменений',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: 'Обновить',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_SEARCHING: 'Поиск обновлений...',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_TIMEOUT: 'Превышено вр. ожидания',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_ERROR: 'Случилась ошибка',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_OLDER: (version_='{version}')=>`v${version_} - Обновить`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_TITLE: 'Ваша версия устарела',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (ваша)  →  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_NOTE: 'Плагин будет обновлён.',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_NEWER: (version_='{version}')=>`v${version_} - Ваша версия`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_TITLE: 'Ваша версия новее',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (ваша)  ←  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_NOTE: 'Плагин будет деобновлен.',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_LATEST: (version_='{version}')=>`v${version_} - Последняя версия`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_TITLE: 'Ваша версия последняя',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_COMPARE: (yourV_, githubV_)=>`v${yourV_} (ваша)  ↔  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_NOTE: 'Плагин будет переустановлен.',
                                    BUTTON_ANIMATIONS_ISSUES: 'Проблемы',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: 'Обсуждения',
                                    BUTTON_LISTS_SWITCH: 'Списки',
                                    BUTTON_BUTTONS_SWITCH: 'Кнопки',
                                    BUTTON_MESSAGES_SWITCH: 'Сообщения',
                                    BUTTON_POPOUTS_SWITCH: 'Вспл. окна',
                                    BUTTON_RESET_LISTS: 'Сбросить списки',
                                    BUTTON_RESET_BUTTONS: 'Сбросить кнопки',
                                    BUTTON_RESET_MESSAGES: 'Сбросить сообщения',
                                    BUTTON_RESET_POPOUTS: 'Сбросить вспл. окна',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: 'По умолчанию',
                                    BUTTON_SELECTORS_LISTS_CLEAR: 'Очистить',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: 'По умолчанию',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: 'Очистить',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: 'По умолчанию',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: 'Очистить',
    
                                    FIELD_NAME: 'Название',
                                    FIELD_SEQUENCE: 'Напраление',
                                    FIELD_DELAY: 'Задержка',
                                    FIELD_LIMIT: 'Лимит',
                                    FIELD_DURATION: 'Длительность',
    
                                    FIELD_LISTS_NAME_NOTE: (default_='{default}')=>`[${default_}] Название анимации элементов списка при их появлении.`,
                                    FIELD_LISTS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] Направление в котором будут выстраиваться элементы списка.`,
                                    FIELD_LISTS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Задержка перед появлением для каждого элемента списка в секундах.`,
                                    FIELD_LISTS_LIMIT_NOTE: (default_='{default}')=>`[${default_}] Максимальное количество элементов в списке, для которых будет воспроизводиться анимация.`,
                                    FIELD_LISTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Скорость воспроизведения анимации в секундах для каждого элемента списка после задержки.`,
    
                                    FIELD_BUTTONS_NAME_NOTE: (default_='{default}')=>`[${default_}] Название анимации кнопок при их появлении.`,
                                    FIELD_BUTTONS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] Последовательность, в которой выстраиваются кнопки.`,
                                    FIELD_BUTTONS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Задержка перед появлением каждой кнопки в секундах.`,
                                    FIELD_BUTTONS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Скорость воспроизведения анимации в секундах для каждой кнопки после задержки.`,
    
                                    FIELD_MESSAGES_NAME_NOTE: (default_='{default}')=>`[${default_}] Название анимации сообщений при их появлении.`,
                                    FIELD_MESSAGES_DELAY_NOTE: (default_='{default}')=>`[${default_}] Задержка перед появлением каждого сообщения в секундах.`,
                                    FIELD_MESSAGES_LIMIT_NOTE: (default_='{default}')=>`[${default_}] Максимальное количество сообщений в списке, для которых будет воспроизводиться анимация.`,
                                    FIELD_MESSAGES_DURATION_NOTE: (default_='{default}')=>`[${default_}] Скорость воспроизведения анимации в секундах для каждого сообщения после задержки.`,
    
                                    FIELD_POPOUTS_NAME_NOTE: (default_='{default}')=>`[${default_}] Название анимации всплывающих окон при их появлении.`,
                                    FIELD_POPOUTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Скорость воспроизведения анимации в секундах для всплывающих окон.`,
    
                                    FIELD_LISTS_SELECTORS: 'Селекторы списков',
                                    FIELD_LISTS_SELECTORS_NOTE: 'Если оставить это поле пустым, при перезагрузке здесь будут отображаться селекторы по умолчанию. Изменения селекторов сохраняются при вводе (если код корректен). Разделителем является запятая (,).',
                                    FIELD_BUTTONS_SELECTORS: 'Селекторы кнопок',
                                    FIELD_BUTTONS_SELECTORS_NOTE: 'Если оставить это поле пустым, при перезагрузке здесь будут отображаться селекторы по умолчанию. Изменения селекторов сохраняются при вводе (если код корректен). Разделителем является запятая (,).',
                                    FIELD_POPOUTS_SELECTORS: 'Селекторы всплывающих окон',
                                    FIELD_POPOUTS_SELECTORS_NOTE: 'Если оставить это поле пустым, при перезагрузке здесь будут отображаться селекторы по умолчанию. Изменения селекторов сохраняются при вводе (если код корректен). Разделителем является запятая (,).',
                                    PREVIEW_SELECTING: 'Выбирать',
                                    PREVIEW_EDITING: 'Редактировать',
                                    PREVIEW_BUTTON_TEMPLATE: 'Шаблон',
                                    PREVIEW_BUTTON_CLEAR: 'Очистить',
                                    PREVIEW_BUTTON_LOAD: 'Загрузить',
                                    PREVIEW_BUTTON_SAVE: 'Сохранить',
                                    PREVIEW_PLACEHOLDER_HINT: 'Анимированные элементы имеют "scale(0)" в трансформации,\nпоэтому ваша анимация должна содержать "scale(1)" на конечном кадре (100%).',
                                    PREVIEW_IN: 'Вход',
                                    PREVIEW_OUT: 'Выход',
                                    PREVIEW_CIRCLE: 'Круг',
                                    PREVIEW_POLYGON: 'Полигон',
                                    PREVIEW_OPACITY: 'Прозрачность',
                                    PREVIEW_SLIME: 'Слизь',
                                    PREVIEW_BRICK_RIGHT: 'Кирпич враво',
                                    PREVIEW_BRICK_LEFT: 'Кирпич влево',
                                    PREVIEW_BRICK_UP: 'Кирпич вверх',
                                    PREVIEW_BRICK_DOWN: 'Кирпич вниз',
                                    PREVIEW_SLIDE_RIGHT: 'Скольжение вправо',
                                    PREVIEW_SLIDE_LEFT: 'Скольжение влево',
                                    PREVIEW_SLIDE_UP: 'Скольжение вверх',
                                    PREVIEW_SLIDE_DOWN: 'Скольжение вниз',
                                    PREVIEW_SLIDE_UP_RIGHT: 'Скольжение вверх (вправо)',
                                    PREVIEW_SLIDE_UP_LEFT: 'Скольжение вверх (влево)',
                                    PREVIEW_SLIDE_DOWN_RIGHT: 'Скольжение вниз (вправо)',
                                    PREVIEW_SLIDE_DOWN_LEFT: 'Скольжение вниз (влево)',
                                    PREVIEW_SKEW_RIGHT: 'Перекос вправо',
                                    PREVIEW_SKEW_LEFT: 'Перекос влево',
                                    PREVIEW_WIDE_SKEW_RIGHT: 'Широкий перекос вправо',
                                    PREVIEW_WIDE_SKEW_LEFT: 'Широкий перекос влево',
    
                                    PREVIEW_VERTICAL_FROM_FIRST: '↓',
                                    PREVIEW_VERTICAL_FROM_LAST: '↑',
                                    PREVIEW_HORIZONTAL_FROM_FIRST: '→',
                                    PREVIEW_HORIZONTAL_FROM_LAST: '←',
    
                                    GROUP_LISTS: 'Списки',
                                    GROUP_BUTTONS: 'Кнопки',
                                    GROUP_MESSAGES: 'Сообщения',
                                    GROUP_POPOUTS: 'Вспл. окна',
                                    
                                    GROUP_ADVANCED: 'Расширенные',
                                }
                            }
                        break;

                        case 'zh-TW':
                            var TEMPS = {
                                TOOLTIPS: {
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: '最近更新',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: '檢查更新',
                                    BUTTON_ANIMATIONS_RESET: '重設所有設定',
                                    BUTTON_ANIMATIONS_REBUILD: '重新生成樣式。當插件重新啟動時，樣式也會重新生成',
                                    BUTTON_ANIMATIONS_ISSUES: '前往GitHub',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: '前往GitHub',
                                    BUTTON_LISTS_SWITCH: '列表開關',
                                    BUTTON_BUTTONS_SWITCH: '按鈕開關',
                                    BUTTON_MESSAGES_SWITCH: '訊息開關',
                                    BUTTON_POPOUTS_SWITCH: '彈出視窗開關',
                                    BUTTON_RESET_LISTS: '重設列表設定',
                                    BUTTON_RESET_BUTTONS: '重設按鈕設定',
                                    BUTTON_RESET_MESSAGES: '重設訊息設定',
                                    BUTTON_RESET_POPOUTS: '重設彈出視窗設定',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: '恢復至預設值',
                                    BUTTON_SELECTORS_LISTS_CLEAR: '清除所有選擇',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: '恢復至預設值',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: '清除所有選擇',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: '恢復至預設值',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: '清除所有選擇'
                                },
                                LABELS: {
                                    BUTTON_ANIMATIONS_RESET: '重設所有設定',
                                    BUTTON_ANIMATIONS_RESET_RESETING: '重設中...',
                                    BUTTON_ANIMATIONS_REBUILD: '重新生成動畫',
                                    BUTTON_ANIMATIONS_VERSION_CHANGELOG: '更新日誌',
                                    BUTTON_ANIMATIONS_VERSION_CHECK: '檢查更新',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_SEARCHING: '檢查更新中...',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_TIMEOUT: '超時',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_ERROR: '發生錯誤',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_OLDER: (version_ = '{version}') => `v${version_} - 更新`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_TITLE: '您當前的版本較舊',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_COMPARE: (yourV_, githubV_) => `v${yourV_} (您的)  →  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_NOTE: '插件將會更新',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_NEWER: (version_ = '{version}') => `v${version_} - 您的版本`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_TITLE: '您當前的版本較新',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_COMPARE: (yourV_, githubV_) => `v${yourV_} (您的)  ←  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_NOTE: '插件將會降級',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_LATEST: (version_ = '{version}') => `v${version_} - 最新版本`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_TITLE: '您當前的版本為最新',
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_COMPARE: (yourV_, githubV_) => `v${yourV_} (您的)  ↔  v${githubV_} (github)`,
                                    BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_NOTE: '插件將會恢復',
                                    BUTTON_ANIMATIONS_ISSUES: '發生錯誤了?',
                                    BUTTON_ANIMATIONS_DISCUSSIONS: '討論',
                                    BUTTON_LISTS_SWITCH: '列表',
                                    BUTTON_BUTTONS_SWITCH: '按鈕',
                                    BUTTON_MESSAGES_SWITCH: '訊息',
                                    BUTTON_POPOUTS_SWITCH: '彈出視窗',
                                    BUTTON_RESET_LISTS: '重設列表',
                                    BUTTON_RESET_BUTTONS: '重設按鈕',
                                    BUTTON_RESET_MESSAGES: '重設訊息',
                                    BUTTON_RESET_POPOUTS: '重設彈出視窗',
                                    BUTTON_SELECTORS_LISTS_DEFAULT: '預設值',
                                    BUTTON_SELECTORS_LISTS_CLEAR: '清除',
                                    BUTTON_SELECTORS_BUTTONS_DEFAULT: '預設值',
                                    BUTTON_SELECTORS_BUTTONS_CLEAR: '清除',
                                    BUTTON_SELECTORS_POPOUTS_DEFAULT: '預設值',
                                    BUTTON_SELECTORS_POPOUTS_CLEAR: '清除',

                                    FIELD_NAME: '行式',
                                    FIELD_SEQUENCE: '順序',
                                    FIELD_DELAY: '延遲',
                                    FIELD_LIMIT: '限制',
                                    FIELD_DURATION: '持續時間',

                                    FIELD_LISTS_NAME_NOTE: (default_ = '{default}') => `[${default_}] 列表項的動畫行式`,
                                    FIELD_LISTS_SEQUENCE_NOTE: (default_ = '{default}') => `[${default_}] 生成列表項的順序`,
                                    FIELD_LISTS_DELAY_NOTE: (default_ = '{default}') => `[${default_}] 每個列表項出現前的延遲（以秒為單位）`,
                                    FIELD_LISTS_LIMIT_NOTE: (default_ = '{default}') => `[${default_}] 列表中將播放動畫的最大項目數`,
                                    FIELD_LISTS_DURATION_NOTE: (default_ = '{default}') => `[${default_}] 延遲後每個列表項的動畫播放速度（以秒為單位）`,

                                    FIELD_BUTTONS_NAME_NOTE: (default_ = '{default}') => `[${default_}] 按鈕項的動畫行式`,
                                    FIELD_BUTTONS_SEQUENCE_NOTE: (default_ = '{default}') => `[${default_}] 生成按鈕項的順序`,
                                    FIELD_BUTTONS_DELAY_NOTE: (default_ = '{default}') => `[${default_}] 每個按鈕項出現前的延遲（以秒為單位）`,
                                    FIELD_BUTTONS_DURATION_NOTE: (default_ = '{default}') => `[${default_}] 延遲後每個按鈕項的動畫播放速度（以秒為單位）`,

                                    FIELD_MESSAGES_NAME_NOTE: (default_ = '{default}') => `[${default_}] 訊息項的動畫行式`,
                                    FIELD_MESSAGES_DELAY_NOTE: (default_ = '{default}') => `[${default_}] 每個訊息項出現前的延遲（以秒為單位）`,
                                    FIELD_MESSAGES_LIMIT_NOTE: (default_ = '{default}') => `[${default_}] 訊息中將播放動畫的最大項目數.`,
                                    FIELD_MESSAGES_DURATION_NOTE: (default_ = '{default}') => `[${default_}] 延遲後每個訊息項的動畫播放速度（以秒為單位）`,

                                    FIELD_POPOUTS_NAME_NOTE: (default_ = '{default}') => `[${default_}] 彈出視窗的動畫行式`,
                                    FIELD_POPOUTS_DURATION_NOTE: (default_ = '{default}') => `[${default_}] 彈出視窗的動畫播放速度（以秒為單位）。`,

                                    FIELD_LISTS_SELECTORS: '列表項名單',
                                    FIELD_LISTS_SELECTORS_NOTE: '如果您將此字段留空，則預設值將在重新加載時出現在此處。輸入時會保存對名單的更改（如果代碼有效）。分隔符是半形逗號 (,)',
                                    FIELD_BUTTONS_SELECTORS: '按鈕項名單',
                                    FIELD_BUTTONS_SELECTORS_NOTE: '如果您將此字段留空，則預設值將在重新加載時出現在此處。輸入時會保存對名單的更改（如果代碼有效）。分隔符是半形逗號 (,)',
                                    FIELD_POPOUTS_SELECTORS: '彈出視窗名單',
                                    FIELD_POPOUTS_SELECTORS_NOTE: '如果您將此字段留空，則預設值將在重新加載時出現在此處。輸入時會保存對名單的更改（如果代碼有效）。分隔符是半形逗號 (,)',

                                    PREVIEW_SELECTING: '選擇',
                                    PREVIEW_EDITING: '編輯',
                                    PREVIEW_BUTTON_TEMPLATE: '樣板',
                                    PREVIEW_BUTTON_CLEAR: '清除',
                                    PREVIEW_BUTTON_LOAD: '載入',
                                    PREVIEW_BUTTON_SAVE: '儲存',
                                    PREVIEW_PLACEHOLDER_HINT: '動畫元素在變換中具有“scale(0)”\n因此您的動畫必須在最後一幀 (100%) 上包含“scale(1)”',
                                    PREVIEW_IN: '由內往外',
                                    PREVIEW_OUT: '由外往內',
                                    PREVIEW_CIRCLE: '圓形展開',
                                    PREVIEW_POLYGON: '多邊形展開',
                                    PREVIEW_OPACITY: '淡入',
                                    PREVIEW_SLIME: '史萊姆',
                                    PREVIEW_BRICK_RIGHT: '由左滑入',
                                    PREVIEW_BRICK_LEFT: '由右滑入',
                                    PREVIEW_BRICK_UP: '由下滑入',
                                    PREVIEW_BRICK_DOWN: '由上滑入',
                                    PREVIEW_SLIDE_RIGHT: '由左填滿',
                                    PREVIEW_SLIDE_LEFT: '由右填滿',
                                    PREVIEW_SLIDE_UP: '由下填滿',
                                    PREVIEW_SLIDE_DOWN: '由上填滿',
                                    PREVIEW_SLIDE_UP_RIGHT: '由左下往右上填滿',
                                    PREVIEW_SLIDE_UP_LEFT: '由右下往左上填滿',
                                    PREVIEW_SLIDE_DOWN_RIGHT: '由左上往右下填滿',
                                    PREVIEW_SLIDE_DOWN_LEFT: '由右上往左下填滿',
                                    PREVIEW_SKEW_RIGHT: '向右旋轉',
                                    PREVIEW_SKEW_LEFT: '向左旋轉',
                                    PREVIEW_WIDE_SKEW_RIGHT: '向右旋轉(寬)',
                                    PREVIEW_WIDE_SKEW_LEFT: '向左旋轉(寬)',

                                    PREVIEW_VERTICAL_FROM_FIRST: '↓',
                                    PREVIEW_VERTICAL_FROM_LAST: '↑',
                                    PREVIEW_HORIZONTAL_FROM_FIRST: '→',
                                    PREVIEW_HORIZONTAL_FROM_LAST: '←',

                                    GROUP_LISTS: '列表',
                                    GROUP_BUTTONS: '按鈕',
                                    GROUP_MESSAGES: '訊息',
                                    GROUP_POPOUTS: '彈出視窗',

                                    GROUP_ADVANCED: '進階選項',
                                }
                            }
                        break;
                        case 'en-US':
                        case 'en-GB':
                        default:
                        var TEMPS = {
                            TOOLTIPS: {
                                BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Latest changes',
                                BUTTON_ANIMATIONS_VERSION_CHECK: 'Checks for updates',
                                BUTTON_ANIMATIONS_RESET: 'Resets all settings',
                                BUTTON_ANIMATIONS_REBUILD: 'Recreates styles. When the plugin is restarted, the styles are recreates too',
                                BUTTON_ANIMATIONS_ISSUES: 'Link to GitHub',
                                BUTTON_ANIMATIONS_DISCUSSIONS: 'Link to GitHub',
                                BUTTON_LISTS_SWITCH: 'Lists switch',
                                BUTTON_BUTTONS_SWITCH: 'Buttons switch',
                                BUTTON_MESSAGES_SWITCH: 'Messages switch',                                
                                BUTTON_POPOUTS_SWITCH: 'Popouts switch',                                
                                BUTTON_RESET_LISTS: 'Resets lists settings',
                                BUTTON_RESET_BUTTONS: 'Resets buttons settings',
                                BUTTON_RESET_MESSAGES: 'Resets messages settings',
                                BUTTON_RESET_POPOUTS: 'Resets popouts settings',
                                BUTTON_SELECTORS_LISTS_DEFAULT: 'Restores default selectors',
                                BUTTON_SELECTORS_LISTS_CLEAR: 'Clears the textarea',
                                BUTTON_SELECTORS_BUTTONS_DEFAULT: 'Restores default selectors',
                                BUTTON_SELECTORS_BUTTONS_CLEAR: 'Clears the textarea',
                                BUTTON_SELECTORS_POPOUTS_DEFAULT: 'Restores default selectors',
                                BUTTON_SELECTORS_POPOUTS_CLEAR: 'Clears the textarea'
                            },
                            LABELS: {
                                BUTTON_ANIMATIONS_RESET: 'Reset all',
                                BUTTON_ANIMATIONS_RESET_RESETING: 'Reseting...',
                                BUTTON_ANIMATIONS_REBUILD: 'Rebuild animations',
                                BUTTON_ANIMATIONS_VERSION_CHANGELOG: 'Changelog',
                                BUTTON_ANIMATIONS_VERSION_CHECK: 'Update',
                                BUTTON_ANIMATIONS_VERSION_CHECK_SEARCHING: 'Searching for updates...',
                                BUTTON_ANIMATIONS_VERSION_CHECK_TIMEOUT: 'Timeout exceeded',
                                BUTTON_ANIMATIONS_VERSION_CHECK_ERROR: 'An error occurred',
                                BUTTON_ANIMATIONS_VERSION_CHECK_OLDER: (version_='{version}')=>`v${version_} - Update`,
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_TITLE: 'Your version is older',
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (your)  →  v${githubV_} (github)`,
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_NOTE: 'The plugin will be updated.',
                                BUTTON_ANIMATIONS_VERSION_CHECK_NEWER: (version_='{version}')=>`v${version_} - Your own version`,
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_TITLE: 'Your version is newer',
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_COMPARE: (yourV_, githubV_)=>`v${yourV_} (your)  ←  v${githubV_} (github)`,
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_NOTE: 'The plugin will be downdated.',
                                BUTTON_ANIMATIONS_VERSION_CHECK_LATEST: (version_='{version}')=>`v${version_} - Latest version`,
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_TITLE: 'Your version is latest',
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_COMPARE: (yourV_, githubV_)=>`v${yourV_} (your)  ↔  v${githubV_} (github)`,
                                BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_NOTE: 'The plugin will be restored.',
                                BUTTON_ANIMATIONS_ISSUES: 'Issues',
                                BUTTON_ANIMATIONS_DISCUSSIONS: 'Discussions',
                                BUTTON_LISTS_SWITCH: 'Lists',
                                BUTTON_BUTTONS_SWITCH: 'Buttons',
                                BUTTON_MESSAGES_SWITCH: 'Messages',
                                BUTTON_POPOUTS_SWITCH: 'Popouts',
                                BUTTON_RESET_LISTS: 'Reset lists',
                                BUTTON_RESET_BUTTONS: 'Reset buttons',
                                BUTTON_RESET_MESSAGES: 'Reset messages',
                                BUTTON_RESET_POPOUTS: 'Reset popouts',
                                BUTTON_SELECTORS_LISTS_DEFAULT: 'Default',
                                BUTTON_SELECTORS_LISTS_CLEAR: 'Clear',
                                BUTTON_SELECTORS_BUTTONS_DEFAULT: 'Default',
                                BUTTON_SELECTORS_BUTTONS_CLEAR: 'Clear',
                                BUTTON_SELECTORS_POPOUTS_DEFAULT: 'Default',
                                BUTTON_SELECTORS_POPOUTS_CLEAR: 'Clear',

                                FIELD_NAME: 'Name',
                                FIELD_SEQUENCE: 'Sequence',
                                FIELD_DELAY: 'Delay',
                                FIELD_LIMIT: 'Limit',
                                FIELD_DURATION: 'Duration',

                                FIELD_LISTS_NAME_NOTE: (default_='{default}')=>`[${default_}] The name of the animation of the list items when they appear.`,
                                FIELD_LISTS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] The sequence in which the list items are built.`,
                                FIELD_LISTS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Delay before appearing for each list item in seconds.`,
                                FIELD_LISTS_LIMIT_NOTE: (default_='{default}')=>`[${default_}] The maximum number of items in the list for which the animation will be played.`,
                                FIELD_LISTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Animation playback speed in seconds for each list item after the delay.`,

                                FIELD_BUTTONS_NAME_NOTE: (default_='{default}')=>`[${default_}] The name of the animation of the buttons when they appear.`,
                                FIELD_BUTTONS_SEQUENCE_NOTE: (default_='{default}')=>`[${default_}] The sequence in which the buttons are built.`,
                                FIELD_BUTTONS_DELAY_NOTE: (default_='{default}')=>`[${default_}] Delay before appearing for each button in seconds.`,
                                FIELD_BUTTONS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Animation playback speed in seconds for each button after the delay.`,

                                FIELD_MESSAGES_NAME_NOTE: (default_='{default}')=>`[${default_}] The name of the animation of the messages when they appear.`,
                                FIELD_MESSAGES_DELAY_NOTE: (default_='{default}')=>`[${default_}] Delay before appearing for each message in seconds.`,
                                FIELD_MESSAGES_LIMIT_NOTE: (default_='{default}')=>`[${default_}] The maximum number of messages in the list for which the animation will be played.`,
                                FIELD_MESSAGES_DURATION_NOTE: (default_='{default}')=>`[${default_}] Animation playback speed in seconds for each message after the delay.`,

                                FIELD_POPOUTS_NAME_NOTE: (default_='{default}')=>`[${default_}] The name of the animation of the popouts when they appear.`,
                                FIELD_POPOUTS_DURATION_NOTE: (default_='{default}')=>`[${default_}] Animation playback speed in seconds for a popout.`,

                                FIELD_LISTS_SELECTORS: 'Selectors of lists',
                                FIELD_LISTS_SELECTORS_NOTE: 'If you leave this field empty, the default selectors will appear here on reload. Changes to the selectors are saved when typing (if the code is valid). The separator is a comma (,).',
                                FIELD_BUTTONS_SELECTORS: 'Selectors of buttons',
                                FIELD_BUTTONS_SELECTORS_NOTE: 'If you leave this field empty, the default selectors will appear here on reload. Changes to the selectors are saved when typing (if the code is valid). The separator is a comma (,).',
                                FIELD_POPOUTS_SELECTORS: 'Selectors of popouts',
                                FIELD_POPOUTS_SELECTORS_NOTE: 'If you leave this field empty, the default selectors will appear here on reload. Changes to the selectors are saved when typing (if the code is valid). The separator is a comma (,).',

                                PREVIEW_SELECTING: 'Selecting',
                                PREVIEW_EDITING: 'Editing',
                                PREVIEW_BUTTON_TEMPLATE: 'Template',
                                PREVIEW_BUTTON_CLEAR: 'Clear',
                                PREVIEW_BUTTON_LOAD: 'Load',
                                PREVIEW_BUTTON_SAVE: 'Save',
                                PREVIEW_PLACEHOLDER_HINT: 'Animated elements have "scale(0)" in the transformation,\nso your animation must contain "scale(1)" on the final frame(100%).',
                                PREVIEW_IN: 'In',
                                PREVIEW_OUT: 'Out',
                                PREVIEW_CIRCLE: 'Circle',
                                PREVIEW_POLYGON: 'Polygon',
                                PREVIEW_OPACITY: 'Opacity',
                                PREVIEW_SLIME: 'Slime',
                                PREVIEW_BRICK_RIGHT: 'Brick right',
                                PREVIEW_BRICK_LEFT: 'Brick left',
                                PREVIEW_BRICK_UP: 'Brick up',
                                PREVIEW_BRICK_DOWN: 'Brick down',
                                PREVIEW_SLIDE_RIGHT: 'Slide right',
                                PREVIEW_SLIDE_LEFT: 'Slide left',
                                PREVIEW_SLIDE_UP: 'Slide up',
                                PREVIEW_SLIDE_DOWN: 'Slide down',
                                PREVIEW_SLIDE_UP_RIGHT: 'Slide up (right)',
                                PREVIEW_SLIDE_UP_LEFT: 'Slide up (left)',
                                PREVIEW_SLIDE_DOWN_RIGHT: 'Slide down (right)',
                                PREVIEW_SLIDE_DOWN_LEFT: 'Slide down (left)',
                                PREVIEW_SKEW_RIGHT: 'Skew right',
                                PREVIEW_SKEW_LEFT: 'Skew left',
                                PREVIEW_WIDE_SKEW_RIGHT: 'Wide skew right',
                                PREVIEW_WIDE_SKEW_LEFT: 'Wide skew left',

                                PREVIEW_VERTICAL_FROM_FIRST: '↓',
                                PREVIEW_VERTICAL_FROM_LAST: '↑',
                                PREVIEW_HORIZONTAL_FROM_FIRST: '→',
                                PREVIEW_HORIZONTAL_FROM_LAST: '←',

                                GROUP_LISTS: 'Lists',
                                GROUP_BUTTONS: 'Buttons',
                                GROUP_MESSAGES: 'Messages',
                                GROUP_POPOUTS: 'Popouts',
                                
                                GROUP_ADVANCED: 'Advanced',
                            }
                        }
                    }

                    class ElementButton extends React.Component {

                        constructor(button) {
                            super(button)
                            this.state = button
                        }

                        render() {
                            var button = this.state;
                            return React.createElement('button', {
                                style: {
                                    display: 'inline-block',
                                    width: button.width ?? 'fit-content',
                                    height: button.height ?? 'fit-content',
                                    padding: button.padding ?? '8px',
                                    margin: button.margin ?? '8px',
                                    'transition': 'background-color .17s ease, color .17s ease, opacity 250ms ease',
                                },
                                id: button.id,
                                class: `${Animations.modules.Button} ${Animations.modules.ButtonSizeSmall} ${button.inverted ? 'inverted' : 'filled'} ${button.color ?? 'blurple'} ${button.class ?? ''}`,
                                onClick: button.onclick ?? null
                            },
                                React.createElement('div', {
                                    style: {
                                        'pointer-events': 'none',
                                        'display': 'flex',
                                        'align-items': 'center',
                                        'justify-content': 'center'
                                    }
                                },
                                    [
                                        Array.isArray(button.svgPaths) ? React.createElement('svg',
                                            {
                                                viewBox: button.svgView ?? '0 0 24 24',
                                                fill: '#fff',
                                                style: {
                                                    width: '18px',
                                                    height: '18px',
                                                    'margin-right': '4px'
                                                }
                                            },
                                            (() => {
                                                var result = []
                                                button.svgPaths.forEach(path => result.push(React.createElement('path', { d: path })));
                                                return result;
                                            })()
                                        ) : null,
                                        React.createElement('span', {
                                            style: {
                                                'max-width': 'none'
                                            },
                                            class: `${Animations.modules.ButtonText}`,
                                        },
                                            button.label
                                        )
                                    ]
                                )
                            )
                        }
                    }

                    class ElementInput extends React.Component {

                        constructor(input) {
                            super(input)
                            this.state = input
                        }

                        render() {
                            var input = this.state;
                            return React.createElement('input',
                                {
                                    style: {
                                        display: 'inline-block',
                                        width: input.width ?? '100%',
                                        height: input.height ?? 'fit-content',
                                        padding: input.padding ?? '8px',
                                        margin: input.margin ?? '8px',
                                    },
                                    placeholder: input.placeholder ?? '',
                                    maxlength: input.maxlength ?? '',
                                    max: input.max ?? '',
                                    min: input.min ?? '0',
                                    size: input.size ?? '',
                                    step: input.step ?? '0.01',
                                    type: (['text', 'password', 'email', 'number', 'integer']).includes(input.type) ? (input.type=='integer'?'number':input.type) : 'text',
                                    value: input.value ?? '',
                                    id: input.id,
                                    class: `${Animations.modules.InputDefault} ${input.class ?? ''}`,
                                    onClick: input.onclick ?? null,
                                    onChange: (e) => {
                                        var value = e.currentTarget.value

                                        if( (['number', 'integer']).includes(input.type) && !(/\d*,/).test(value) ) {
                                            value = Number(value)
                                            value = (value<=(input.max??Infinity) ? value : input.max)
                                            value = (value>=(input.min??0) ? value : input.min??0)
                                            value = (input.type=='integer'?Math.floor(value):value)
                                        }
                                        var newValue = String(value)

                                        this.setState({
                                            ...input,
                                            value: newValue
                                        })

                                        input?.onchange(e)
                                    }
                                }
                            )
                        }
                    }

                    /**
                     * Returns object - `class`, `render`.
                     * @param {Array<object>} containersTemp Array with button container templates.
                     * @param {object} options Panel optinons.
                     * @param {string} [options.widthAll] The width of each button, if the template does not specify a different width.
                     * @param {string} [options.heightAll] The height of each button, if the template does not specify a different height.
                     * @param {string} [options.align="flex-start"] `justify-content` css value for each button container.
                     * @param {boolean} [options.nosidemargin=true] Zeroing the left and right margins for the first and last button respectively.
                     */

                    var ElementsPanel = (containersTemp = [], options = {}) => {
                        var containerNodes = [];
                        containersTemp?.forEach(containerTemp => {
                            var elementNodes = [];
                            containerTemp.elements?.forEach(elementTemp => {
                                switch (elementTemp.component) {
                                    case 'button':
                                        elementNodes.push(
                                            React.createElement(ElementButton, {
                                                width: options.widthAll ?? containerTemp.options?.widthAll,
                                                height: options.heightAll ?? containerTemp.options?.heightAll,
                                                margin: options.marginAll ?? containerTemp.options?.marginAll,
                                                padding: options.paddingAll ?? containerTemp.options?.paddingAll,
                                                ...elementTemp
                                            })
                                        )
                                        break;
                                    case 'input':
                                        elementNodes.push(
                                            React.createElement(ElementInput, {
                                                width: options.widthAll ?? containerTemp.options?.widthAll,
                                                height: options.heightAll ?? containerTemp.options?.heightAll,
                                                margin: options.marginAll ?? containerTemp.options?.marginAll,
                                                padding: options.paddingAll ?? containerTemp.options?.paddingAll,
                                                ...elementTemp
                                            })
                                        )
                                        break;
                                
                                    default:
                                        break;
                                }
                            })
                            containerNodes.push(
                                React.createElement('div',
                                    {
                                        style: {
                                            display: 'inline-flex',
                                            width: '100%',
                                            'justify-content': options.align ?? containerTemp.options?.align ?? 'flex-start'
                                        },
                                        class: `elementsContainer ${options.nosidemargin ?? containerTemp.options?.nosidemargin ?? true ? 'nosidemargin':''}`
                                    },
                                    ...elementNodes
                                )
                            )
                        })

                        var result = React.createElement('div', {
                            style: {
                                display: 'flex',
                                width: '100%',
                                'flex-direction': 'column',
                                'justify-content': options.align ?? 'inline-flex'
                            },
                            class: `elementsPanel`
                        },
                            [
                                ...containerNodes
                            ]
                        )

                        class Panel extends React.Component {
                            render() {
                                return result
                            }
                        }

                        return {class: Panel, render: result};
                    }

                    /**
                     * Returns object - `class`, `render`.
                     * @param {object} options TextareaPanel options.
                     * @param {string} [options.margin]
                     * @param {string} [options.padding]
                     * @param {string} [options.class]
                     * @param {object} [options.elementsPanel] ElementsPanel.
                     * @param {Array<object>} [options.elementsPanel.containersTemp] Array with element container templates.
                     * @param {object} [options.elementsPanel.options] ElementsPanel options.
                     * @param {string} [options.elementsPanel.options.widthAll] The width of each element, if the template does not specify a different width.
                     * @param {string} [options.elementsPanel.options.heightAll] The height of each element, if the template does not specify a different height.
                     * @param {string} [options.elementsPanel.options.marginAll] The margin of each element, if the template does not specify a different height.
                     * @param {string} [options.elementsPanel.options.paddingAll] The padding of each element, if the template does not specify a different height.
                     * @param {string} [options.elementsPanel.options.align="inline-flex"] `justify-content` css value for each element container. Default - `flex-start`.
                     * @param {string} [options.class]
                     * @param {object} [options.textarea] Textarea options.
                     * @param {string} [options.textarea.width]
                     * @param {string} [options.textarea.height]
                     * @param {string} [options.textarea.type]
                     * @param {string} [options.textarea.placeholder]
                     * @param {string} [options.textarea.class] Addition classes.
                     * @param {(e:InputEvent)=>void} onchange Event at each change of the textarea.
                     * @param {string} value Value of the textarea.
                     */

                    var TextareaPanel = (options={}, value, onchange) => {
                        var result = React.createElement('div', {
                            style: {
                                margin: options.margin ?? null,
                                padding: options.padding ?? null
                            },
                            class: `animTextareaPanel ${options.class}`
                        },
                            [
                                options.elementsPanel?(ElementsPanel(options.elementsPanel.containersTemp, options.elementsPanel.options ?? {}).render):null,
                                React.createElement('textarea',
                                    {
                                        style: {
                                            height: options?.textarea?.height ?? '270px',
                                            width: options?.textarea?.width ?? '100%'
                                        },
                                        spellcheck: 'false',
                                        type: options.textarea?.type ?? 'text',
                                        placeholder: options.textarea?.placeholder ?? '',
                                        class: `animTextarea ${options.textarea?.class ?? ''} ${Animations.modules.InputDefault} ${Animations.modules.TextArea} ${Animations.modules.ScrollbarDefault}`,
                                        onChange: onchange ?? null
                                    },
                                    value
                                )
                            ]
                        )

                        class Panel extends React.Component {
                            render() {
                                return result
                            }
                        }

                        return {class: Panel, render: result}
                    }

                    /**
                     * Returns object - `class`, `render`.
                     * @param {Array<object>} previewsTemp Array with previews templates.
                     * @param {object} options Panel optinons.
                     * @param {boolean} horizontal Preview positioning.
                     * @param {string} [options.type] `*class*-name`, `*class*-sequence`, ...
                     * @param {string} [options.class] `lists`, `messages`, `buttons`
                     * @param {object} [options.custom] Editor options.
                     * @param {boolean} [options.custom.enabled] Editor availability.
                     * @param {Array<string>} [options.custom.frames] Editor frames default.
                     * @param {number} [options.custom.page] Editor page default.
                     * @param {number} [options.custom.data] Editor data `this.settings.*type*.custom`.
                     * @param {object} [options.tempBlocks] TempBlocks options.
                     * @param {string} [options.tempBlocks.count=4] TempBlocks count.
                     * @param {string} [options.tempBlocks.margin='4px'] TempBlocks margin.
                     * @param {string} [options.tempBlocks.height] TempBlock height.
                     * @param {string} [options.tempBlocks.width] TempBlock width.
                     * @param {(e:MouseEvent)=>void} [onclick]
                     * @param {string} value One of the values of `previevsTemp`
                     */

                    var PreviewsPanel = (previewsTemp = [], options = {}, value, onclick) => {

                        var swipeButtonsDefault = [];
                        var swipeButtonsCustom = [];
                        var previews = [];
                        var containers = [];
                        var textareas = [];
                        var openedPage = 0;
                        var containersCount = 0;
                        var previewsCountOnPage = (options?.horizontal ? 6 : 8);

                        if(options?.custom)
                        if(this.settings[options.class].custom.enabled)
                        if(!this.isValidCSS(this.settings[options.class].custom.frames[this.settings[options.class].custom.page]))
                        {
                            this.settings[options.class].custom.enabled = false;
                            PluginUtilities.saveSettings(this.getName(), this.settings);
                        }

                        previewsTemp.forEach((template, index) => {
                            if (value == template.value) openedPage = Math.ceil((index + 1) / previewsCountOnPage)-1;
                            var tempBlocks = []
                            var tempCount = ((typeof options?.tempBlocks?.count == 'number')?options.tempBlocks.count:4)
                            for (var i = 0; i < tempCount; i++) {
                                tempBlocks[i] = React.createElement('div', {
                                    class: 'animTempBlock',
                                    style: {
                                        width: options?.tempBlocks?.width ?? (options?.horizontal?'100%':'auto'),
                                        height: options?.tempBlocks?.height ?? (options?.horizontal?'26px':'18%'),
                                        margin: options?.tempBlocks?.margin ?? (options?.horizontal?'0 4px':'4px')
                                    }
                                })
                            }

                            previews.push(
                                React.createElement('div', {
                                    'data-animation': template.value,
                                    class: `animPreview ${value == template.value ? 'enabled' : ''}`,
                                    onClick: (e) => {
                                        onclick({value: template.value, page: openedPage});

                                        var sections = document.querySelectorAll(`[data-type="${options.type}"] .animPreview`);
                                        for (i = 0; i < sections.length; i++) sections[i].classList.remove('enabled');
                                        e.currentTarget.classList.add('enabled');
                                    }
                                },
                                [
                                    React.createElement('div', {
                                        class: 'animPreviewTempsContainer'
                                    },
                                        tempBlocks
                                    ),

                                    React.createElement('div', {
                                        class: 'animPreviewLabel'
                                    },
                                        template.label
                                    )]
                                )
                            )
                        })

                        for (containersCount = 0; containersCount + 1 <= Math.ceil(previewsTemp.length / previewsCountOnPage); containersCount++) {
                            swipeButtonsDefault.push(
                                React.createElement('div',
                                    {
                                        class: `animPageCircleButton ${openedPage == containersCount ? 'enabled' : ''}`,
                                        'data-page': containersCount,
                                        onClick: (e) => {
                                            for (var containerElem of e.currentTarget.closest('.animPreviewsPanel').querySelectorAll(`.animPreviewsContainer, .customKeyframeTextArea`)) containerElem.classList.remove('show');

                                            e.currentTarget.closest('.animPreviewsPanel').querySelectorAll(`.animPreviewsContainer`)[e.currentTarget.getAttribute('data-page')].classList.add('show');

                                            var sections = document.querySelectorAll(`[data-type="${options.type}"] .default .animPageCircleButton`);
                                            for (i = 0; i < sections.length; i++) sections[i].classList.remove('enabled');

                                            e.currentTarget.classList.add('enabled');

                                            this.settings[options.class].page = Number(e.currentTarget.getAttribute('data-page'));
                                        }
                                    },
                                    containersCount + 1
                                )
                            );

                            var pages = [];

                            var i = 0;
                            while (i < previewsCountOnPage) {
                                pages.push(previews[(containersCount) * previewsCountOnPage + i])
                                i++
                            }

                            containers.push(
                                React.createElement('div',
                                    {
                                        class: `animPreviewsContainer ${(options.custom) ? (!this.settings[options.class].custom.enabled && openedPage == containersCount ? 'show' : '') : (openedPage == containersCount ? 'show' : '')} ${previewsTemp.length < previewsCountOnPage + 1 ? 'compact' : ''}`,
                                    },
                                    pages
                                )
                            );

                        }

                        if (options.custom) {

                            for (var i = 0; i < 4; i++) {
                                textareas.push(
                                    TextareaPanel(
                                        {
                                            elementsPanel: {
                                                containersTemp: [
                                                    {
                                                        elements: [
                                                            {
                                                                component: 'button',
                                                                label: TEMPS.LABELS.PREVIEW_BUTTON_TEMPLATE,
                                                                onclick: (e) => {
                                                                    e.currentTarget.closest('.animTextareaPanel')
                                                                    .querySelector('.animTextarea').value = `0% {\n\ttransform: translate(0, 100%);\n}\n\n100% {\n\ttransform: translate(0, 0) scale(1);\n}`;
                                                                }
                                                            },
                                                            {
                                                                component: 'button',
                                                                label: TEMPS.LABELS.PREVIEW_BUTTON_CLEAR,
                                                                onclick: (e) => {
                                                                    var textarea = e.currentTarget.closest('.animTextareaPanel').querySelector('.animTextarea')
                                                                    textarea.value = '';
                                                                    textarea.focus();
                                                                }
                                                            },
                                                            {
                                                                component: 'button',
                                                                color: 'green',
                                                                label: TEMPS.LABELS.PREVIEW_BUTTON_LOAD,
                                                                onclick: (e) => {
                                                                    e.currentTarget.closest('.animTextareaPanel')
                                                                    .querySelector('.animTextarea').value = this.settings[options.class].custom.frames[this.settings[options.class].custom.page]
                                                                }
                                                            },
                                                            {
                                                                component: 'button',
                                                                color: 'green',
                                                                label: TEMPS.LABELS.PREVIEW_BUTTON_SAVE,
                                                                onclick: (e) => {
                                                                    this.settings[options.class].custom.frames[this.settings[options.class].custom.page] = e.currentTarget.closest('.animTextareaPanel')
                                                                    .querySelector('.animTextarea').value;
                                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    this.changeStyles()
                                                                }
                                                            },
                                                        ]
                                                    }
                                                ],
                                                options: {
                                                    widthAll: '100%',
                                                    marginAll: '0 8px'
                                                }
                                            },
                                            textarea: {
                                                height: '290px',
                                                placeholder: `/*\n${TEMPS.LABELS.PREVIEW_PLACEHOLDER_HINT}\n*/\n\n0% {\n\ttransform: translate(0, 100%);\n}\n\n100% {\n\ttransform: translate(0, 0) scale(1);\n}`,
                                            },
                                            class: `${this.settings[options.class].custom.enabled && i == this.settings[options.class].custom.page ? 'show' : ''}`,
                                        },
                                        options.custom.data.frames[i],
                                        (e) => {
                                            var textarea = e.currentTarget;
                                            var value = e.currentTarget.value;
                                            if (this.isValidCSS(value) || value == "") {
                                                textarea.classList.add('valid');
                                                textarea.classList.remove('invalid');
                                            } else {
                                                textarea.classList.add('invalid');
                                                textarea.classList.remove('valid');
                                            }

                                            options.custom?.onchange(e)
                                        }
                                    ).render
                                );

                                swipeButtonsCustom.push(
                                    React.createElement('div',
                                        {
                                            class: `animPageCircleButton ${this.settings[options.class].custom.page == i ? 'enabled' : ''}`,
                                            'data-page': i,
                                            onClick: (e) => {
                                                for (var containerElem of e.currentTarget.closest('.animPreviewsPanel').querySelectorAll(`.animPreviewsContainer, .animTextareaPanel`)) containerElem.classList.remove('show');

                                                e.currentTarget.closest('.animPreviewsPanel').querySelectorAll(`.animTextareaPanel`)[e.currentTarget.getAttribute('data-page')].classList.add('show');

                                                var sections = document.querySelectorAll(`[data-type="${options.type}"] .custom .animPageCircleButton`);
                                                for (i = 0; i < sections.length; i++) sections[i].classList.remove('enabled');

                                                e.currentTarget.classList.add('enabled');

                                                this.settings[options.class].custom.page = Number(e.currentTarget.getAttribute('data-page'));
                                            }
                                        },
                                        i + 1
                                    )
                                );
                            };


                        }

                        var result = React.createElement('div',
                            {
                                class: `animPreviewsPanel ${options.horizontal ? 'horizontal' : 'vertical'}`,
                                'data-type': options.type
                            },
                            [
                                options.custom ? React.createElement('div',
                                    {
                                        class: 'animPreviewsActions'
                                    },
                                    React.createElement('div',
                                        {
                                            class: `animPreviewActionButton ${this.settings[options.class].custom.enabled ? 'editing' : 'selecting'}`,
                                            onClick: async (e) => {
                                                this.settings[options.class].custom.enabled = !this.settings[options.class].custom.enabled;
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                this.changeStyles();

                                                var panel = e.currentTarget.closest('.animPreviewsPanel');
                                                var all = panel.querySelectorAll(`.animPreviewsContainer, .animTextareaPanel`);
                                                all.forEach(elem => elem.classList.remove('show'));

                                                if (this.settings[options.class].custom.enabled) {
                                                    e.currentTarget.classList.add('editing')
                                                    e.currentTarget.classList.remove('selecting')
                                                    panel.getElementsByClassName(`animTextareaPanel`)[this.settings[options.class].custom.page].classList.add('show');
                                                    panel.getElementsByClassName('animPageButtons default')[0].classList.remove('show');
                                                    panel.getElementsByClassName('animPageButtons custom')[0].classList.add('show');
                                                } else {
                                                    e.currentTarget.classList.remove('editing')
                                                    e.currentTarget.classList.add('selecting')
                                                    panel.getElementsByClassName(`animPreviewsContainer`)[this.settings[options.class].page].classList.add('show');
                                                    panel.getElementsByClassName('animPageButtons default')[0].classList.add('show');
                                                    panel.getElementsByClassName('animPageButtons custom')[0].classList.remove('show');
                                                }
                                            }
                                        },

                                        React.createElement('div',
                                            {
                                                class: 'switchActionButton'
                                            },
                                            [
                                                React.createElement('div', {
                                                    class: 'switchActionButtonLabel'
                                                },
                                                    TEMPS.LABELS.PREVIEW_SELECTING
                                                ),
                                                React.createElement("svg", {
                                                    width: "24",
                                                    height: "24",
                                                    viewBox: "3 2 19 19"
                                                },
                                                    React.createElement("path", {
                                                        style: { fill: "none" },
                                                        d: "M0 0h24v24H0z"
                                                    }),
                                                    React.createElement("path", {
                                                        d: options.horizontal ? "M 4 18 h 17 v -3 H 4 v 3 z M 4 10 v 3 h 17 v -3 h -17 M 4 5 v 3 h 17 V 5 H 4 z" : "M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"
                                                    })
                                                )
                                            ]
                                        ),
                                        React.createElement('div',
                                            {
                                                class: 'switchActionButton'
                                            },
                                            [
                                                React.createElement('div', {
                                                    class: 'switchActionButtonLabel'
                                                },
                                                    TEMPS.LABELS.PREVIEW_EDITING
                                                ),
                                                React.createElement("svg", {
                                                    width: "24",
                                                    height: "24",
                                                    viewBox: "0 1 22 22"
                                                },
                                                    React.createElement("path", {
                                                        d: "M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z",
                                                    })
                                                )
                                            ]
                                        )
                                    )
                                ) : null,
                                ...containers,
                                ...textareas,
                                containers.length > 1 ?
                                    React.createElement('div',
                                        {
                                            class: `animPageButtons default ${options.custom ? (!this.settings[options.class].custom.enabled ? 'show' : '') : 'show'}`,
                                        },
                                        swipeButtonsDefault
                                    ) : null,
                                React.createElement('div',
                                    {
                                        class: `animPageButtons custom ${options.custom ? (this.settings[options.class].custom.enabled ? 'show' : '') : 'show'}`,
                                    },
                                    swipeButtonsCustom
                                ),
                            ])


                        class Panel extends React.Component {
                            render() {
                                return result
                            }
                        }

                        return {class: Panel, render: result};
                    }

                    /**
                     * any
                     */

                    var TabsPanel = (tabsTemp = [], options={}) => {

                        var tabsNodes = [];
                        var contentNodes = [];

                        tabsTemp.forEach((tab, index)=>{
                            tabsNodes.push(
                                React.createElement('div',
                                    {
                                        'data-index': index,
                                        class: `animTab`,
                                        onClick: (e)=>{
                                            var tab = e.currentTarget;
                                            var panel = tab.closest('.animTabsPanel');

                                            panel.querySelectorAll(`.animTab:not([data-index="${index}"])`).forEach(
                                                (content) => {
                                                    content.classList.remove('selected')
                                                }
                                            );                                            
                                            panel.querySelectorAll(`.animContent:not([data-index="${index}"])`).forEach(
                                                (content) => {
                                                    content.classList.remove('show')
                                                }
                                            );
                                            panel.querySelector(`.animTab[data-index="${index}"]`).classList.toggle('selected')
                                            panel.querySelector(`.animContent[data-index="${index}"]`).classList.toggle('show')
                                        }
                                    },
                                    tab.name
                                )
                            )
                            contentNodes.push(
                                React.createElement('div',
                                    {
                                        'data-index': index,
                                        class: `animContent`
                                    },
                                    tab.content
                                )
                            )
                        })

                        var result = React.createElement('div', {
                            style: {
                                margin: options.margin ?? null,
                                padding: options.padding ?? null
                            },
                            class: `animTabsPanel ${options.class}`
                        },
                            [
                                React.createElement('div',
                                    {
                                        class: 'animTabsContainer'
                                    },
                                    tabsNodes
                                ),

                                React.createElement('div',
                                    {
                                        class: 'animContentsContainer'
                                    },
                                    contentNodes
                                ),
                            ]
                        )

                        class Panel extends React.Component {
                            render() {
                                return result
                            }
                        }

                        return {class: Panel, render: result}
                    }

                    /**
                     * SettingsField.
                     */

                    var Field = (title, note, settingstype) => {

                        var result = React.createElement('div',
                            {
                                class: 'animField'
                            },
                            [
                                React.createElement('div', {class: 'animFieldDivider'}),
                                React.createElement('div', {class: 'animFieldTitle'}, title),
                                React.createElement('div', {class: 'animFieldNote'}, note),
                                settingstype
                            ]
                        )

                        class Field extends React.Component {
                            render() {
                                return result
                            }
                        }

                        return {class: Field, render: result}
                    }

                    setTimeout(()=>{
                        Tooltip.create(document.getElementById('animations-version-changelog'), TEMPS.TOOLTIPS.BUTTON_ANIMATIONS_VERSION_CHANGELOG)
                        Tooltip.create(document.getElementById('animations-version-check'), TEMPS.TOOLTIPS.BUTTON_ANIMATIONS_VERSION_CHECK)

                        Tooltip.create(document.getElementById('animations-reset'), TEMPS.TOOLTIPS.BUTTON_ANIMATIONS_RESET)
                        Tooltip.create(document.getElementById('animations-rebuild'), TEMPS.TOOLTIPS.BUTTON_ANIMATIONS_REBUILD)

                        Tooltip.create(document.getElementById('animations-issues'), TEMPS.TOOLTIPS.BUTTON_ANIMATIONS_ISSUES)
                        Tooltip.create(document.getElementById('animations-discussions'), TEMPS.TOOLTIPS.BUTTON_ANIMATIONS_DISCUSSIONS)

                        Tooltip.create(document.getElementById('lists-switch-button'), TEMPS.TOOLTIPS.BUTTON_LISTS_SWITCH)
                        Tooltip.create(document.getElementById('buttons-switch-button'), TEMPS.TOOLTIPS.BUTTON_BUTTONS_SWITCH)
                        Tooltip.create(document.getElementById('messages-switch-button'), TEMPS.TOOLTIPS.BUTTON_MESSAGES_SWITCH)
                        Tooltip.create(document.getElementById('popouts-switch-button'), TEMPS.TOOLTIPS.BUTTON_POPOUTS_SWITCH)

                        Tooltip.create(document.getElementById('animations-reset-lists'), TEMPS.TOOLTIPS.BUTTON_RESET_LISTS)
                        Tooltip.create(document.getElementById('animations-reset-buttons'), TEMPS.TOOLTIPS.BUTTON_RESET_BUTTONS)
                        Tooltip.create(document.getElementById('animations-reset-messages'), TEMPS.TOOLTIPS.BUTTON_RESET_MESSAGES)
                        Tooltip.create(document.getElementById('animations-reset-popouts'), TEMPS.TOOLTIPS.BUTTON_RESET_POPOUTS)

                        Tooltip.create(document.getElementById('lists-selectors-default'), TEMPS.TOOLTIPS.BUTTON_SELECTORS_LISTS_DEFAULT)
                        Tooltip.create(document.getElementById('lists-selectors-clear'), TEMPS.TOOLTIPS.BUTTON_SELECTORS_LISTS_CLEAR)
                        Tooltip.create(document.getElementById('buttons-selectors-default'), TEMPS.TOOLTIPS.BUTTON_SELECTORS_BUTTONS_DEFAULT)
                        Tooltip.create(document.getElementById('buttons-selectors-clear'), TEMPS.TOOLTIPS.BUTTON_SELECTORS_BUTTONS_CLEAR)
                        Tooltip.create(document.getElementById('popouts-selectors-default'), TEMPS.TOOLTIPS.BUTTON_SELECTORS_POPOUTS_DEFAULT)
                        Tooltip.create(document.getElementById('popouts-selectors-clear'), TEMPS.TOOLTIPS.BUTTON_SELECTORS_POPOUTS_CLEAR)
                    }, 500)

                    var settings_panel =
                    Settings.SettingPanel.build(
                        this.saveSettings.bind(this),

                        new Settings.SettingField(null, null, null,
                            ElementsPanel(
                            [
                                {
                                    elements: [
                                        {
                                            component: 'button',
                                            color: 'blurple',
                                            label: TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHANGELOG,
                                            svgPaths: [
                                                'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
                                            ],
                                            id: 'animations-version-changelog',
                                            inverted: false,
                                            onclick: (e) => {
                                                Modals.showChangelogModal(this.getName(), this.getVersion(), config.changelog)
                                            }
                                        },
                                        {
                                            component: 'button',
                                            color: 'blurple',
                                            label: TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK,
                                            svgPaths: [
                                                'M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z',
                                            ],
                                            id: 'animations-version-check',
                                            inverted: false,
                                            onclick: (e) => {
                                                let button = e.currentTarget;

                                                button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_SEARCHING;

                                                const Http = new XMLHttpRequest();
                                                Http.open("GET", 'https://api.github.com/repos/Mopsgamer/BetterDiscord-codes/contents/plugins/Animations/Animations.plugin.js');
                                                Http.send();

                                                Http.timeout = 5000;
                                                Http.ontimeout = function (e) {
                                                    button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_TIMEOUT;
                                                    button.classList.remove('blurple')
                                                    button.classList.add('red')
                                                };

                                                Http.onreadystatechange = (e) => {
                                                    if (e.currentTarget.readyState != 4) return

                                                    if (!Http.responseText) {
                                                        button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_ERROR;
                                                        button.classList.remove('blurple')
                                                        button.classList.add('red')
                                                        return
                                                    }

                                                    var responseCode = JSON.parse(Http.responseText);
                                                    var fromBinary = (encoded) => {
                                                        return decodeURIComponent(atob(encoded).split('').map(function(c) {
                                                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                                                        }).join(''));
                                                    }
                                                    var GitHubFileText = fromBinary(responseCode.content);
                                                    var GitHubVersion = (/(\d+\.)*\d+/).exec((/^.*@version\s+(\d+\.)\d+.*$/m).exec(GitHubFileText))[0]

                                                    function newerVersion(v1, v2) {
                                                        var v1Dots = v1.match(/\./g).length
                                                        var v2Dots = v2.match(/\./g).length
                                                        const newParts = v1.split('.')
                                                        const oldParts = v2.split('.')

                                                        for (var i = 0; i < (v1Dots > v2Dots ? v1Dots : v2Dots) + 1; i++) {
                                                            const a = parseInt(newParts[i]) || 0
                                                            const b = parseInt(oldParts[i]) || 0
                                                            if (a > b) return v1
                                                            if (a < b) return v2
                                                        }
                                                        return false
                                                    }

                                                    var UpdatePlugin = () => {
                                                        return new Promise((rs, rj)=>{
                                                            try {
                                                                var fs = require('fs');
                                                                var path = require('path');
                                                                fs.writeFile(path.join(BdApi.Plugins.folder, __filename), GitHubFileText, rs)
                                                            } catch(error) {
                                                                rj(error)
                                                            }
                                                        })
                                                    }

                                                    switch (newerVersion(GitHubVersion, this.getVersion())) {
                                                        case GitHubVersion:
                                                            button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_OLDER(GitHubVersion)
                                                            button.classList.remove('blurple')
                                                            button.classList.add('green')
                                                            button.addEventListener('click',
                                                                () => {
                                                                    BdApi.showConfirmationModal(TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_TITLE,
                                                                        [
                                                                            TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_COMPARE(this.getVersion(), GitHubVersion),
                                                                            React.createElement(
                                                                                'span', { style: { color: this.colors.green, 'text-transform': 'uppercase' } },
                                                                                TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_OLDER_NOTE
                                                                            )
                                                                        ],
                                                                        {
                                                                            onConfirm() {
                                                                                UpdatePlugin()
                                                                            }
                                                                        })
                                                                },
                                                                { once: true }
                                                            )
                                                            break;
                                                        case this.getVersion():
                                                            button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_NEWER(this.getVersion())
                                                            button.classList.remove('blurple')
                                                            button.classList.add('grey')
                                                            button.addEventListener('click',
                                                                () => {
                                                                    BdApi.showConfirmationModal(TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_TITLE,
                                                                        [
                                                                            TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_COMPARE(this.getVersion(), GitHubVersion),
                                                                            React.createElement(
                                                                                'span', { style: { color: this.colors.red, 'text-transform': 'uppercase' } },
                                                                                TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_NEWER_NOTE
                                                                            )
                                                                        ],
                                                                        {
                                                                            onConfirm() {
                                                                                UpdatePlugin()
                                                                            }
                                                                        })
                                                                },
                                                                { once: true }
                                                            )
                                                            break;
                                                        case false:
                                                            button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_LATEST(this.getVersion())
                                                            button.classList.remove('blurple')
                                                            button.classList.add('grey')
                                                            button.addEventListener('click',
                                                                () => {
                                                                    BdApi.showConfirmationModal(TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_TITLE,
                                                                        [
                                                                            TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_COMPARE(this.getVersion(), GitHubVersion),
                                                                            React.createElement(
                                                                                'span', { style: { color: this.colors.yellow, 'text-transform': 'uppercase' } },
                                                                                TEMPS.LABELS.BUTTON_ANIMATIONS_VERSION_CHECK_CONFIRM_LATEST_NOTE
                                                                            )
                                                                        ],
                                                                        {
                                                                            onConfirm() {
                                                                                UpdatePlugin()
                                                                            }
                                                                        })
                                                                },
                                                                { once: true }
                                                            )
                                                            break;

                                                        default:
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                },
                                {
                                    elements: [
                                        {
                                            component: 'button',
                                            color: 'blurple',
                                            label: TEMPS.LABELS.BUTTON_ANIMATIONS_RESET,
                                            id: 'animations-reset',
                                            svgView: '0 0 20 20',
                                            svgPaths: [
                                                'M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
                                            ],
                                            onclick: async (e) => {

                                                let button = e.currentTarget;
                                                button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_RESET_RESETING;
                                                await this.wait(500);

                                                PluginUtilities.saveSettings(this.getName(), this.defaultSettings);
                                                this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                this.changeStyles();
                                                this.closeSettings();
                                            }
                                        },
                                        {
                                            component: 'button',
                                            color: 'blurple',
                                            label: TEMPS.LABELS.BUTTON_ANIMATIONS_REBUILD,
                                            id: 'animations-rebuild',
                                            svgPaths: [
                                                'M 13 3 c -4.97 0 -9 4.03 -9 9 H 1 l 3.89 3.89 l 0.07 0.14 L 9 12 H 6 c 0 -3.87 3.13 -7 7 -7 s 7 3.13 7 7 s -3.13 7 -7 7 c -1.93 0 -3.68 -0.79 -4.94 -2.06 l -1.42 1.42 C 8.27 19.99 10.51 21 13 21 c 4.97 0 9 -4.03 9 -9 s -4.03 -9 -9 -9 z',
                                            ],
                                            onclick: (e) => this.changeStyles()
                                        }
                                    ],
                                },
                                {
                                    elements: [
                                        {
                                            component: 'button',
                                            label: TEMPS.LABELS.BUTTON_ANIMATIONS_ISSUES,
                                            color: 'grey',
                                            id: 'animations-issues',
                                            svgPaths: [
                                                'm12 .5c-6.63 0-12 5.28-12 11.792 0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56 4.801-1.548 8.236-5.97 8.236-11.173 0-6.512-5.373-11.792-12-11.792z',
                                            ],
                                            onclick: (e) => {
                                                window.open('https://github.com/Mopsgamer/BetterDiscord-codes/issues')
                                            }
                                        },
                                        {
                                            component: 'button',
                                            label: TEMPS.LABELS.BUTTON_ANIMATIONS_DISCUSSIONS,
                                            color: 'grey',
                                            id: 'animations-discussions',
                                            svgPaths: [
                                                'm12 .5c-6.63 0-12 5.28-12 11.792 0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56 4.801-1.548 8.236-5.97 8.236-11.173 0-6.512-5.373-11.792-12-11.792z',
                                            ],
                                            onclick: (e) => {
                                                window.open('https://github.com/Mopsgamer/BetterDiscord-codes/discussions')
                                            }
                                        }
                                    ],
                                },
                                {
                                    elements: [
                                        {
                                            component: 'button',
                                            color: this.settings.lists.enabled ? 'green' : 'red',
                                            label: TEMPS.LABELS.BUTTON_LISTS_SWITCH,
                                            id: 'lists-switch-button',
                                            onclick: async (e) => {

                                                let button = e.currentTarget

                                                button.getElementsByTagName('span')[0].innerText = '...'

                                                this.settings.lists.enabled = !this.settings.lists.enabled;
                                                if (!this.settings.lists.enabled) {
                                                    button.classList.remove('green')
                                                    button.classList.add('red')
                                                } else {
                                                    button.classList.remove('red')
                                                    button.classList.add('green')
                                                }
                                                await this.changeStyles();
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_LISTS_SWITCH;
                                            }
                                        },
                                        {
                                            component: 'button',
                                            color: this.settings.buttons.enabled ? 'green' : 'red',
                                            label: TEMPS.LABELS.BUTTON_BUTTONS_SWITCH,
                                            id: 'buttons-switch-button',
                                            onclick: async (e) => {

                                                let button = e.currentTarget

                                                button.getElementsByTagName('span')[0].innerText = '...'

                                                this.settings.buttons.enabled = !this.settings.buttons.enabled;
                                                if (!this.settings.buttons.enabled) {
                                                    button.classList.remove('green')
                                                    button.classList.add('red')
                                                } else {
                                                    button.classList.remove('red')
                                                    button.classList.add('green')
                                                }
                                                await this.changeStyles();
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_BUTTONS_SWITCH;
                                            }
                                        },
                                        {
                                            component: 'button',
                                            color: this.settings.messages.enabled ? 'green' : 'red',
                                            label: TEMPS.LABELS.BUTTON_MESSAGES_SWITCH,
                                            id: 'messages-switch-button',
                                            onclick: async (e) => {

                                                let button = e.currentTarget

                                                button.getElementsByTagName('span')[0].innerText = '...'

                                                this.settings.messages.enabled = !this.settings.messages.enabled;
                                                if (!this.settings.messages.enabled) {
                                                    button.classList.remove('green')
                                                    button.classList.add('red')
                                                } else {
                                                    button.classList.remove('red')
                                                    button.classList.add('green')
                                                }
                                                await this.changeStyles();
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_MESSAGES_SWITCH;
                                            }
                                        },
                                        {
                                            component: 'button',
                                            color: this.settings.popouts.enabled ? 'green' : 'red',
                                            label: TEMPS.LABELS.BUTTON_POPOUTS_SWITCH,
                                            id: 'popouts-switch-button',
                                            onclick: async (e) => {

                                                let button = e.currentTarget

                                                button.getElementsByTagName('span')[0].innerText = '...'

                                                this.settings.popouts.enabled = !this.settings.popouts.enabled;
                                                if (!this.settings.popouts.enabled) {
                                                    button.classList.remove('green')
                                                    button.classList.add('red')
                                                } else {
                                                    button.classList.remove('red')
                                                    button.classList.add('green')
                                                }
                                                await this.changeStyles();
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_POPOUTS_SWITCH;
                                            }
                                        }
                                    ]
                                }
                            ],
                                {
                                    widthAll: '100%',
                                    align: 'space-between'
                                }).class
                        ),

                        new Settings.SettingField(null, null, null,

                            TabsPanel([
                                {
                                    name: TEMPS.LABELS.GROUP_LISTS,
                                    content: [
                                        Field(null, null,
                                            ElementsPanel(
                                                [
                                                    {
                                                        elements: [
                                                            {
                                                                component: 'button',
                                                                color: 'blurple',
                                                                label: TEMPS.LABELS.BUTTON_RESET_LISTS,
                                                                id: 'animations-reset-lists',
                                                                svgView: '0 0 20 20',
                                                                svgPaths: [
                                                                    'M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
                                                                ],
                                                                onclick: async (e) => {
                    
                                                                    let button = e.currentTarget;
                                                                    button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_RESET_RESETING;
                                                                    await this.wait(500);
                    
                                                                    this.settings.lists = this.defaultSettings.lists
                                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                                    this.changeStyles();
                                                                    this.closeSettings();
                                                                },
                                                            }
                                                        ],
                                                        options: {
                                                            widthAll: '100%',
                                                            align: 'space-between'
                                                        }
                                                    }
                                                ]
                                            ).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_NAME, TEMPS.LABELS.FIELD_LISTS_NAME_NOTE(this.defaultSettings.lists.name),
                                            PreviewsPanel([
                                                { label: TEMPS.LABELS.PREVIEW_IN, value: 'in' },
                                                { label: TEMPS.LABELS.PREVIEW_OUT, value: 'out' },
                                                { label: TEMPS.LABELS.PREVIEW_CIRCLE, value: 'circle' },
                                                { label: TEMPS.LABELS.PREVIEW_POLYGON, value: 'polygon' },
                                                { label: TEMPS.LABELS.PREVIEW_OPACITY, value: 'opacity' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIME, value: 'slime' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_RIGHT, value: 'brick-right' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_LEFT, value: 'brick-left' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_UP, value: 'brick-up' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_DOWN, value: 'brick-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_RIGHT, value: 'slide-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_LEFT, value: 'slide-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP, value: 'slide-up' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN, value: 'slide-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_RIGHT, value: 'slide-up-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_LEFT, value: 'slide-up-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_RIGHT, value: 'slide-down-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_LEFT, value: 'slide-down-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_RIGHT, value: 'skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_LEFT, value: 'skew-left' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_RIGHT, value: 'wide-skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_LEFT, value: 'wide-skew-left' },
                                            ], {
                                                type: 'lists-name',
                                                class: 'lists',
                                                custom: {
                                                    data: this.settings.lists.custom,
                                                }
                                            },
                                                this.settings.lists.name, (e) => {
                                                    this.settings.lists.name = e.value;
                                                    this.settings.lists.page = e.page;
                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                    this.changeStyles()
                                            }).render,
                                            { noteOnTop: true }
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_SEQUENCE, TEMPS.LABELS.FIELD_LISTS_SEQUENCE_NOTE(this.defaultSettings.lists.sequence),
                                            PreviewsPanel([
                                                { label: TEMPS.LABELS.PREVIEW_VERTICAL_FROM_FIRST, value: 'fromFirst' },
                                                { label: TEMPS.LABELS.PREVIEW_VERTICAL_FROM_LAST, value: 'fromLast' },
                                            ], {
                                                type: 'lists-sequence'
                                            }, this.settings.lists.sequence, (e) => {
                                                this.settings.lists.sequence = e.value;
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                this.changeStyles()
                                            }).render,
                                            { noteOnTop: true }
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_DELAY, TEMPS.LABELS.FIELD_LISTS_DELAY_NOTE(this.defaultSettings.lists.delay),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.lists.delay,
                                                            max: 0.35,
                                                            step: 0.01,
                                                            type: 'number',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.lists.delay = value;
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_LIMIT, TEMPS.LABELS.FIELD_LISTS_LIMIT_NOTE(this.defaultSettings.lists.limit),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.lists.limit,
                                                            max: 100,
                                                            step: 5,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.lists.limit = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_DURATION, TEMPS.LABELS.FIELD_LISTS_DURATION_NOTE(this.defaultSettings.lists.duration),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.lists.duration,
                                                            max: 3,
                                                            step: 0.1,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.lists.duration = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
                                    ]
                                },
                                {
                                    name: TEMPS.LABELS.GROUP_BUTTONS,
                                    content: [
                                        Field(null, null,
                                            ElementsPanel(
                                                [
                                                    {
                                                        elements: [
                                                            {
                                                                component: 'button',
                                                                color: 'blurple',
                                                                label: TEMPS.LABELS.BUTTON_RESET_BUTTONS,
                                                                id: 'animations-reset-buttons',
                                                                svgView: '0 0 20 20',
                                                                svgPaths: [
                                                                    'M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
                                                                ],
                                                                onclick: async (e) => {
                    
                                                                    let button = e.currentTarget;
                                                                    button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_RESET_RESETING;
                                                                    await this.wait(500);
                    
                                                                    this.settings.buttons = this.defaultSettings.buttons
                                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                                    this.changeStyles();
                                                                    this.closeSettings();
                                                                },
                                                            }
                                                        ],
                                                        options: {
                                                            widthAll: '100%',
                                                            align: 'space-between'
                                                        }
                                                    }
                                                ]
                                            ).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_NAME, TEMPS.LABELS.FIELD_BUTTONS_NAME_NOTE(this.defaultSettings.buttons.name),
                                            PreviewsPanel([
                                                { label: TEMPS.LABELS.PREVIEW_IN, value: 'in' },
                                                { label: TEMPS.LABELS.PREVIEW_OUT, value: 'out' },
                                                { label: TEMPS.LABELS.PREVIEW_CIRCLE, value: 'circle' },
                                                { label: TEMPS.LABELS.PREVIEW_POLYGON, value: 'polygon' },
                                                { label: TEMPS.LABELS.PREVIEW_OPACITY, value: 'opacity' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIME, value: 'slime' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_RIGHT, value: 'brick-right' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_LEFT, value: 'brick-left' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_UP, value: 'brick-up' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_DOWN, value: 'brick-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_RIGHT, value: 'slide-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_LEFT, value: 'slide-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP, value: 'slide-up' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN, value: 'slide-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_RIGHT, value: 'slide-up-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_LEFT, value: 'slide-up-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_RIGHT, value: 'slide-down-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_LEFT, value: 'slide-down-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_RIGHT, value: 'skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_LEFT, value: 'skew-left' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_RIGHT, value: 'wide-skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_LEFT, value: 'wide-skew-left' },
                                            ], {
                                                type: 'buttons-name',
                                                class: 'buttons',
                                                horizontal: true,
                                                custom: {
                                                    data: this.settings.buttons.custom,
                                                }
                                            },
                                                this.settings.buttons.name, (e) => {
                                                    this.settings.buttons.name = e.value;
                                                    this.settings.buttons.page = e.page;
                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                    this.changeStyles()
                                            }).render,
                                            { noteOnTop: true }
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_SEQUENCE, TEMPS.LABELS.FIELD_BUTTONS_SEQUENCE_NOTE(this.defaultSettings.buttons.sequence),
                                            PreviewsPanel([
                                                { label: TEMPS.LABELS.PREVIEW_HORIZONTAL_FROM_FIRST, value: 'fromFirst' },
                                                { label: TEMPS.LABELS.PREVIEW_HORIZONTAL_FROM_LAST, value: 'fromLast' },
                                            ], {
                                                type: 'buttons-sequence',
                                                horizontal: true
                                            }, this.settings.buttons.sequence, (e) => {
                                                this.settings.buttons.sequence = e.value;
                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                this.changeStyles()
                                            }).render,
                                            { noteOnTop: true }
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_DELAY, TEMPS.LABELS.FIELD_BUTTONS_DELAY_NOTE(this.defaultSettings.buttons.delay),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.buttons.delay,
                                                            max: 0.5,
                                                            step: 0.01,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.buttons.delay = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_DURATION, TEMPS.LABELS.FIELD_BUTTONS_DURATION_NOTE(this.defaultSettings.buttons.duration),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.buttons.duration,
                                                            max: 3,
                                                            step: 0.1,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.buttons.duration = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
                                    ]
                                },
                                {
                                    name: TEMPS.LABELS.GROUP_MESSAGES,
                                    content: [
                                        Field(null, null,
                                            ElementsPanel(
                                                [
                                                    {
                                                        elements: [
                                                            {
                                                                component: 'button',
                                                                color: 'blurple',
                                                                label: TEMPS.LABELS.BUTTON_RESET_MESSAGES,
                                                                id: 'animations-reset-messages',
                                                                svgView: '0 0 20 20',
                                                                svgPaths: [
                                                                    'M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
                                                                ],
                                                                onclick: async (e) => {
                    
                                                                    let button = e.currentTarget;
                                                                    button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_RESET_RESETING;
                                                                    await this.wait(500);
                    
                                                                    this.settings.messages = this.defaultSettings.messages
                                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                                    this.changeStyles();
                                                                    this.closeSettings();
                                                                },
                                                            }
                                                        ],
                                                        options: {
                                                            widthAll: '100%',
                                                            align: 'space-between'
                                                        }
                                                    }
                                                ]
                                            ).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_NAME, TEMPS.LABELS.FIELD_MESSAGES_NAME_NOTE(this.defaultSettings.messages.name),
                                            PreviewsPanel([
                                                { label: TEMPS.LABELS.PREVIEW_IN, value: 'in' },
                                                { label: TEMPS.LABELS.PREVIEW_OUT, value: 'out' },
                                                { label: TEMPS.LABELS.PREVIEW_CIRCLE, value: 'circle' },
                                                { label: TEMPS.LABELS.PREVIEW_POLYGON, value: 'polygon' },
                                                { label: TEMPS.LABELS.PREVIEW_OPACITY, value: 'opacity' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIME, value: 'slime' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_RIGHT, value: 'brick-right' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_LEFT, value: 'brick-left' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_UP, value: 'brick-up' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_DOWN, value: 'brick-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_RIGHT, value: 'slide-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_LEFT, value: 'slide-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP, value: 'slide-up' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN, value: 'slide-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_RIGHT, value: 'slide-up-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_LEFT, value: 'slide-up-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_RIGHT, value: 'slide-down-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_LEFT, value: 'slide-down-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_RIGHT, value: 'skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_LEFT, value: 'skew-left' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_RIGHT, value: 'wide-skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_LEFT, value: 'wide-skew-left' },
                                            ], {
                                                type: 'messages-name',
                                                class: 'messages',
                                                custom: {
                                                    data: this.settings.messages.custom,
                                                }
                                            },
                                                this.settings.messages.name, (e) => {
                                                    this.settings.messages.name = e.value;
                                                    this.settings.messages.page = e.page;
                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                    this.changeStyles()
                                            }).render,
                                            { noteOnTop: true }
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_DELAY, TEMPS.LABELS.FIELD_MESSAGES_DELAY_NOTE(this.defaultSettings.messages.delay),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.messages.delay,
                                                            max: 0.5,
                                                            step: 0.01,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.messages.delay = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_LIMIT, TEMPS.LABELS.FIELD_MESSAGES_LIMIT_NOTE(this.defaultSettings.messages.limit),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.messages.limit,
                                                            max: 100,
                                                            step: 1,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.messages.limit = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_DURATION, TEMPS.LABELS.FIELD_MESSAGES_DURATION_NOTE(this.defaultSettings.messages.duration),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.messages.duration,
                                                            max: 3,
                                                            step: 0.01,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.messages.duration = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
                                    ]
                                },
                                {
                                    name: TEMPS.LABELS.GROUP_POPOUTS,
                                    content: [
                                        Field(null, null,
                                            ElementsPanel(
                                                [
                                                    {
                                                        elements: [
                                                            {
                                                                component: 'button',
                                                                color: 'blurple',
                                                                label: TEMPS.LABELS.BUTTON_RESET_POPOUTS,
                                                                id: 'animations-reset-popouts',
                                                                svgView: '0 0 20 20',
                                                                svgPaths: [
                                                                    'M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
                                                                ],
                                                                onclick: async (e) => {
                    
                                                                    let button = e.currentTarget;
                                                                    button.getElementsByTagName('span')[0].innerText = TEMPS.LABELS.BUTTON_ANIMATIONS_RESET_RESETING;
                                                                    await this.wait(500);
                    
                                                                    this.settings.popouts = this.defaultSettings.popouts
                                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                                                                    this.changeStyles();
                                                                    this.closeSettings();
                                                                },
                                                            }
                                                        ],
                                                        options: {
                                                            widthAll: '100%',
                                                            align: 'space-between'
                                                        }
                                                    }
                                                ]
                                            ).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_NAME, TEMPS.LABELS.FIELD_POPOUTS_NAME_NOTE(this.defaultSettings.popouts.name),
                                            PreviewsPanel([
                                                { label: TEMPS.LABELS.PREVIEW_IN, value: 'in' },
                                                { label: TEMPS.LABELS.PREVIEW_OUT, value: 'out' },
                                                { label: TEMPS.LABELS.PREVIEW_CIRCLE, value: 'circle' },
                                                { label: TEMPS.LABELS.PREVIEW_POLYGON, value: 'polygon' },
                                                { label: TEMPS.LABELS.PREVIEW_OPACITY, value: 'opacity' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIME, value: 'slime' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_RIGHT, value: 'brick-right' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_LEFT, value: 'brick-left' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_UP, value: 'brick-up' },
                                                { label: TEMPS.LABELS.PREVIEW_BRICK_DOWN, value: 'brick-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_RIGHT, value: 'slide-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_LEFT, value: 'slide-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP, value: 'slide-up' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN, value: 'slide-down' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_RIGHT, value: 'slide-up-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_UP_LEFT, value: 'slide-up-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_RIGHT, value: 'slide-down-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SLIDE_DOWN_LEFT, value: 'slide-down-left' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_RIGHT, value: 'skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_SKEW_LEFT, value: 'skew-left' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_RIGHT, value: 'wide-skew-right' },
                                                { label: TEMPS.LABELS.PREVIEW_WIDE_SKEW_LEFT, value: 'wide-skew-left' },
                                            ], {
                                                type: 'popouts-name',
                                                class: 'popouts',
                                                horizontal: false,
                                                tempBlocks: {
                                                    count: 1,
                                                    height: '36%'
                                                },
                                                custom: {
                                                    data: this.settings.popouts.custom,
                                                }
                                            },
                                                this.settings.popouts.name, (e) => {
                                                    this.settings.popouts.name = e.value;
                                                    this.settings.popouts.page = e.page;
                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                    this.changeStyles()
                                            }).render,
                                            { noteOnTop: true }
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_DURATION, TEMPS.LABELS.FIELD_POPOUTS_DURATION_NOTE(this.defaultSettings.popouts.duration),
                                            ElementsPanel([
                                                {
                                                    elements: [
                                                        {
                                                            component: 'input',
                                                            value: this.settings.popouts.duration,
                                                            max: 3,
                                                            step: 0.01,
                                                            type: 'integer',
                                                            onchange: (e) => {
                                                                var value = Number(e.currentTarget.value);
            
                                                                this.settings.popouts.duration = Math.floor(value);
                                                                PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                this.changeStyles()
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]).render
                                        ).render,
                                    ]
                                },
                                {
                                    name: TEMPS.LABELS.GROUP_ADVANCED,
                                    content: [
                                        Field(TEMPS.LABELS.FIELD_LISTS_SELECTORS, TEMPS.LABELS.FIELD_LISTS_SELECTORS_NOTE,
                                            TextareaPanel({
                                                elementsPanel: {
                                                    containersTemp: [
                                                        {
                                                            elements: [
                                                                {
                                                                    component: 'button',
                                                                    label: TEMPS.LABELS.BUTTON_SELECTORS_LISTS_DEFAULT,
                                                                    id: 'lists-selectors-default',
                                                                    svgPaths: [
                                                                        'M 13 3 c -4.97 0 -9 4.03 -9 9 H 1 l 3.89 3.89 l 0.07 0.14 L 9 12 H 6 c 0 -3.87 3.13 -7 7 -7 s 7 3.13 7 7 s -3.13 7 -7 7 c -1.93 0 -3.68 -0.79 -4.94 -2.06 l -1.42 1.42 C 8.27 19.99 10.51 21 13 21 c 4.97 0 9 -4.03 9 -9 s -4.03 -9 -9 -9 z',
                                                                    ],
                                                                    onclick: (e) => {
                                                                        var textarea = e.currentTarget.closest('.animTextareaPanel').querySelector('.animTextarea')
                                                                        textarea.value = Animations.selectorsLists.join(',\n\n')
                                                                        textarea.style.color = '';
            
                                                                        this.settings.lists.selectors = '';
                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    }
                                                                },
                                                                {
                                                                    component: 'button',
                                                                    label: TEMPS.LABELS.BUTTON_SELECTORS_LISTS_CLEAR,
                                                                    id: 'lists-selectors-clear',
                                                                    onclick: (e) => {
                                                                        var textarea = e.currentTarget.closest('.animTextareaPanel').querySelector('.animTextarea')
                                                                        textarea.value = '';
                                                                        textarea.focus();
                                                                    }
                                                                },
                                                            ]
                                                        }
                                                    ],
                                                    options: {
                                                        widthAll: '100%'
                                                    }
                                                }
                                            },
                                            this.settings.lists.selectors ? this.settings.lists.selectors : Animations.selectorsLists.join(',\n\n'),
                                            (e) => {
                                                var textarea = e.currentTarget;
                                                var value = textarea.value;
            
                                                if(value=='' || this.isValidSelector(value)) {
                                                    this.settings.lists.selectors = (value==Animations.selectorsLists?'':value)
                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                    this.changeStyles()
                                                    textarea.style.color = ''
                                                } else {
                                                    textarea.style.color = this.colors.red
                                                }
                                            }
                                            ).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_BUTTONS_SELECTORS, TEMPS.LABELS.FIELD_BUTTONS_SELECTORS_NOTE,
                                            TextareaPanel({
                                                elementsPanel: {
                                                    containersTemp: [
                                                        {
                                                            elements: [
                                                                {
                                                                    component: 'button',
                                                                    label: TEMPS.LABELS.BUTTON_SELECTORS_BUTTONS_DEFAULT,
                                                                    id: 'buttons-selectors-default',
                                                                    svgPaths: [
                                                                        'M 13 3 c -4.97 0 -9 4.03 -9 9 H 1 l 3.89 3.89 l 0.07 0.14 L 9 12 H 6 c 0 -3.87 3.13 -7 7 -7 s 7 3.13 7 7 s -3.13 7 -7 7 c -1.93 0 -3.68 -0.79 -4.94 -2.06 l -1.42 1.42 C 8.27 19.99 10.51 21 13 21 c 4.97 0 9 -4.03 9 -9 s -4.03 -9 -9 -9 z',
                                                                    ],
                                                                    onclick: (e) => {
                                                                        var textarea = e.currentTarget.closest('.animTextareaPanel').querySelector('.animTextarea')
                                                                        textarea.value = Animations.selectorsButtons.join(',\n\n')
                                                                        textarea.style.color = '';
            
                                                                        this.settings.lists.selectors = '';
                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    }
                                                                },
                                                                {
                                                                    component: 'button',
                                                                    label: TEMPS.LABELS.BUTTON_SELECTORS_BUTTONS_CLEAR,
                                                                    id: 'buttons-selectors-clear',
                                                                    onclick: (e) => {
                                                                        var textarea = e.currentTarget.closest('.animTextareaPanel').querySelector('.animTextarea')
                                                                        textarea.value = '';
                                                                        textarea.focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    options: {
                                                        widthAll: '100%'
                                                    }
                                                }
                                            },
                                            this.settings.buttons.selectors ? this.settings.buttons.selectors : Animations.selectorsButtons.join(',\n\n'),
                                            (e) => {
                                                var textarea = e.currentTarget;
                                                var value = textarea.value;
            
                                                if(value=='' || this.isValidSelector(value)) {
                                                    this.settings.buttons.selectors = (value==Animations.selectorsButtons?'':value)
                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                    this.changeStyles()
                                                    textarea.style.color = ''
                                                } else {
                                                    textarea.style.color = this.colors.red
                                                }
                                            }
                                            ).render
                                        ).render,
            
                                        Field(TEMPS.LABELS.FIELD_POPOUTS_SELECTORS, TEMPS.LABELS.FIELD_POPOUTS_SELECTORS_NOTE,
                                            TextareaPanel({
                                                elementsPanel: {
                                                    containersTemp: [
                                                        {
                                                            elements: [
                                                                {
                                                                    component: 'button',
                                                                    label: TEMPS.LABELS.BUTTON_SELECTORS_POPOUTS_DEFAULT,
                                                                    id: 'popouts-selectors-default',
                                                                    svgPaths: [
                                                                        'M 13 3 c -4.97 0 -9 4.03 -9 9 H 1 l 3.89 3.89 l 0.07 0.14 L 9 12 H 6 c 0 -3.87 3.13 -7 7 -7 s 7 3.13 7 7 s -3.13 7 -7 7 c -1.93 0 -3.68 -0.79 -4.94 -2.06 l -1.42 1.42 C 8.27 19.99 10.51 21 13 21 c 4.97 0 9 -4.03 9 -9 s -4.03 -9 -9 -9 z',
                                                                    ],
                                                                    onclick: (e) => {
                                                                        var textarea = e.currentTarget.closest('.animTextareaPanel').querySelector('.animTextarea')
                                                                        textarea.value = Animations.selectorsPopouts.join(',\n\n')
                                                                        textarea.style.color = '';
            
                                                                        this.settings.lists.selectors = '';
                                                                        PluginUtilities.saveSettings(this.getName(), this.settings);
                                                                    }
                                                                },
                                                                {
                                                                    component: 'button',
                                                                    label: TEMPS.LABELS.BUTTON_SELECTORS_POPOUTS_CLEAR,
                                                                    id: 'popouts-selectors-clear',
                                                                    onclick: (e) => {
                                                                        var textarea = e.currentTarget.closest('.animTextareaPanel').querySelector('.animTextarea')
                                                                        textarea.value = '';
                                                                        textarea.focus();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    options: {
                                                        widthAll: '100%'
                                                    },
                                                },
                                                textarea: {
                                                    height: '92px'
                                                },
                                            },
                                            this.settings.popouts.selectors ? this.settings.popouts.selectors : Animations.selectorsPopouts.join(',\n\n'),
                                            (e) => {
                                                var textarea = e.currentTarget;
                                                var value = textarea.value;
            
                                                if(value=='' || this.isValidSelector(value)) {
                                                    this.settings.popouts.selectors = (value==Animations.selectorsPopouts?'':value)
                                                    PluginUtilities.saveSettings(this.getName(), this.settings);
                                                    this.changeStyles()
                                                    textarea.style.color = ''
                                                } else {
                                                    textarea.style.color = this.colors.red
                                                }
                                            },
                                            ).render
                                        ).render,
                                    ]
                                },
                            ]).class
                        ),
                    )

                    return settings_panel
                }

                start() {
                    this.CompStyles =
                    `/*components*/

                    .animFieldDivider {
                        width: 100%;
                    }

                    .animFieldDivider:not(.animField:first-child > *) {
                        width: 100%;
                        height: 1px;
                        border-top: thin solid var(--background-modifier-accent);
                        margin: 20px 0;
                    }

                    .animFieldNote {
                        color: var(--header-secondary);
                        font-size: 14px;
                        line-height: 20px;
                        font-weight: 400;
                    }

                    .animFieldTitle {
                        color: var(--header-secondary);
                        margin-bottom: 8px;
                        font-size: 12px;
                        line-height: 16px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }

                    .animTab {
                        display: inline-block;
                        padding: 16px 20px;
                        width: fit-content;
                        color: var(--header-primary);
                        box-sizing: border-box;
                        text-align: center;
                        font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
                        font-size: 14px;
                    }

                    .animTab.selected, .animTab:hover {
                        padding-bottom: 6px;
                        border-bottom: 2px solid white;
                    }

                    .animTabsContainer {
                        border-bottom: 1px solid transparent;
                        background-color: #36393f;
                        justify-content: space-around;
                        display: flex;
                        position: sticky;
                        z-index: 1;
                        top: 0;
                    }

                    .animContent {
                        display: none;
                        width: 100%;
                        height: fit-content;
                        margin-top: 20px;
                    }

                    .animContent.show {
                        display: block;
                    }

                    .animPreviewsPanel {
                        overflow: hidden;
                    }

                    .animPreviewsContainer, .animPreviewsPanel .animTextareaPanel {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-evenly; 
                        align-content: space-evenly;
                        height: 0;
                        margin: 0;
                        padding: 0;
                        opacity: 0;
                        box-sizing: border-box;
                        border-radius: 3px;
                        overflow: hidden;
                        transition: 0.5s opacity;
                    }

                    .animPreviewsPanel .animTextareaPanel {
                        padding: 0 18px;
                    }

                    .animTextarea {
                        display: block;
                        font-size: 0.875rem;
                        line-height: 1.125rem;
                        text-indent: 0;
                        white-space: pre-wrap;
                        font-family: Consolas, monospace;
                    }

                    .animTextarea::placeholder {
                        font-family: Consolas, monopoly;
                    }

                    .animPreviewsContainer.show, .animPreviewsPanel .animTextareaPanel.show {
                        opacity: 1;
                        border: 1px solid var(--background-tertiary);
                        height: 378px;
                    }

                    .animPreviewsContainer.compact {
                        border: none;
                        height: fit-content;
                    }

                    .animPreviewsActions {
                        width: fit-content;
                        margin: 0 auto;
                    }

                    .animPreviewActionButton {
                        display: inline-block;
                        min-width: 10px;
                        width: fit-content;
                        margin: 5px auto 5px auto;
                        color: var(--interactive-normal);
                        text-align: center;
                        text-transform: capitalize;
                        font-size: 18px;
                        background-color: var(--background-secondary);
                        border: 1px solid var(--background-tertiary);
                        border-radius: 3px;
                        transition: 0.2s;
                        overflow: hidden;
                    }

                    .animPreviewActionButton:hover {
                        border-color: var(--deprecated-text-input-border-hover);
                    }

                    .switchActionButton {
                        display: inline-flex;
                        justify-content: space-between;
                        line-height: 125%;
                        width: 180px;
                        padding: 3px 8px;
                        transition: 0.2s background;
                        background-size: cover;
                        background: linear-gradient(90deg, transparent 0%, var(--brand-experiment) 0%, var(--brand-experiment) 100%, transparent 100%) no-repeat;
                    }

                    .switchActionButton > svg {
                        fill: var(--interactive-normal);
                    }

                    .selecting .switchActionButton:nth-child(1), .editing .switchActionButton:nth-child(2) {
                        color: white;
                        background-position-x: 0;
                    }

                    .selecting .switchActionButton:nth-child(1) > svg, .editing .switchActionButton:nth-child(2) > svg {
                        fill: white;
                    }

                    .editing .switchActionButton:nth-child(1) {
                        background-position-x: 200px;
                    }

                    .selecting .switchActionButton:nth-child(2) {
                        background-position-x: -200px;
                    }

                    .animPreviewActionButton .switchActionButton:nth-child(n+2) {
                        border-left: 1px solid var(--background-tertiary);
                    }

                    .animPreviewActionButton:hover .switchActionButton:nth-child(n+2) {
                        border-left: 1px solid var(--deprecated-text-input-border-hover);
                    }

                    .switchActionButtonLabel {
                        display: inline-block;
                        overflow: hidden;
                        width: 100%;
                        text-overflow: ellipsis;
                    }

                    .animPageButtons {
                        margin: 0 auto;
                        width: fit-content;
                        display: none;
                    }

                    .animPageButtons.show {
                        display: block;
                    }

                    .animPageCircleButton {
                        display: inline-block;
                        min-width: 10px;
                        width: fit-content;
                        height: 0;
                        margin: 5px 5px;
                        padding: 5px 9px 25px 11px;
                        color: var(--interactive-normal);
                        text-align: center;
                        font-size: 18px;
                        font-family: Consolas, monospace;
                        background-color: var(--background-secondary);
                        border: 1px solid var(--background-tertiary);
                        border-radius: 100px;
                        transition: 0.2s;
                    }

                    .animPageCircleButton:first-child {
                        margin: 5px 5px 5px auto;
                    }

                    .animPageCircleButton:last-child {
                        margin: 5px auto 5px 5px;
                    }

                    .animPageCircleButton:hover {
                        border-color: var(--deprecated-text-input-border-hover);
                    }

                    .animPageCircleButton.enabled {
                        color: white;
                        background-color: var(--brand-experiment);
                    }

                    .animPreview {
                        background-color: var(--background-secondary);
                        border: 1px solid var(--background-tertiary);
                        border-radius: 3px;
                        overflow: hidden;
                    }

                    .vertical .animPreview {
                        display: inline-flex;
                        box-sizing: border-box;
                        width: 120px;
                        height: 165px;
                        padding: 5px;
                        transition: 0.2s;
                        flex-direction: column;
                        justify-content: space-evenly;
                    }

                    .horizontal .animPreview {
                        display: inline-flex;
                        box-sizing: border-box;
                        width: calc(100% - 26px);
                        height: 45px;
                        padding: 5px;
                        transition: 0.2s;
                        flex-direction: row;
                        justify-content: space-evenly;
                        align-items: center;
                    }

                    .horizontal .compact .animPreview {
                        margin: 5px 0;
                    }

                    .animPreview:hover {
                        border-color: var(--deprecated-text-input-border-hover);
                    }

                    .animPreview.enabled {
                        background-color: var(--brand-experiment);
                    }

                    .vertical .animPreviewTempsContainer {
                        display: flex;
                        width: 100%;
                        height: 100%;
                        flex-direction: column;
                        flex-wrap: nowrap;
                        justify-content: space-evenly;
                    }

                    .horizontal .animPreviewTempsContainer {
                        display: flex;
                        width: 100%;
                        height: 26px;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                    }
                    
                    .vertical .animPreview .animTempBlock {
                        border-radius: 3pt;
                        background-color: var(--interactive-normal)
                    }

                    .horizontal .animPreview .animTempBlock {
                        border-radius: 3pt;
                        background-color: var(--interactive-normal);
                        display: inline-block;
                    }

                    .vertical .animPreview.enabled .animTempBlock {
                        background-color: #fff;
                    }

                    .animPreview.enabled .animTempBlock {
                        background-color: #fff;
                    }

                    .animPreview .animPreviewLabel {
                        box-sizing: border-box;
                        overflow: hidden;
                        color: var(--interactive-normal);
                        font-size: 10pt;
                        margin: 4px;
                        padding: 0 4px;
                    }
                    
                    .vertical .animPreview .animPreviewLabel {
                        height: 58px;
                        width: auto;
                        bottom: 6pt;
                        line-height: 100%;
                        text-align: center;
                    }

                    .horizontal .animPreview .animPreviewLabel {
                        height: 26px;
                        width: 50%;
                        display: inline-block;
                        float: right;
                        line-height: 200%;
                        text-align: right;
                    }

                    .animPreview.enabled .animPreviewLabel {
                        color: #fff;
                        border-color: #fff;
                    }


                    .elementsContainer.nosidemargin > :first-child {
                        margin-left: 0 !important;
                    }
                    .elementsContainer.nosidemargin > :last-child {
                        margin-right: 0 !important;
                    }
                    
                    button.blurple.filled {
                        color: white;
                        background-color: var(--brand-experiment);
                    }
                    button.blurple.filled:hover {
                        background-color: var(--brand-experiment-560);
                    }
                    button.blurple.inverted {
                        color: var(--brand-experiment);
                        border: 1px solid var(--brand-experiment);
                    }
                    button.blurple.inverted:hover {
                        color: var(--brand-experiment-560);
                        border: 1px solid var(--brand-experiment-560);
                    }
                    
                    button.white.filled {
                        color: var(--brand-experiment);
                        background-color: #fff;
                    }
                    button.white.filled:hover {
                        background-color: var(--brand-experiment-100);
                    }
                    button.white.inverted {
                        color: #fff;
                        border: 1px solid #fff;
                    }
                    button.white.inverted:hover {
                        color: var(--brand-experiment-100);
                        border: 1px solid var(--brand-experiment-100);
                    }

                    button.grey.filled {
                        color: white;
                        background-color: #4f545c;
                    }
                    button.grey.filled:hover {
                        background-color: #5d6269;
                    }
                    button.grey.inverted {
                        color: #4f545c;
                        border: 1px solid #4f545c;
                    }
                    button.grey.inverted:hover {
                        color: #5d6269;
                        border: 1px solid #5d6269;
                    }

                    button.red.filled {
                        color: white;
                        background-color: hsl(359,calc(var(--saturation-factor, 1)*82.6%),59.4%);
                    }
                    button.red.filled:hover {
                        background-color: hsl(359,calc(var(--saturation-factor, 1)*56.7%),48%);
                    }
                    button.red.inverted {
                        color: hsl(359,calc(var(--saturation-factor, 1)*82.6%),59.4%);
                        border: 1px solid hsl(359,calc(var(--saturation-factor, 1)*82.6%),59.4%);
                    }
                    button.red.inverted:hover {
                        color: hsl(359,calc(var(--saturation-factor, 1)*56.7%),48%);
                        border: 1px solid hsl(359,calc(var(--saturation-factor, 1)*56.7%),48%);
                    }

                    button.yellow.filled {
                        color: white;
                        background-color: hsl(38,calc(var(--saturation-factor, 1)*95.7%),54.1%);
                    }
                    button.yellow.filled:hover {
                        background-color: hsl(38,calc(var(--saturation-factor, 1)*95.7%),54.1%);
                    }
                    button.yellow.inverted {
                        color: hsl(38,calc(var(--saturation-factor, 1)*95.7%),54.1%);
                        border: 1px solid hsl(38,calc(var(--saturation-factor, 1)*95.7%),54.1%);
                    }
                    button.yellow.inverted:hover {
                        color: hsl(38,calc(var(--saturation-factor, 1)*95.7%),54.1%);
                        border: 1px solid hsl(38,calc(var(--saturation-factor, 1)*95.7%),54.1%);
                    }

                    button.green.filled {
                        color: white;
                        background-color: hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%);
                    }
                    button.green.filled:hover {
                        background-color: hsl(139,calc(var(--saturation-factor, 1)*47.1%),33.3%);
                    }
                    button.green.inverted {
                        color: hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%);
                        border: 1px solid hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%);
                    }
                    button.green.inverted:hover {
                        color: hsl(139,calc(var(--saturation-factor, 1)*47.1%),33.3%);
                        border: 1px solid hsl(139,calc(var(--saturation-factor, 1)*47.1%),33.3%);
                    }
                    `

                    PluginUtilities.removeStyle('Animations-req');
                    setTimeout(() => {
                        PluginUtilities.addStyle('Animations-req', this.CompStyles)
                        this.changeStyles()
                    }, 100);

                    this.BadSendingStyles = (e)=>{
                        if(e.key=="Enter") { // finding parent
                            var BadSendingTextNode = document.getElementsByClassName(Animations.modules.ChatContent)[0]
                            .querySelector(`.${Animations.modules.IsSending}, .${Animations.modules.IsFailed}`)

                            if(!BadSendingTextNode) {
                                setTimeout(()=>{
                                    BadSendingTextNode = this.BadSendingStyles(e)
                                    return BadSendingTextNode
                                }, 50)// frequency of checks after pressing Enter
                            } else {
                                var result = BadSendingTextNode.closest(`.${Animations.modules.Message}`);// this is where we found it
                                // there styles for parent
                                result.style.animation = 'none'
                                result.style.transform = 'none'
                            }
                        }
                    }

                    document.addEventListener('keyup', this.BadSendingStyles)
                    // scrolling channels => update styles
                    this.channelsScrollTimer = -1;
                    this.channelsScroll = () => {
                        if (this.channelsScrollTimer != -1) clearTimeout(this.channelsScrollTimer);
                        this.channelsScrollTimer = setTimeout(()=>this.threadsWithChannels(), 40);// scroll event delay
                    }

                    var chn = ()=>{
                        var channels = document.getElementById('channels')
                        if(channels==null) return
                        channels.addEventListener('scroll', this.channelsScroll)
                        channels.addEventListener('mouseup', this.channelsScroll)
                        this.threadsWithChannels()
                        clearInterval(chni)
                    }
                    var chni = setInterval(chn, 100)

                    // on themes switch
                    this.observer = new MutationObserver(
                        (event)=>{
                            const {removedNodes, addedNodes} = event[0];
                            const compabilityThemes = ['Horizontal-Server-List'];

                            ;([removedNodes, addedNodes]).forEach(
                                (changes, typeIndex)=>changes.forEach(
                                    (node) => {
                                        if(compabilityThemes.includes(node.id)) this.changeStyles();
                                    }
                                )
                            )
                        }
                    )

                    var element_with_themes_switches = document.getElementsByTagName("bd-themes")[0]
                    this.observer.observe(element_with_themes_switches, {"childList": true})

                }

                stop() {
                    document.removeEventListener('keyup', this.BadSendingStyles);
                    var chn = ()=>{
                        var channels = document.getElementById('channels')
                        if(channels==null) return
                        channels.removeEventListener('scroll', this.channelsScroll)
                        channels.removeEventListener('mouseup', this.channelsScroll)
                        this.threadsWithChannels()
                        clearInterval(chni)
                    }
                    var chni = setInterval(chn, 100)
                    
                    PluginUtilities.removeStyle('Animations-main');
                    PluginUtilities.removeStyle('Animations-req');
                    PluginUtilities.removeStyle('Animations-count');

                    this.observer.disconnect()

                }

                onSwitch() {
                    var chn = ()=>{
                        var channels = document.getElementById('channels')
                        if(channels==null) return
                        channels.addEventListener('scroll', this.channelsScroll)
                        channels.addEventListener('mouseup', this.channelsScroll)
                        this.threadsWithChannels()
                        clearInterval(chni)
                    }
                    var chni = setInterval(chn, 100)
                }
            }
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
