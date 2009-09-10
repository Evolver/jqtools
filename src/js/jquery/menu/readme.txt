
Theory:

  jQuery.menu manages menu loading and placing it into specified menu object's container (menu origin).
  In our example, menu origin is the div#menu element.
  
  Initially, menu origin is the same as the menu item's submenu (div.submenu elements), and, technically,
  it has no difference, so when initializing div#menu by calling $('div#menu').menu(), we are initializing
  a root submenu, that will hold a root menu item list.
  
  The markup of each submenu's item list is the following:
  
  <div class="item">
    <div class="entry">{menu item's associated html code}</div>
    <div class="submenu">{menu item's submenu items}</div>
  </div>
  <div class="item">
    ...
  </div>
  ...
  
  If you want to apply styles (weird, if you don't) to your menu, you can use following CSS code to do so:
  
  div#menu {
    // styles for root submenu
  }
  
  div#menu > div.item {
    // styles for root menu items
  }
  div#menu > div.item > div.entry {
    // styles for root menu item's representational part (html code, associated with each menu item, so called - heading)
  }
  
  div#menu div.item > div.submenu {
    // styles for each submenu of each menu item
  }
  
  div#menu > div.item > div.submenu > div.item {
    // styles for level 2 menu items
  }
  div#menu > div.item > div.submenu > div.item > div.submenu {
    // styles for level 3 submenu
  }
  
  // to open menu origin (root submenu), use
  $( '#menu').openMenu();
  
  // to open specific menu item's submenu, use the following call.
  // Note: you can open only currently visible div.item menu's submenus.
  $( '#menu').openMenu({
    'target': which// where which is the DOMElement object (div.item element) to open
    //,'after':200// uncomment this line if you want opening to trigger after 200ms
  });
  
  // to close menu, use
  $( '#menu').closeMenu();
  
  // to close specific menu item's submenu, use the following call.
  // Note: you can close only currently visible div.item menu's submenus.
  $( '#menu').closeMenu({
    'target': which// where which is the DOMElement object (div.item element) to close
    //,'after':1500// uncomment this line if you want closing to trigger after 1,5sec
  });
  
  // to trigger menu selection, use the following call.
  // Note: you can select only currently visible div.item menus.
  $( '#menu').selectMenu( which);// where 'which' is the DOMElement of menu item (div.item element).
  
  // also available methods:
  $( '#menu').isMenuOpened( which);
  $( '#menu').isMenuVisible( which);
  $( which).getParentMenuItem();// returns either null (origin reached), or DOMElement object (div.item element)

minimal markup:

  <div id="menu"></div>
  
API:
  
  var jMenu =$( '#menu');
  
  // init menu
  jMenu.menu({...});
  
  // methods
  void jMenu.openMenu( [optional] DOMElement item);
  void jMenu.closeMenu( [optional] DOMElement item);
  bool jMenu.isMenuOpened( [optional] DOMElement item);
  bool jMenu.isMenuVisible( [optional] DOMElement item);
  void jMenu.selectMenu( DOMElement item);
  DOMelement/null jMenu.getParentMenuItem();

