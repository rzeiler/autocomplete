# autocomplete

Autocomplete plugin for Bootstrap 4.x and 3.x.

It enhances form input field to provide autocomplete/typeahead capabilities.

## Installation

Download [jquery.autocomplete.js](jquery.autocomplete.js)

## Usage

Head

```html
<script src="js/jquery-3.5.1.js"></script>
<script src="jquery.autocomplete.js"></script>
```

Body

```html
<input type="text" class="form-control ajax" id="Country" />
```

```javascript
$(".ajax").autocomplete({
  highlightClass: "bg-light text-dark",
  wrapperClass: "dropdown",
  menuClass: "dropdown-menu",
  menuItemClass: "dropdown-item",
  menuOpenClass: "show",
  source: function (term, response) {
    $.ajax({
      method: "GET",
      url: "https://parseapi.back4app.com/classes/Country",
      data: {
        limit: 5,
        order: "name",
        keys: "name",
        where: { name: { $regex: term } },
      },
      dataType: "json",
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "X-Parse-Application-Id",
          "mxsebv4KoWIGkRntXwyzg6c6DhKWQuit8Ry9sHja"
        );
        xhr.setRequestHeader(
          "X-Parse-Master-Key",
          "TpO0j3lG2PmEVMXlKYQACoOXKQrL3lwM0HwR9dbH"
        );
      },
    }).done(function (msg) {
      var arr = $.map(msg.results, function (item) {
        return item.name;
      });
      response(arr);
    });
  },
  allowCustomText: false,
  noRecordsFound: "Keine Elemnte Gefunden!",
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
});
```

# Attributes

property | type | default | description 
- | - | - | -
highlightClass | string | bg-light text-dark | item highlight css class
wrapperClass | string | dropdown | css class for the wrapper element   
menuClass | string | dropdown-menu | css class for the item wrapper element  
menuItemClass | string | dropdown-item | css class for the item element  
menuOpenClass | string | show | css class to show the menu 
loadingText | string | loading... | text will visible when data is loading
source | any | null | source can be array like ["a","b"] or a function (term,response)
allowCustomText | bool | false | false mean no custom text alowed
noRecordsFound | string | Keine Elemnte gefunden! | message is showning wenn data is empty
noRecordsFoundClass | string | dropdown-item bg-danger text-white | css class for noRecordsFound element
itemFormat | function | function (text, cssclass) {return $("<div/>", {text: text,     class: cssclass, }); } | item render function
wrapperFormat | function | function (cssclass) {return $("<div/>", {class: cssclass, });  } | wrapper render function

## Demo
[demo](/docs/index.html)