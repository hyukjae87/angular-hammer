/*
 * Angular Hammer v2
 *
 * Forked from https://github.com/randallb/angular-hammer
 * Updated to support https://github.com/EightMedia/hammer.js
 *
 * Within an Angular.js application, allows you to specify custom behaviour on Hammer.js touch events.
 *
 * Usage, currently as attribute only:
 *
 *    hm-tap="{expression}"
 *
 * You can change the default settings in your Module#config method
 *
 *    myApp.config(function(hmOptionsProvider) {
 *      hmOptionsProvider.defaults.options = {
 *        drag: false,
 *        transform: false
 *      }
 *    });
 *
 * Or override the default settings for the instance by adding a second attribute with options:
 *
 *    hm-options="{drag: false, transform: false}"
 *
 * Include this file, and add `hmTouchevents` to your app's dependencies.
 *
 * Requires Hammer.js, tested with `v1.0.1 - 2013-02-26`.
 *
 */

var hmTouchevents = angular.module('hmTouchevents', []),
    hmGestures = ['hmHold:hold',
                  'hmDoubletap:doubletap',
                  'hmDrag:drag',
                  'hmDragstart:dragstart',
                  'hmDragend:dragend',
                  'hmDragup:dragup',
                  'hmDragdown:dragdown',
                  'hmDragleft:dragleft',
                  'hmDragright:dragright',
                  'hmSwipe:swipe',
                  'hmSwipeup:swipeup',
                  'hmSwipedown:swipedown',
                  'hmSwipeleft:swipeleft',
                  'hmSwiperight:swiperight',
                  'hmTransformstart:transformstart',
                  'hmTransform:transform',
                  'hmTransformend:transformend',
                  'hmRotate:rotate',
                  'hmPinch:pinch',
                  'hmPinchin:pinchin',
                  'hmPinchout:pinchout',
                  'hmTouch:touch',
                  'hmRelease:release'],
    hmGesturesDelay = ['hmTap:tap'];
hmTouchevents.provider("hmOptions", function() {
    this.defaults = {
      options: {}
    };
    this.$get = function() {
      var defaults = this.defaults;
      return angular.copy(defaults);
    };
});

angular.forEach(hmGestures, function(name){
  var directive = name.split(':'),
  directiveName = directive[0],
  eventName = directive[1];
  hmTouchevents.directive(directiveName, ["$parse","hmOptions","$timeout",function($parse,hmOptions) {
    return {
      scope: true,
      link: function(scope, element, attr) {
        var fn, opts;
        fn = $parse(attr[directiveName]);
        opts = hmOptions.options;
        angular.extend(opts, $parse(attr['hmOptions'])(scope, {}));
        if(opts && opts.group) {
          scope.hammer = scope.hammer || Hammer(element[0], opts);
        } else {
          scope.hammer = Hammer(element[0], opts);
        }
        return scope.hammer.on(eventName, function(event) {
          return scope.$apply(function() {
            return fn(scope, {
              $event: event
            });
          });
        });
      }
    };
    }
  ]);
});

angular.forEach(hmGesturesDelay, function(name){
  var directive = name.split(':'),
  directiveName = directive[0],
  eventName = directive[1];
  hmTouchevents.directive(directiveName, ["$parse","hmOptions","$timeout",function($parse,hmOptions) {
    return {
      scope: true,
      link: function(scope, element, attr) {
        var fn, opts;
        fn = $parse(attr[directiveName]);
        opts = hmOptions.options;
        angular.extend(opts, $parse(attr['hmOptions'])(scope, {}));
        if(opts && opts.group) {
          scope.hammer = scope.hammer || Hammer(element[0], opts);
        } else {
          scope.hammer = Hammer(element[0], opts);
        }
        last = 0;
        clickPosition = null;
        return scope.hammer.on(eventName, function(event) {
          current = event.gesture.center
          if(!clickPosition)
          {
            clickPosition = event.gesture.center;
            last = event.timeStamp;
          }
          else
          {
            if((event.timeStamp - last) < 500 && Math.abs(clickPosition.clientX-current.clientX) < 5 && Math.abs(clickPosition.clientY-current.clientY) < 5)
            {
              return;
            }
            else
            {
              clickPosition = current;
              last = event.timeStamp;
            }
          }
          return scope.$apply(function() {
            return fn(scope, {
              $event: event
            });
          });
        });
      }
    };
    }
  ]);
});
