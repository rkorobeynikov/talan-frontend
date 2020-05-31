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
            window.dispatchEvent(new Event('resize'));
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

// File#: _1_diagonal-movement
// Usage: codyhouse.co/license
/*
  Modified version of the jQuery-menu-aim plugin
  https://github.com/kamens/jQuery-menu-aim
  - Replaced jQuery with Vanilla JS
  - Minor changes
*/
(function() {
    var menuAim = function(opts) {
        init(opts);
    };

    window.menuAim = menuAim;

    function init(opts) {
        var activeRow = null,
            mouseLocs = [],
            lastDelayLoc = null,
            timeoutId = null,
            options = Util.extend({
                menu: '',
                rows: false, //if false, get direct children - otherwise pass nodes list
                submenuSelector: "*",
                submenuDirection: "right",
                tolerance: 75,  // bigger = more forgivey when entering submenu
                enter: function(){},
                exit: function(){},
                activate: function(){},
                deactivate: function(){},
                exitMenu: function(){}
            }, opts),
            menu = options.menu;

        var MOUSE_LOCS_TRACKED = 3,  // number of past mouse locations to track
            DELAY = 300;  // ms delay when user appears to be entering submenu

        /**
         * Keep track of the last few locations of the mouse.
         */
        var mousemoveDocument = function(e) {
            mouseLocs.push({x: e.pageX, y: e.pageY});

            if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
                mouseLocs.shift();
            }
        };

        /**
         * Cancel possible row activations when leaving the menu entirely
         */
        var mouseleaveMenu = function() {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // If exitMenu is supplied and returns true, deactivate the
            // currently active row on menu exit.
            if (options.exitMenu(this)) {
                if (activeRow) {
                    options.deactivate(activeRow);
                }

                activeRow = null;
            }
        };

        /**
         * Trigger a possible row activation whenever entering a new row.
         */
        var mouseenterRow = function() {
                if (timeoutId) {
                    // Cancel any previous activation delays
                    clearTimeout(timeoutId);
                }

                options.enter(this);
                possiblyActivate(this);
            },
            mouseleaveRow = function() {
                options.exit(this);
            };

        /*
         * Immediately activate a row if the user clicks on it.
         */
        var clickRow = function() {
            activate(this);
        };

        /**
         * Activate a menu row.
         */
        var activate = function(row) {
            if (row == activeRow) {
                return;
            }

            if (activeRow) {
                options.deactivate(activeRow);
            }

            options.activate(row);
            activeRow = row;
        };

        /**
         * Possibly activate a menu row. If mouse movement indicates that we
         * shouldn't activate yet because user may be trying to enter
         * a submenu's content, then delay and check again later.
         */
        var possiblyActivate = function(row) {
            var delay = activationDelay();

            if (delay) {
                timeoutId = setTimeout(function() {
                    possiblyActivate(row);
                }, delay);
            } else {
                activate(row);
            }
        };

        /**
         * Return the amount of time that should be used as a delay before the
         * currently hovered row is activated.
         *
         * Returns 0 if the activation should happen immediately. Otherwise,
         * returns the number of milliseconds that should be delayed before
         * checking again to see if the row should be activated.
         */
        var activationDelay = function() {
            if (!activeRow || !Util.is(activeRow, options.submenuSelector)) {
                // If there is no other submenu row already active, then
                // go ahead and activate immediately.
                return 0;
            }

            function getOffset(element) {
                var rect = element.getBoundingClientRect();
                return { top: rect.top + window.pageYOffset, left: rect.left + window.pageXOffset };
            };

            var offset = getOffset(menu),
                upperLeft = {
                    x: offset.left,
                    y: offset.top - options.tolerance
                },
                upperRight = {
                    x: offset.left + menu.offsetWidth,
                    y: upperLeft.y
                },
                lowerLeft = {
                    x: offset.left,
                    y: offset.top + menu.offsetHeight + options.tolerance
                },
                lowerRight = {
                    x: offset.left + menu.offsetWidth,
                    y: lowerLeft.y
                },
                loc = mouseLocs[mouseLocs.length - 1],
                prevLoc = mouseLocs[0];

            if (!loc) {
                return 0;
            }

            if (!prevLoc) {
                prevLoc = loc;
            }

            if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x || prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
                // If the previous mouse location was outside of the entire
                // menu's bounds, immediately activate.
                return 0;
            }

            if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
                // If the mouse hasn't moved since the last time we checked
                // for activation status, immediately activate.
                return 0;
            }

            // Detect if the user is moving towards the currently activated
            // submenu.
            //
            // If the mouse is heading relatively clearly towards
            // the submenu's content, we should wait and give the user more
            // time before activating a new row. If the mouse is heading
            // elsewhere, we can immediately activate a new row.
            //
            // We detect this by calculating the slope formed between the
            // current mouse location and the upper/lower right points of
            // the menu. We do the same for the previous mouse location.
            // If the current mouse location's slopes are
            // increasing/decreasing appropriately compared to the
            // previous's, we know the user is moving toward the submenu.
            //
            // Note that since the y-axis increases as the cursor moves
            // down the screen, we are looking for the slope between the
            // cursor and the upper right corner to decrease over time, not
            // increase (somewhat counterintuitively).
            function slope(a, b) {
                return (b.y - a.y) / (b.x - a.x);
            };

            var decreasingCorner = upperRight,
                increasingCorner = lowerRight;

            // Our expectations for decreasing or increasing slope values
            // depends on which direction the submenu opens relative to the
            // main menu. By default, if the menu opens on the right, we
            // expect the slope between the cursor and the upper right
            // corner to decrease over time, as explained above. If the
            // submenu opens in a different direction, we change our slope
            // expectations.
            if (options.submenuDirection == "left") {
                decreasingCorner = lowerLeft;
                increasingCorner = upperLeft;
            } else if (options.submenuDirection == "below") {
                decreasingCorner = lowerRight;
                increasingCorner = lowerLeft;
            } else if (options.submenuDirection == "above") {
                decreasingCorner = upperLeft;
                increasingCorner = upperRight;
            }

            var decreasingSlope = slope(loc, decreasingCorner),
                increasingSlope = slope(loc, increasingCorner),
                prevDecreasingSlope = slope(prevLoc, decreasingCorner),
                prevIncreasingSlope = slope(prevLoc, increasingCorner);

            if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
                // Mouse is moving from previous location towards the
                // currently activated submenu. Delay before activating a
                // new menu row, because user may be moving into submenu.
                lastDelayLoc = loc;
                return DELAY;
            }

            lastDelayLoc = null;
            return 0;
        };

        /**
         * Hook up initial menu events
         */
        menu.addEventListener('mouseleave', mouseleaveMenu);
        var rows = (options.rows) ? options.rows : menu.children;
        if(rows.length > 0) {
            for(var i = 0; i < rows.length; i++) {(function(i){
                rows[i].addEventListener('mouseenter', mouseenterRow);
                rows[i].addEventListener('mouseleave', mouseleaveRow);
                rows[i].addEventListener('click', clickRow);
            })(i);}
        }

        document.addEventListener('mousemove', function(event){
            (!window.requestAnimationFrame) ? mousemoveDocument(event) : window.requestAnimationFrame(function(){mousemoveDocument(event);});
        });
    };
}());