usage:

  $( '#menu')
    .menu({
    
      /**
       * Do use jQuery.viewport library's functionality to avoid submenu's appearing off
       *  the user's viewport if submenu is positioned absolutely?
       *
       */
      alignToViewport: true,
      
      /**
       * If alignToViewport is true, then this setting is the amount of pixels to offset
       *  jQuery.viewport library's aligned submenu off the border of user's viewport.
       *
       */
      viewportGap: 20,
    
      /**
       * What effect to use to show opening and closing of menu.
       *  Possible values:
       *      jQuery.MENU_EFFECT_NONE
       *      jQuery.MENU_EFFECT_SLIDE_OUT
       *      jQuery.MENU_EFFECT_SLIDE_DOWN
       *      jQuery.MENU_EFFECT_FADE
       *
       */
      effect: jQuery.MENU_EFFECT_SLIDE_DOWN,
      
      /**
       * At what speed (value in miliseconds, string 'fast' or string 'slow') to display the effects.
       *  Default is 'fast'.
       *
       */
      effectSpeed: 'fast',
      
      /**
       * Cache loaded submenus or query new item list every time
       * user triggers opening.
       *
       */
      cache: true,
      
      /**
       * Type of gathering of each menu's submenu item list.
       *
       * 'url' - gather from url by sending POST request (AJAX)
       * 'callback' - call user-defined callback
       */
      type: 'url',
      
      /**
       * Load submenu's item list form URL asynchronously?
       * Set this setting only if type =='url'.
       *
       */
      async: true,
      
      /**
       * URL from which to obtain submenu item list (if type =='url')
       *
       */
      url: 'menuItems.php',
      
      /**
       * Callback from which to obtain submenu item list (if type =='callback').
       *  The array this callback returns is of the same format, as the data that
       *  would be obtained from URL. URL has to return JSAN (array notation).
       *
       * Menu item list format:
       *  [
       *    0: {'html': 'html code to store inside div.item element', hasSubmenu: ?boolean?, data: ?JSON?},
       *    1: ...
       *  ]
       *
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item to be loaded (menu item)]
       * @param Object data [Data that was associated with menu item]
       * @returns array
       */
      callback: function( origin, elem, data) {
        return [
          0: {'html':'Single menu item', hasSubmenu: false, data: 15 /* node id, for example */}
        ];
      },
      
      /**
       * Callback to call when submenu object (div.submenu) is about to get rendered.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item, whose submenu is about to get rendered (menu item)]
       * @param DOMElement submenu [Menu item's submenu to be rendered (menu item's submenu)]
       * @param Object data [Data that was associated with menu item]
       */
      draw: function( origin, elem, submenu, data) {
        // here it is able to manipulate CSS or content inside submenu
        //  just before submenu is being shown to the user
      },
      
      /**
       * Callback to call when menu item is being initialized for first time display.
       *
       * This callback should be used to define how you want to open submenus and how
       *  you want users to trigger menu item selection.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item to be initialized (menu item)]
       * @param Object data [Data that was associated with menu item]
       */
      init: function( origin, elem, data) {
        if( elem ===null)
          return;// we have nothing to do when origin is being initialized

        // jQuery-wrap both origin and menu item (elem)
        var jMenu =$(elem);
        var jOrigin =$(origin);
        
        // bind events for menu item
        jMenu
          // open menu's submenu when mouse overing it
          .mouseenter( function( e){
            // trigger submenu opening
            jOrigin.openMenu({
              'target': this,
              'after': 200/* wait 200ms for user to hold mouse on concrete menu item */
            });
          })
          // handle click events to trigger item selection
          .click(function( e){
            // close all submenus of current menu item
            jOrigin.closeMenu({
              // leave current menu item visible on the screen
              'target': this
            });
            
            // trigger item selection
            jOrigin.selectMenu( this);
            
            // do not trigger click events on parent menu items,
            //  otherwise menu selection will be triggered on parent
            //  menu items also.
            e.stopPropagation();
          });
      },

      /**
       * Callback to call when user triggers menu item's selection
       *  (when $('#menu').selectMenu() or jOrigin.selectMenu() is called).
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item that was selected (menu item)]
       * @param Object data [Data that was associated with menu item]
       */
      select: function( origin, elem, data) {
      },
      
      /**
       * Callback to call when user triggers opening of menu's submenu.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item that was opened (menu item)]
       * @param Object data [Data that was associated with menu item]
       */
      open: function( origin, elem, data) {
      },
      
      /**
       * Callback to call when user triggers closing of menu's submenu.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item that was closed (menu item)]
       * @param Object data [Data that was associated with menu item]
       */
      close: function( origin, elem, data) {
      },
      
      /**
       * Callback to call before sending request to specified URL to obtain
       *  menu item's submenu item list. This callback should return object
       *  with data to send to server via POST request.
       *
       * This callback should be defined only if type =='url'.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item whose submenu is going to be queried from server (menu item)]
       * @param Object data [Data that was associated with menu item]
       * @return Object
       */
      beforeLoadUrl: function( origin, elem, data) {
        if( elem ===null) {
          // data to send to load root menu items (origin)
          return {id:0;}

        } else {
          // data to send to load menu item's submenu
          return {'id':data /* assume that data contains menu id */};
        }
      },
      
      /**
       * Callback to call when menu item's submenu item list has been successfully retrieved
       *  from server.
       *
       * This callback should be defined only if type =='url'.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item whose submenu was successfully loaded (menu item)]
       * @param Object data [Data that was associated with menu item]
       */
      loadUrlSuccess: function( origin, elem, data) {
      },
      
      /**
       * Callback to call when menu item's submenu item list has failed to load from server.
       *
       * This callback should be defined only if type =='url'.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item whose submenu has failed to load (menu item)]
       * @param Object data [Data that was associated with menu item]
       */
      loadUrlError: function( origin, elem, data) {
      },
      
      /**
       * Callback to call when menu item's submenu item list URL loading has finished.
       * This callback is called after error or success callback.
       *
       * This callback should be defined only if type =='url'.
       *
       * @param DOMElement origin [Menu object (menu origin)]
       * @param DOMElement/null elem [Menu item whose submenu was attempted to load (menu item)]
       * @param Object data [Data that was associated with menu item]
       */
      loadUrlComplete: function( origin, elem, data) {
      }
    });