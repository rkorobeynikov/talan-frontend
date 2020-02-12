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

// File#: _1_swipe-content
(function() {
    var SwipeContent = function(element) {
        this.element = element;
        this.delta = [false, false];
        this.dragging = false;
        this.intervalId = false;
        initSwipeContent(this);
    };

    function initSwipeContent(content) {
        content.element.addEventListener('mousedown', handleEvent.bind(content));
        content.element.addEventListener('touchstart', handleEvent.bind(content));
    };

    function initDragging(content) {
        //add event listeners
        content.element.addEventListener('mousemove', handleEvent.bind(content));
        content.element.addEventListener('touchmove', handleEvent.bind(content));
        content.element.addEventListener('mouseup', handleEvent.bind(content));
        content.element.addEventListener('mouseleave', handleEvent.bind(content));
        content.element.addEventListener('touchend', handleEvent.bind(content));
    };

    function cancelDragging(content) {
        //remove event listeners
        if(content.intervalId) {
            (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
            content.intervalId = false;
        }
        content.element.removeEventListener('mousemove', handleEvent.bind(content));
        content.element.removeEventListener('touchmove', handleEvent.bind(content));
        content.element.removeEventListener('mouseup', handleEvent.bind(content));
        content.element.removeEventListener('mouseleave', handleEvent.bind(content));
        content.element.removeEventListener('touchend', handleEvent.bind(content));
    };

    function handleEvent(event) {
        switch(event.type) {
            case 'mousedown':
            case 'touchstart':
                startDrag(this, event);
                break;
            case 'mousemove':
            case 'touchmove':
                drag(this, event);
                break;
            case 'mouseup':
            case 'mouseleave':
            case 'touchend':
                endDrag(this, event);
                break;
        }
    };

    function startDrag(content, event) {
        content.dragging = true;
        // listen to drag movements
        initDragging(content);
        content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
        // emit drag start event
        emitSwipeEvents(content, 'dragStart', content.delta, event.target);
    };

    function endDrag(content, event) {
        cancelDragging(content);
        // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
        var dx = parseInt(unify(event).clientX),
            dy = parseInt(unify(event).clientY);

        // check if there was a left/right swipe
        if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
            var s = getSign(dx - content.delta[0]);

            if(Math.abs(dx - content.delta[0]) > 30) {
                (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);
            }

            content.delta[0] = false;
        }
        // check if there was a top/bottom swipe
        if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
            var y = getSign(dy - content.delta[1]);

            if(Math.abs(dy - content.delta[1]) > 30) {
                (y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
            }

            content.delta[1] = false;
        }
        // emit drag end event
        emitSwipeEvents(content, 'dragEnd', [dx, dy]);
        content.dragging = false;
    };

    function drag(content, event) {
        if(!content.dragging) return;
        // emit dragging event with coordinates
        (!window.requestAnimationFrame)
            ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250)
            : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
    };

    function emitDrag(event) {
        emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
    };

    function unify(event) {
        // unify mouse and touch events
        return event.changedTouches ? event.changedTouches[0] : event;
    };

    function emitSwipeEvents(content, eventName, detail, el) {
        var trigger = false;
        if(el) trigger = el;
        // emit event with coordinates
        var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
        content.element.dispatchEvent(event);
    };

    function getSign(x) {
        if(!Math.sign) {
            return ((x > 0) - (x < 0)) || +x;
        } else {
            return Math.sign(x);
        }
    };

    window.SwipeContent = SwipeContent;

    //initialize the SwipeContent objects
    var swipe = document.getElementsByClassName('js-swipe-content');
    if( swipe.length > 0 ) {
        for( var i = 0; i < swipe.length; i++) {
            (function(i){new SwipeContent(swipe[i]);})(i);
        }
    }
}());

// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
    var Slideshow = function(opts) {
        this.options = slideshowAssignOptions(Slideshow.defaults , opts);
        this.element = this.options.element;
        this.items = this.element.getElementsByClassName('js-slideshow__item');
        this.controls = this.element.getElementsByClassName('js-slideshow__control');
        this.selectedSlide = 0;
        this.autoplayId = false;
        this.autoplayPaused = false;
        this.navigation = false;
        this.navCurrentLabel = false;
        this.ariaLive = false;
        this.moveFocus = false;
        this.animating = false;
        this.supportAnimation = Util.cssSupports('transition');
        this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide'));
        this.animatingClass = 'slideshow--is-animating';
        initSlideshow(this);
        initSlideshowEvents(this);
        initAnimationEndEvents(this);
    };

    Slideshow.prototype.showNext = function() {
        showNewItem(this, this.selectedSlide + 1, 'next');
    };

    Slideshow.prototype.showPrev = function() {
        showNewItem(this, this.selectedSlide - 1, 'prev');
    };

    Slideshow.prototype.showItem = function(index) {
        showNewItem(this, index, false);
    };

    Slideshow.prototype.startAutoplay = function() {
        var self = this;
        if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
            self.autoplayId = setInterval(function(){
                self.showNext();
            }, self.options.autoplayInterval);
        }
    };

    Slideshow.prototype.pauseAutoplay = function() {
        var self = this;
        if(this.options.autoplay) {
            clearInterval(self.autoplayId);
            self.autoplayId = false;
        }
    };

    function slideshowAssignOptions(defaults, opts) {
        // initialize the object options
        var mergeOpts = {};
        mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
        mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
        mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
        mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
        mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
        return mergeOpts;
    };

    function initSlideshow(slideshow) { // basic slideshow settings
        // if no slide has been selected -> select the first one
        if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
        slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
        // create an element that will be used to announce the new visible slide to SR
        var srLiveArea = document.createElement('div');
        Util.setAttributes(srLiveArea, {'class': 'visually-hidden js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
        slideshow.element.appendChild(srLiveArea);
        slideshow.ariaLive = srLiveArea;
    };

    function initSlideshowEvents(slideshow) {
        // if slideshow navigation is on -> create navigation HTML and add event listeners
        if(slideshow.options.navigation) {
            var navigation = document.createElement('ol'),
                navChildren = '';

            navigation.setAttribute('class', 'slideshow__navigation');
            for(var i = 0; i < slideshow.items.length; i++) {
                var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' :  'class="slideshow__nav-item js-slideshow__nav-item"',
                    navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="visually-hidden js-slideshow__nav-current-label">Current Item</span>' : '';
                navChildren = navChildren + '<li '+className+'><button class="reset"><span class="visually-hidden">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
            }

            navigation.innerHTML = navChildren;
            slideshow.navCurrentLabel = navigation.getElementsByClassName('js-slideshow__nav-current-label')[0];
            slideshow.element.appendChild(navigation);
            slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

            navigation.addEventListener('click', function(event){
                navigateSlide(slideshow, event, true);
            });
            navigation.addEventListener('keyup', function(event){
                navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
            });
        }
        // slideshow arrow controls
        if(slideshow.controls.length > 0) {
            slideshow.controls[0].addEventListener('click', function(event){
                event.preventDefault();
                slideshow.showPrev();
                updateAriaLive(slideshow);
            });
            slideshow.controls[1].addEventListener('click', function(event){
                event.preventDefault();
                slideshow.showNext();
                updateAriaLive(slideshow);
            });
        }
        // swipe events
        if(slideshow.options.swipe) {
            //init swipe
            new SwipeContent(slideshow.element);
            slideshow.element.addEventListener('swipeLeft', function(event){
                slideshow.showNext();
            });
            slideshow.element.addEventListener('swipeRight', function(event){
                slideshow.showPrev();
            });
        }
        // autoplay
        if(slideshow.options.autoplay) {
            slideshow.startAutoplay();
            // pause autoplay if user is interacting with the slideshow
            slideshow.element.addEventListener('mouseenter', function(event){
                slideshow.pauseAutoplay();
                slideshow.autoplayPaused = true;
            });
            slideshow.element.addEventListener('focusin', function(event){
                slideshow.pauseAutoplay();
                slideshow.autoplayPaused = true;
            });
            slideshow.element.addEventListener('mouseleave', function(event){
                slideshow.autoplayPaused = false;
                slideshow.startAutoplay();
            });
            slideshow.element.addEventListener('focusout', function(event){
                slideshow.autoplayPaused = false;
                slideshow.startAutoplay();
            });
        }
        // detect if external buttons control the slideshow
        var slideshowId = slideshow.element.getAttribute('id');
        if(slideshowId) {
            var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
            for(var i = 0; i < externalControls.length; i++) {
                (function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
            }
        }
        // custom event to trigger selection of a new slide element
        slideshow.element.addEventListener('selectNewItem', function(event){
            if(event.detail) showNewItem(slideshow, event.detail - 1, false);
        });
    };

    function navigateSlide(slideshow, event, keyNav) {
        // user has interacted with the slideshow navigation -> update visible slide
        var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
        if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
            slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
            slideshow.moveFocus = true;
            updateAriaLive(slideshow);
        }
    };

    function initAnimationEndEvents(slideshow) {
        // remove animation classes at the end of a slide transition
        for( var i = 0; i < slideshow.items.length; i++) {
            (function(i){
                slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
                slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
            })(i);
        }
    };

    function resetAnimationEnd(slideshow, item) {
        setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
            if(Util.hasClass(item,'slideshow__item--selected')) {
                if(slideshow.moveFocus) Util.moveFocus(item);
                emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
                slideshow.moveFocus = false;
            }
            Util.removeClass(item, 'slideshow__item--slide-out-left slideshow__item--slide-out-right slideshow__item--slide-in-left slideshow__item--slide-in-right');
            item.removeAttribute('aria-hidden');
            slideshow.animating = false;
            Util.removeClass(slideshow.element, slideshow.animatingClass);
        }, 100);
    };

    function showNewItem(slideshow, index, bool) {
        if(slideshow.animating && slideshow.supportAnimation) return;
        slideshow.animating = true;
        Util.addClass(slideshow.element, slideshow.animatingClass);
        if(index < 0) index = slideshow.items.length - 1;
        else if(index >= slideshow.items.length) index = 0;
        var exitItemClass = getExitItemClass(bool, slideshow.selectedSlide, index);
        var enterItemClass = getEnterItemClass(bool, slideshow.selectedSlide, index);
        // transition between slides
        if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
        Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
        slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
        if(slideshow.animationOff) {
            Util.addClass(slideshow.items[index], 'slideshow__item--selected');
        } else {
            Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
        }
        // reset slider navigation appearance
        resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
        slideshow.selectedSlide = index;
        // reset autoplay
        slideshow.pauseAutoplay();
        slideshow.startAutoplay();
        // reset controls/navigation color themes
        resetSlideshowTheme(slideshow, index);
        // emit event
        emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
        if(slideshow.animationOff) {
            slideshow.animating = false;
            Util.removeClass(slideshow.element, slideshow.animatingClass);
        }
    };

    function getExitItemClass(bool, oldIndex, newIndex) {
        var className = '';
        if(bool) {
            className = (bool == 'next') ? 'slideshow__item--slide-out-right' : 'slideshow__item--slide-out-left';
        } else {
            className = (newIndex < oldIndex) ? 'slideshow__item--slide-out-left' : 'slideshow__item--slide-out-right';
        }
        return className;
    };

    function getEnterItemClass(bool, oldIndex, newIndex) {
        var className = '';
        if(bool) {
            className = (bool == 'next') ? 'slideshow__item--slide-in-right' : 'slideshow__item--slide-in-left';
        } else {
            className = (newIndex < oldIndex) ? 'slideshow__item--slide-in-left' : 'slideshow__item--slide-in-right';
        }
        return className;
    };

    function resetSlideshowNav(slideshow, newIndex, oldIndex) {
        if(slideshow.navigation) {
            Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
            Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
            slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
            slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
        }
    };

    function resetSlideshowTheme(slideshow, newIndex) {
        var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
        if(dataTheme) {
            if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
            if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
        } else {
            if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
            if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
        }
    };

    function emitSlideshowEvent(slideshow, eventName, detail) {
        var event = new CustomEvent(eventName, {detail: detail});
        slideshow.element.dispatchEvent(event);
    };

    function updateAriaLive(slideshow) {
        slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
    };

    function externalControlSlide(slideshow, button) { // control slideshow using external element
        button.addEventListener('click', function(event){
            var index = button.getAttribute('data-index');
            if(!index) return;
            event.preventDefault();
            showNewItem(slideshow, index - 1, false);
        });
    };

    Slideshow.defaults = {
        element : '',
        navigation : true,
        autoplay : false,
        autoplayInterval: 5000,
        swipe: false
    };

    window.Slideshow = Slideshow;

    //initialize the Slideshow objects
    var slideshows = document.getElementsByClassName('js-slideshow');
    if( slideshows.length > 0 ) {
        for( var i = 0; i < slideshows.length; i++) {
            (function(i){
                var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
                    autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
                    autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
                    swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
                new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
            })(i);
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

    var mixer = mixitup(container, {
        animation: {
            duration: 500
        }
    })
}());