// File#: _2_dropdown
// Usage: codyhouse.co/license
(function() {
    var Dropdown = function(element) {
        this.element = element;
        this.trigger = this.element.getElementsByClassName('dropdown__trigger')[0];
        this.dropdown = this.element.getElementsByClassName('dropdown__menu')[0];
        this.triggerFocus = false;
        this.dropdownFocus = false;
        this.hideInterval = false;
        // sublevels
        this.dropdownSubElements = this.element.getElementsByClassName('dropdown__sub-wrapperu');
        this.prevFocus = false; // store element that was in focus before focus changed
        this.addDropdownEvents();
    };

    Dropdown.prototype.addDropdownEvents = function(){
        //place dropdown
        var self = this;
        this.placeElement();
        this.element.addEventListener('placeDropdown', function(event){
            self.placeElement();
        });
        // init dropdown
        this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
        this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
        // init sublevels
        this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
    };

    Dropdown.prototype.placeElement = function() {
        var triggerPosition = this.trigger.getBoundingClientRect(),
            isRight = (window.innerWidth < triggerPosition.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width')));

        var xPosition = isRight ? 'right: 0px; left: auto;' : 'left: 0px; right: auto;';
        this.dropdown.setAttribute('style', xPosition);
    };

    Dropdown.prototype.initElementEvents = function(element, bool) {
        var self = this;
        element.addEventListener('mouseenter', function(){
            bool = true;
            self.showDropdown();
        });
        element.addEventListener('focus', function(){
            self.showDropdown();
        });
        element.addEventListener('mouseleave', function(){
            bool = false;
            self.hideDropdown();
        });
        element.addEventListener('focusout', function(){
            self.hideDropdown();
        });
    };

    Dropdown.prototype.showDropdown = function(){
        if(this.hideInterval) clearInterval(this.hideInterval);
        this.showLevel(this.dropdown, true);
    };

    Dropdown.prototype.hideDropdown = function(){
        var self = this;
        if(this.hideInterval) clearInterval(this.hideInterval);
        this.hideInterval = setTimeout(function(){
            var dropDownFocus = document.activeElement.closest('.js-dropdown'),
                inFocus = dropDownFocus && (dropDownFocus == self.element);
            // if not in focus and not hover -> hide
            if(!self.triggerFocus && !self.dropdownFocus && !inFocus) {
                self.hideLevel(self.dropdown);
                // make sure to hide sub/dropdown
                self.hideSubLevels();
                self.prevFocus = false;
            }
        }, 300);
    };

    Dropdown.prototype.initSublevels = function(){
        var self = this;
        var dropdownMenu = this.element.getElementsByClassName('dropdown__menu');
        for(var i = 0; i < dropdownMenu.length; i++) {
            var listItems = dropdownMenu[i].children;
            // bind hover
            new menuAim({
                menu: dropdownMenu[i],
                activate: function(row) {
                    var subList = row.getElementsByClassName('dropdown__menu')[0];
                    if(!subList) return;
                    Util.addClass(row.querySelector('a'), 'dropdown__item--hover');
                    self.showLevel(subList);
                },
                deactivate: function(row) {
                    var subList = row.getElementsByClassName('dropdown__menu')[0];
                    if(!subList) return;
                    Util.removeClass(row.querySelector('a'), 'dropdown__item--hover');
                    self.hideLevel(subList);
                },
                submenuSelector: '.dropdown__sub-wrapper',
            });
        }
        // store focus element before change in focus
        this.element.addEventListener('keydown', function(event) {
            if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
                self.prevFocus = document.activeElement;
            }
        });
        // make sure that sublevel are visible when their items are in focus
        this.element.addEventListener('keyup', function(event) {
            if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
                // focus has been moved -> make sure the proper classes are added to subnavigation
                var focusElement = document.activeElement,
                    focusElementParent = focusElement.closest('.dropdown__menu'),
                    focusElementSibling = focusElement.nextElementSibling;

                // if item in focus is inside submenu -> make sure it is visible
                if(focusElementParent && !Util.hasClass(focusElementParent, 'dropdown__menu--is-visible')) {
                    self.showLevel(focusElementParent);
                }
                // if item in focus triggers a submenu -> make sure it is visible
                if(focusElementSibling && !Util.hasClass(focusElementSibling, 'dropdown__menu--is-visible')) {
                    self.showLevel(focusElementSibling);
                }

                // check previous element in focus -> hide sublevel if required
                if( !self.prevFocus) return;
                var prevFocusElementParent = self.prevFocus.closest('.dropdown__menu'),
                    prevFocusElementSibling = self.prevFocus.nextElementSibling;

                if( !prevFocusElementParent ) return;

                // element in focus and element prev in focus are siblings
                if( focusElementParent && focusElementParent == prevFocusElementParent) {
                    if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
                    return;
                }

                // element in focus is inside submenu triggered by element prev in focus
                if( prevFocusElementSibling && focusElementParent && focusElementParent == prevFocusElementSibling) return;

                // shift tab -> element in focus triggers the submenu of the element prev in focus
                if( focusElementSibling && prevFocusElementParent && focusElementSibling == prevFocusElementParent) return;

                var focusElementParentParent = focusElementParent.parentNode.closest('.dropdown__menu');

                // shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
                if(focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
                    if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
                    return;
                }

                if(prevFocusElementParent && Util.hasClass(prevFocusElementParent, 'dropdown__menu--is-visible')) {
                    self.hideLevel(prevFocusElementParent);
                }
            }
        });
    };

    Dropdown.prototype.hideSubLevels = function(){
        var visibleSubLevels = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
        if(visibleSubLevels.length == 0) return;
        while (visibleSubLevels[0]) {
            this.hideLevel(visibleSubLevels[0]);
        }
        var hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
        while (hoveredItems[0]) {
            Util.removeClass(hoveredItems[0], 'dropdown__item--hover');
        }
    };

    Dropdown.prototype.showLevel = function(level, bool){
        if(bool == undefined) {
            //check if the sublevel needs to be open to the left
            Util.removeClass(level, 'dropdown__menu--left');
            var boundingRect = level.getBoundingClientRect();
            if(window.innerWidth - boundingRect.right < 5 && boundingRect.left + window.scrollX > 2*boundingRect.width) Util.addClass(level, 'dropdown__menu--left');
        }
        Util.addClass(level, 'dropdown__menu--is-visible');
        Util.removeClass(level, 'dropdown__menu--is-hidden');
    };

    Dropdown.prototype.hideLevel = function(level){
        if(!Util.hasClass(level, 'dropdown__menu--is-visible')) return;
        Util.removeClass(level, 'dropdown__menu--is-visible');
        Util.addClass(level, 'dropdown__menu--is-hidden');

        level.addEventListener('animationend', function cb(){
            level.removeEventListener('animationend', cb);
            Util.removeClass(level, 'dropdown__menu--is-hidden dropdown__menu--left');
        });
    };


    var dropdown = document.getElementsByClassName('js-dropdown');
    if( dropdown.length > 0 ) { // init Dropdown objects
        for( var i = 0; i < dropdown.length; i++) {
            (function(i){new Dropdown(dropdown[i]);})(i);
        }
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

    var homeHeroSlideshowEl = document.querySelector('.js-home-hero-slideshow');
    if (homeHeroSlideshowEl) {
        var homeHeroSlideshow = Peppermint(homeHeroSlideshowEl, {
            slideshow: true,
            slideshowInterval: 5000,
            stopSlideshowAfterInteraction: true,
            dots: true
        });
    }

    var objectHeroSlideshowEl = document.querySelector('.js-object-hero-slideshow');
    if (objectHeroSlideshowEl) {
        var objectHeroSlideshow = Peppermint(objectHeroSlideshowEl, {
            slideshow: true,
            slideshowInterval: 5000,
            stopSlideshowAfterInteraction: true,
            dots: true
        });
    }

    var flatLayoutSlideshow;
    var flatLayoutSlideshowEl = document.querySelector('.js-peppermint-flat-layout-slideshow');
    var flatLayoutSlideshowPreviousButtonEl = document.querySelector('.js-flat-layout-slideshow-previous-btn');
    var flatLayoutSlideshowNextButtonEl = document.querySelector('.js-flat-layout-slideshow-next-btn');
    var flatLayoutSlideshowZoomButtonEl = document.querySelector('.js-flat-layout-slideshow-zoom-btn');

    if (flatLayoutSlideshowEl) {
        flatLayoutSlideshow = Peppermint(flatLayoutSlideshowEl, {
            dots: true
        });
    }

    if (flatLayoutSlideshowEl && flatLayoutSlideshowPreviousButtonEl) {
        flatLayoutSlideshowPreviousButtonEl.addEventListener('click', function () {
            flatLayoutSlideshow.prev();
        })
    }

    if (flatLayoutSlideshowEl && flatLayoutSlideshowNextButtonEl) {
        flatLayoutSlideshowNextButtonEl.addEventListener('click', function () {
            flatLayoutSlideshow.next();
        })
    }


    // Flat layout fullscreen
    var flatLayoutFullscreenSlideshow;
    var flatLayoutFullscreenSlideshowEl = document.querySelector('.js-peppermint-flat-layout-fullscreen-slideshow');
    var flatLayoutFullscreenSlideshowPreviousButtonEl = document.querySelector('.js-flat-layout-fullscreen-slideshow-previous-btn');
    var flatLayoutFullscreenSlideshowNextButtonEl = document.querySelector('.js-flat-layout-fullscreen-slideshow-next-btn');

    if (flatLayoutFullscreenSlideshowEl) {
        flatLayoutFullscreenSlideshow = Peppermint(flatLayoutFullscreenSlideshowEl, {
            dots: true
        });
    }

    if (flatLayoutFullscreenSlideshowEl && flatLayoutFullscreenSlideshowPreviousButtonEl) {
        flatLayoutFullscreenSlideshowPreviousButtonEl.addEventListener('click', function () {
            flatLayoutFullscreenSlideshow.prev();
        })
    }

    if (flatLayoutFullscreenSlideshowEl && flatLayoutFullscreenSlideshowNextButtonEl) {
        flatLayoutFullscreenSlideshowNextButtonEl.addEventListener('click', function () {
            flatLayoutFullscreenSlideshow.next();
        })
    }

    if (flatLayoutSlideshowEl && flatLayoutSlideshowZoomButtonEl) {
        flatLayoutSlideshowZoomButtonEl.addEventListener('click', function () {
            window.dispatchEvent(new Event('resize'));
            flatLayoutFullscreenSlideshow.slideTo(flatLayoutSlideshow.getCurrentPos());
        })
    }


    // Flat interior slideshow


    var flatInteriorSlideshow;
    var flatInteriorSlideshowEl = document.querySelector('.js-peppermint-flat-interior-slideshow');
    var flatInteriorSlideshowPreviousButtonEl = document.querySelector('.js-flat-interior-slideshow-previous-btn');
    var flatInteriorSlideshowNextButtonEl = document.querySelector('.js-flat-interior-slideshow-next-btn');
    var flatInteriorSlideshowZoomButtonEl = document.querySelector('.js-flat-interior-slideshow-zoom-btn');

    if (flatInteriorSlideshowEl) {
        flatInteriorSlideshow = Peppermint(flatInteriorSlideshowEl, {
            dots: true
        });
    }

    if (flatInteriorSlideshowEl && flatInteriorSlideshowPreviousButtonEl) {
        flatInteriorSlideshowPreviousButtonEl.addEventListener('click', function () {
            flatInteriorSlideshow.prev();
        })
    }

    if (flatInteriorSlideshowEl && flatInteriorSlideshowNextButtonEl) {
        flatInteriorSlideshowNextButtonEl.addEventListener('click', function () {
            flatInteriorSlideshow.next();
        })
    }


    // Flat layout fullscreen
    var flatInteriorFullscreenSlideshow;
    var flatInteriorFullscreenSlideshowEl = document.querySelector('.js-peppermint-flat-interior-fullscreen-slideshow');
    var flatInteriorFullscreenSlideshowPreviousButtonEl = document.querySelector('.js-flat-interior-fullscreen-slideshow-previous-btn');
    var flatInteriorFullscreenSlideshowNextButtonEl = document.querySelector('.js-flat-interior-fullscreen-slideshow-next-btn');

    if (flatInteriorFullscreenSlideshowEl) {
        flatInteriorFullscreenSlideshow = Peppermint(flatInteriorFullscreenSlideshowEl, {
            dots: true
        });
    }

    if (flatInteriorFullscreenSlideshowEl && flatInteriorFullscreenSlideshowPreviousButtonEl) {
        flatInteriorFullscreenSlideshowPreviousButtonEl.addEventListener('click', function () {
            flatInteriorFullscreenSlideshow.prev();
        })
    }

    if (flatInteriorFullscreenSlideshowEl && flatInteriorFullscreenSlideshowNextButtonEl) {
        flatInteriorFullscreenSlideshowNextButtonEl.addEventListener('click', function () {
            flatInteriorFullscreenSlideshow.next();
        })
    }

    if (flatInteriorSlideshowEl && flatInteriorSlideshowZoomButtonEl) {
        flatInteriorSlideshowZoomButtonEl.addEventListener('click', function () {
            window.dispatchEvent(new Event('resize'));
            flatInteriorFullscreenSlideshow.slideTo(flatInteriorSlideshow.getCurrentPos());
        })
    }


    var flatLayoutChooserMobileSlideshowElements = document.querySelectorAll('.flat-layout-mobile-chooser__slideshow');
    flatLayoutChooserMobileSlideshowElements.forEach(function (item) {
        var slideshowItem = Peppermint(item, {});
    });


    // Flat layout mobile chooser slideshows
    var slideshowChangeButtons = document.querySelectorAll('.flat-layout-mobile-chooser__dropdown [data-slideshow-target]');
    slideshowChangeButtons.forEach(function (item) {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelector('.flat-layout-mobile-chooser__dropdown-btn').textContent = event.target.textContent;
            document.querySelectorAll('.flat-layout-mobile-chooser__slideshow-wrapper').forEach(function (item) {
                item.classList.remove('flat-layout-mobile-chooser__slideshow-wrapper--active');
            });
            document.querySelector('.flat-layout-mobile-chooser__slideshow-wrapper[data-slideshow-id="' + event.target.getAttribute('data-slideshow-target') + '"]').classList.add('flat-layout-mobile-chooser__slideshow-wrapper--active');
            window.dispatchEvent(new Event('resize'));
        });
    });


    var flatSearchMobileSwitcher = document.querySelector('.flat-search__mobile-switcher-btn');
    if (flatSearchMobileSwitcher) {
        flatSearchMobileSwitcher.addEventListener('click', function (event) {
            var flatSearchFilter = document.querySelector('.flat-search__filter');
            if (flatSearchFilter) {
                flatSearchFilter.classList.toggle('flat-search__filter--mobile-opened');
            }
        })
    }
}());


