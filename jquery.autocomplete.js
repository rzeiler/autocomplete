/*!
 * jquery autocomplete
 * https://github.com/rzeiler/autocomplete
 *
 * 2020 Ralf Zeiler
 * Released under the MIT license
 */

(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else {
    factory(jQuery);
  }
})(function ($) {
  /**
   * @param {object} options
   */
  $.fn.autocomplete = function (options) {
    var settings = $.extend({}, $.fn.autocomplete.defaults, options);

    var keyCode = {
      BACKSPACE: 8,
      COMMA: 188,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      LEFT: 37,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SPACE: 32,
      TAB: 9,
      UP: 38,
      ALL: "ALL",
    };
    return this.each(function () {
      var target = this;
      var self = $(target);
      self.wrap(settings.wrapperFormat(settings.wrapperClass));
      var $list = $("<div/>", {
        class: settings.menuClass,
        data: {
          loading: false,
          index: 0,
          control: self,
        },
      });
      $list.insertAfter(self);

      self.data("list", $list);
      self.data("type", "autocomplete");

      this._response = function (data) {
        var list = $(this).data("list");
        list.empty();
        list.data({ index: 0, loading: false });
        var term = self.val();
        $("<div/>", {
          text: term,
          css: { display: "none" },
          data: { index: 0, isItem: false },
        }).appendTo(list);
        $.each(data, function (i, e) {
          var elm = settings.itemFormat(e, settings.menuItemClass);
          elm.data({ index: i + 1, isItem: true });
          elm.appendTo(list);
        });
        /** info */
        if (data.length == 0) {
          var elm = settings.itemFormat(
            settings.noRecordsFound,
            settings.noRecordsFoundClass
          );
          elm.appendTo(list);
        }
      };
      /** close list */
      this._close = function () {
        $(this).data("list").removeClass(settings.menuOpenClass);
      };
      /** timmer */
      this._timer = null;
      /** disable autocomplete */
      self.attr("autocomplete", "off");
      /** catch input events */
      self.on("mousedown keydown keyup blur", function (event) {
        var list = $(this).data("list");
        list.data("control", this);
        switch (event.type) {
          case "mousedown":
            if (list.hasClass(settings.menuOpenClass)) {
              list.removeClass(settings.menuOpenClass);
            } else {
              list.addClass(settings.menuOpenClass);
            }
            break;
          case "keyup":
            var build = list.data("build");
            switch (event.keyCode) {
              case keyCode.TAB:
                list.addClass(settings.menuOpenClass);
                break;
              default:
                if (build) {
                  list.addClass(settings.menuOpenClass);
                  var term = self.val();
                  index = 0;
                  if (event.keyCode == keyCode.ALL) term = "";
                  if (Array.isArray(settings.source)) {
                    var arr = $.grep(settings.source, function (n, i) {
                      if (n.toLowerCase().indexOf(term.toLowerCase()) != -1)
                        return n;
                    });
                    this._response(arr);
                  } else if (typeof settings.source === "function") {
                    var that = this;
                    clearTimeout(this._timer);
                    this._timer = setTimeout(function () {
                      settings.source(term, function (data) {
                        that._response(data);
                      });
                    }, 300);
                  }
                }
                break;
            }
            break;
          case "keydown":
            list.data("index");
            var index = parseInt(list.data("index")),
              newIndex = index;
            var update = false;
            list.data("build", false);
            switch (event.keyCode) {
              case keyCode.PAGE_UP:
                newIndex--;
                update = true;
                break;
              case keyCode.PAGE_DOWN:
                newIndex++;
                update = true;
                break;
              case keyCode.UP:
                newIndex--;
                update = true;
                break;
              case keyCode.DOWN:
                newIndex++;
                update = true;
                break;
              case keyCode.ENTER:
                /** if custum input not allowed */
                if (!settings.allowCustomText) {
                  var finds = list.children().filter(function () {
                    return $(this).text() === self.val();
                  });
                  if (finds.length !== 1) {
                    self.val("no!!");
                  }
                }

                this._close();
                event.preventDefault();
                event.stopPropagation();
                return false;
                break;
              default:
                if (!list.data("loading")) {
                  list.empty();
                  var elm = settings.itemFormat(
                    settings.loadingText,
                    settings.menuItemClass
                  );
                  elm.appendTo(list);
                  list.data("loading", true);
                }
                list.data("build", true);
                break;
            }
            if (list.hasClass(settings.menuOpenClass)) {
              if (update) {
                var children = list.children();
                var child = children.eq(newIndex),
                  oldChild = children.eq(index);
                oldChild.removeClass(settings.highlightClass);
                if (newIndex == -1) {
                  newIndex = children.toArray().length - 1;
                }
                if (newIndex >= children.toArray().length) {
                  newIndex = 0;
                }
                /* set text */
                self.val(child.text());
                /* set class */
                child.addClass(settings.highlightClass);
                list.data("index", newIndex);
                /** stop all */
                event.preventDefault();
                event.stopPropagation();
              }
            }
            break;
          case "blur":
            list.removeClass(settings.menuOpenClass);
            break;
        }
      });
      /** catch list events */
      $list.on("mousedown mouseover mouseleave", function (event) {
        var list = $(event.currentTarget),
          index = parseInt(list.data("index")),
          target = $(event.target),
          newIndex = target.data("index");

        if (target.data("isItem")) {
          switch (event.type) {
            case "mouseover":
              list.data("index", newIndex);
              target.addClass(settings.highlightClass);
              list.children().eq(index).removeClass(settings.highlightClass);
              break;
            case "mouseleave":
              break;
            case "mousedown":
              list.data("control").value = target.text();
              break;
          }
        }
      });
    });
  };

  /**
   * @param {string} highlightClass default bg-light text-dark
   */
  $.fn.autocomplete.defaults = {
    highlightClass: "bg-light text-dark",
    wrapperClass: "dropdown",
    menuClass: "dropdown-menu",
    menuItemClass: "dropdown-item",
    menuOpenClass: "show",
    loadingText: "loading...",
    source: null,
    allowCustomText: false,
    noRecordsFound: "Keine Elemnte gefunden!",
    noRecordsFoundClass: "dropdown-item bg-danger text-white",
    itemFormat: function (text, cssclass) {
      return $("<div/>", {
        text: text,
        class: cssclass,
      });
    },
    wrapperFormat: function (cssclass) {
      return $("<div/>", {
        class: cssclass,
      });
    },
  };
});
