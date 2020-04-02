document.documentElement.classList.add('js');
MicroModal.init();

// Utility function
function Util () {};

/*
	class manipulation functions
*/
Util.hasClass = function(el, className) {
    if (el.classList) return el.classList.contains(className);
    else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
    var classList = className.split(' ');
    if (el.classList) el.classList.add(classList[0]);
    else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
    if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
    var classList = className.split(' ');
    if (el.classList) el.classList.remove(classList[0]);
    else if(Util.hasClass(el, classList[0])) {
        var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
        el.className=el.className.replace(reg, ' ');
    }
    if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
    if(bool) Util.addClass(el, className);
    else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
    for(var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
};

/*
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
    var children = el.children,
        childrenByClass = [];
    for (var i = 0; i < el.children.length; i++) {
        if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
    }
    return childrenByClass;
};

Util.is = function(elem, selector) {
    if(selector.nodeType){
        return elem === selector;
    }

    var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
        length = qa.length,
        returnArr = [];

    while(length--){
        if(qa[length] === elem){
            return true;
        }
    }

    return false;
};

/*
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
    var change = to - start,
        currentTime = null;

    var animateHeight = function(timestamp){
        if (!currentTime) currentTime = timestamp;
        var progress = timestamp - currentTime;
        var val = parseInt((progress/duration)*change + start);
        element.style.height = val+"px";
        if(progress < duration) {
            window.requestAnimationFrame(animateHeight);
        } else {
            cb();
        }
    };

    //set the height of the element before starting animation -> fix bug on Safari
    element.style.height = start+"px";
    window.requestAnimationFrame(animateHeight);
};

/*
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
    var element = scrollEl || window;
    var start = element.scrollTop || document.documentElement.scrollTop,
        currentTime = null;

    if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;

    var animateScroll = function(timestamp){
        if (!currentTime) currentTime = timestamp;
        var progress = timestamp - currentTime;
        if(progress > duration) progress = duration;
        var val = Math.easeInOutQuad(progress, start, final-start, duration);
        element.scrollTo(0, val);
        if(progress < duration) {
            window.requestAnimationFrame(animateScroll);
        } else {
            cb && cb();
        }
    };

    window.requestAnimationFrame(animateScroll);
};

/*
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
    if( !element ) element = document.getElementsByTagName("body")[0];
    element.focus();
    if (document.activeElement !== element) {
        element.setAttribute('tabindex','-1');
        element.focus();
    }
};

/*
  Misc
*/

Util.getIndexInArray = function(array, el) {
    return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
    if('CSS' in window) {
        return CSS.supports(property, value);
    } else {
        var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
        return jsProperty in document.body.style;
    }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
        deep = arguments[0];
        i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
        for ( var prop in obj ) {
            if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                // If deep merge and property is an object, merge properties
                if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                    extended[prop] = extend( true, extended[prop], obj[prop] );
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
        var obj = arguments[i];
        merge(obj);
    }

    return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
    if(!window.matchMedia) return false;
    var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(matchMediaObj) return matchMediaObj.matches;
    return false; // return false if not supported
};

/*
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
}

/*
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};


/* JS Utility Classes */
(function() {
    // make focus ring visible only for keyboard navigation (i.e., tab key)
    var focusTab = document.getElementsByClassName('js-tab-focus');
    function detectClick() {
        if(focusTab.length > 0) {
            resetFocusTabs(false);
            window.addEventListener('keydown', detectTab);
        }
        window.removeEventListener('mousedown', detectClick);
    };

    function detectTab(event) {
        if(event.keyCode !== 9) return;
        resetFocusTabs(true);
        window.removeEventListener('keydown', detectTab);
        window.addEventListener('mousedown', detectClick);
    };

    function resetFocusTabs(bool) {
        var outlineStyle = bool ? '' : 'none';
        for(var i = 0; i < focusTab.length; i++) {
            focusTab[i].style.setProperty('outline', outlineStyle);
        }
    };
    window.addEventListener('mousedown', detectClick);
}());

(function() {
    var Tab = function(element) {
        this.element = element;
        this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
        this.listItems = this.tabList.getElementsByTagName('li');
        this.triggers = this.tabList.getElementsByTagName('a');
        this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
        this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
        this.showClass = 'tabs__panel--selected';
        this.activeClass = 'tabs__control--selected';
        this.initTab();
    };

    Tab.prototype.initTab = function() {
        //set initial aria attributes
        this.tabList.setAttribute('role', 'tablist');
        for( var i = 0; i < this.triggers.length; i++) {
            var bool = (i == 0),
                panelId = this.panels[i].getAttribute('id');
            this.listItems[i].setAttribute('role', 'presentation');
            Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
            Util.addClass(this.triggers[i], 'js-tabs__trigger');
            Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
            Util.toggleClass(this.panels[i], 'tab__panel--is-hidden', !bool);

            if(!bool) this.triggers[i].setAttribute('tabindex', '-1');
        }

        //listen for Tab events
        this.initTabEvents();
    };

    Tab.prototype.initTabEvents = function() {
        var self = this;
        //click on a new tab -> select content
        this.tabList.addEventListener('click', function(event) {
            if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
        });
        //arrow keys to navigate through tabs
        this.tabList.addEventListener('keydown', function(event) {
            if( !event.target.closest('.js-tabs__trigger') ) return;
            if( event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight' ) {
                self.selectNewTab('next');
            } else if( event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft' ) {
                self.selectNewTab('prev');
            }
        });
    };

    Tab.prototype.selectNewTab = function(direction) {
        var selectedTab = this.tabList.getElementsByClassName(this.activeClass)[0],
            index = Util.getIndexInArray(this.triggers, selectedTab);
        index = (direction == 'next') ? index + 1 : index - 1;
        //make sure index is in the correct interval
        //-> from last element go to first using the right arrow, from first element go to last using the left arrow
        if(index < 0) index = this.listItems.length - 1;
        if(index >= this.listItems.length) index = 0;
        this.triggerTab(this.triggers[index]);
        this.triggers[index].focus();
    };

    Tab.prototype.triggerTab = function(tabTrigger, event) {
        var self = this;
        event && event.preventDefault();
        var index = Util.getIndexInArray(this.triggers, tabTrigger);
        //no need to do anything if tab was already selected
        if(Util.hasClass(this.triggers[index], this.activeClass)) return;

        for( var i = 0; i < this.triggers.length; i++) {
            var bool = (i == index);
            Util.toggleClass(this.triggers[i], this.activeClass, bool);
            Util.toggleClass(this.panels[i], this.showClass, bool);
            this.triggers[i].setAttribute('aria-selected', bool);
            bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
        }
    };

    //initialize the Tab objects
    var tabs = document.getElementsByClassName('js-tabs');
    if( tabs.length > 0 ) {
        for( var i = 0; i < tabs.length; i++) {
            (function(i){new Tab(tabs[i]);})(i);
        }
    }
}());



// File#: _1_menu
// Usage: codyhouse.co/license
(function() {
    var Menu = function(element) {
        this.element = element;
        this.elementId = this.element.getAttribute('id');
        this.menuItems = this.element.getElementsByClassName('js-menu__content');
        this.trigger = document.querySelectorAll('[aria-controls="'+this.elementId+'"]');
        this.selectedTrigger = false;
        this.menuIsOpen = false;
        this.initMenu();
        this.initMenuEvents();
    };

    Menu.prototype.initMenu = function() {
        // init aria-labels
        for(var i = 0; i < this.trigger.length; i++) {
            Util.setAttributes(this.trigger[i], {'aria-expanded': 'false', 'aria-haspopup': 'true'});
        }
        // init tabindex
        for(var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].setAttribute('tabindex', '0');
        }
    };

    Menu.prototype.initMenuEvents = function() {
        var self = this;
        for(var i = 0; i < this.trigger.length; i++) {(function(i){
            self.trigger[i].addEventListener('click', function(event){
                event.preventDefault();
                // if the menu had been previously opened by another trigger element -> close it first and reopen in the right position
                if(Util.hasClass(self.element, 'menu--is-visible') && self.selectedTrigger !=  self.trigger[i]) {
                    self.toggleMenu(false, false); // close menu
                }
                // toggle menu
                self.selectedTrigger = self.trigger[i];
                self.toggleMenu(!Util.hasClass(self.element, 'menu--is-visible'), true);
            });
        })(i);}

        // keyboard events
        this.element.addEventListener('keydown', function(event) {
            // use up/down arrow to navigate list of menu items
            if( !Util.hasClass(event.target, 'js-menu__content') ) return;
            if( (event.keyCode && event.keyCode == 40) || (event.key && event.key.toLowerCase() == 'arrowdown') ) {
                self.navigateItems(event, 'next');
            } else if( (event.keyCode && event.keyCode == 38) || (event.key && event.key.toLowerCase() == 'arrowup') ) {
                self.navigateItems(event, 'prev');
            }
        });
    };

    Menu.prototype.toggleMenu = function(bool, moveFocus) {
        var self = this;
        // toggle menu visibility
        Util.toggleClass(this.element, 'menu--is-visible', bool);
        this.menuIsOpen = bool;
        if(bool) {
            this.selectedTrigger.setAttribute('aria-expanded', 'true');
            Util.moveFocus(this.menuItems[0]);
            this.element.addEventListener("transitionend", function(event) {Util.moveFocus(self.menuItems[0]);}, {once: true});
            // position the menu element
            this.positionMenu();
            // add class to menu trigger
            Util.addClass(this.selectedTrigger, 'menu-control--active');
        } else if(this.selectedTrigger) {
            this.selectedTrigger.setAttribute('aria-expanded', 'false');
            if(moveFocus) Util.moveFocus(this.selectedTrigger);
            // remove class from menu trigger
            Util.removeClass(this.selectedTrigger, 'menu-control--active');
            this.selectedTrigger = false;
        }
    };

    Menu.prototype.positionMenu = function(event, direction) {
        var selectedTriggerPosition = this.selectedTrigger.getBoundingClientRect(),
            menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
        // menuOnTop = window.innerHeight < selectedTriggerPosition.bottom + this.element.offsetHeight;

        var left = selectedTriggerPosition.left,
            right = (window.innerWidth - selectedTriggerPosition.right),
            isRight = (window.innerWidth < selectedTriggerPosition.left + this.element.offsetWidth);

        var horizontal = isRight ? 'right: '+right+'px;' : 'left: '+left+'px;',
            vertical = menuOnTop
                ? 'bottom: '+(window.innerHeight - selectedTriggerPosition.top)+'px;'
                : 'top: '+selectedTriggerPosition.bottom+'px;';
        // check right position is correct -> otherwise set left to 0
        if( isRight && (right + this.element.offsetWidth) > window.innerWidth) horizontal = 'left: '+ parseInt((window.innerWidth - this.element.offsetWidth)/2)+'px;';
        var maxHeight = menuOnTop ? selectedTriggerPosition.top - 20 : window.innerHeight - selectedTriggerPosition.bottom - 20;
        this.element.setAttribute('style', horizontal + vertical +'max-height:'+Math.floor(maxHeight)+'px;');
    };

    Menu.prototype.navigateItems = function(event, direction) {
        event.preventDefault();
        var index = Util.getIndexInArray(this.menuItems, event.target),
            nextIndex = direction == 'next' ? index + 1 : index - 1;
        if(nextIndex < 0) nextIndex = this.menuItems.length - 1;
        if(nextIndex > this.menuItems.length - 1) nextIndex = 0;
        Util.moveFocus(this.menuItems[nextIndex]);
    };

    Menu.prototype.checkMenuFocus = function() {
        var menuParent = document.activeElement.closest('.js-menu');
        if (!menuParent || !this.element.contains(menuParent)) this.toggleMenu(false, false);
    };

    Menu.prototype.checkMenuClick = function(target) {
        if( !this.element.contains(target) && !target.closest('[aria-controls="'+this.elementId+'"]')) this.toggleMenu(false);
    };

    window.Menu = Menu;

    //initialize the Menu objects
    var menus = document.getElementsByClassName('js-menu');
    if( menus.length > 0 ) {
        var menusArray = [];
        for( var i = 0; i < menus.length; i++) {
            (function(i){menusArray.push(new Menu(menus[i]));})(i);
        }

        // listen for key events
        window.addEventListener('keyup', function(event){
            if( event.keyCode && event.keyCode == 9 || event.key && event.key.toLowerCase() == 'tab' ) {
                //close menu if focus is outside menu element
                menusArray.forEach(function(element){
                    element.checkMenuFocus();
                });
            } else if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
                // close menu on 'Esc'
                menusArray.forEach(function(element){
                    element.toggleMenu(false, false);
                });
            }
        });
        // close menu when clicking outside it
        window.addEventListener('click', function(event){
            menusArray.forEach(function(element){
                element.checkMenuClick(event.target);
            });
        });
        // on resize -> close all menu elements
        window.addEventListener('resize', function(event){
            menusArray.forEach(function(element){
                element.toggleMenu(false, false);
            });
        });
        // on scroll -> close all menu elements
        window.addEventListener('scroll', function(event){
            menusArray.forEach(function(element){
                if(element.menuIsOpen) element.toggleMenu(false, false);
            });
        });
    }
}());

(function () {

    var container = document.querySelector('[data-ref="container"]');

    if (container) {
        var mixer = mixitup(container, {
            animation: {
                duration: 500
            }
        })
    }

    var slider = Peppermint(document.getElementById('peppermint'), {
        slideshow: true,
        slideshowInterval: 5000,
        stopSlideshowAfterInteraction: true,
        dots: true
    });
}());


