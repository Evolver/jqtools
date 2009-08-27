/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  *
  * Dynamic menu for high volume tree navigation
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';
if( typeof jQuery.viewportVersion =='undefined')
  throw 'jQuery.viewport library is required';

// define constants
jQuery.extend({
  
  // menu types
  MENU_FROM_CALLBACK: 'callback',
  MENU_FROM_URL: 'url',
  
  // effect types
  MENU_EFFECT_NONE: 'none',
  MENU_EFFECT_FADE: 'fade',
  MENU_EFFECT_SLIDE_DOWN: 'slideDown',
  MENU_EFFECT_SLIDE_OUT: 'slideOut'
  
});

// define functionality
jQuery.fn.extend({
  
  // ensure selected item is menu origin
  assertMenuOrigin: function() {
    if( this.data( '__menuOrigin') ===undefined)
      throw 'The selected item is not menu origin';
  },
  
  // ensure selected item is not menu origin
  assertNotMenuOrigin: function() {
    if( this.data( '__menuOrigin') !==undefined)
      throw 'The selected item is menu origin';
  },
  
  // ensure selected item is menu item
  assertMenuItem: function() {
    // either if object is menu origin, or is object with class item
    if( this.data( '__menuOrigin') ===undefined && !this.hasClass( 'item'))
      throw 'The selected item is not menu item';
  },
  
  // initialize menu
  menu: function( options) {
    
    if( options ===undefined)
     options ={};
    
    if( options.effect ===undefined)
      options.effect =jQuery.MENU_EFFECT_NONE;
      
    else switch( options.effect) {
      // see if valid effect passed
      case jQuery.MENU_EFFECT_NONE:
      case jQuery.MENU_EFFECT_FADE:
      case jQuery.MENU_EFFECT_SLIDE_OUT:
      case jQuery.MENU_EFFECT_SLIDE_DOWN:
      break;
      // invalid effect
      default:
        throw 'Invalid effect type "' +options.effect +'"';
      break;
    }
    
    if( options.type ===undefined)
      options.type =jQuery.MENU_FROM_CALLBACK;
      
    else switch( options.type) {
      // see if valid option type passed
      case jQuery.MENU_FROM_CALLBACK:
      case jQuery.MENU_FROM_URL:
      break;
      // invalid type
      default:
        throw 'Invalid menu type "' +options.type +'"';
      break;
    }
      
    if( options.type ==jQuery.MENU_FROM_CALLBACK) {
      // see if callback function is defined
      if( options.callback ===undefined)
        throw 'No preload callback defined. System will be unable to render menu.';
        
    } else if( options.type ==jQuery.MENU_FROM_URL) {
      // see if url is defined
      if( options.url ===undefined)
        throw 'No url defined. System will be unable to render menu.';
      if( options.varName ===undefined)
        options.varName ='nodeId';
      if( options.requestData ===undefined)
        options.requestData ={};
      if( options.timeout ===undefined)
        options.timeout =5000;
        
      // function to call when loading nodes from url.
      //  this function is expected to return object with request data to
      //  send to server
      if( options.beforeLoadUrl ===undefined /* [object requestData] function( element, data) */)
        throw 'No beforeLoadUrl callback is defined';
        
      // menu url open handler
      if( options.loadUrlSuccess ===undefined)
        options.loadUrlSuccess =function( element, data) {};
        
      // menu url error handler
      if( options.loadUrlError ===undefined)
        options.loadUrlError =function( element, data) {};
        
      // menu url completion handler
      if( options.loadUrlComplete ===undefined)
        options.loadUrlComplete =function( element, data) {};
    }
      
    // menu select handler
    if( options.select ===undefined)
      options.select =function( element, data) {};
      
    // menu open handler
    if( options.open ===undefined)
      options.open =function( element, data) {};
      
    // menu close handler
    if( options.close ===undefined)
      options.close =function( element, data) {};
      
    // callback to initialize menu item
    if( options.init ===undefined)
      options.init =function( element, data) {};
      
    // menu draw handler
    if( options.draw ===undefined)
      options.draw =function( element, submenu, data){ return true; /* apply factory effects */};
      
    // align absolute menu to viewport?
    if( options.alignToViewport ===undefined)
      options.alignToViewport =true;
      
    // viewport alignment gap in pixels
    if( options.viewportGap ===undefined)
      options.viewportGap =20;
      
    // menu opening delay in ms
    if( options.openDelay ===undefined)
      options.openDelay =200;
      
    // menu closing delay in ms
    if( options.closeDelay ===undefined)
      options.closeDelay =1000;
      
    // do not reload menu's cache all the time
    if( options.cache ===undefined)
      options.cache =false;
      
    jQuery.debug( ':menu( options) [' +this.length +']');

    // iterate each matched element
    this.each( function(){
      var menu =this;
      var jMenu =jQuery( menu);
      var isAbsolutePositioned =(jMenu.css( 'position') =='absolute');
      
      // initialize menu object
      jMenu
        // store options
        .data( '__options', options)
        // store absolute state info
        .data( '__absolute', isAbsolutePositioned)
        // init opened menu stack
        .data( '__stack', new Array())
        // mark as menu origin
        .data( '__menuOrigin', true)
        // set data to nothing
        .data( '__data', null)
        // hide root submenu
        .hide();
        
      // call init callback for menu
      options.init( null, null);
    });
    
    return this;
  },
  
  // see if menu is opened
  isMenuOpen: function( target) {
    jQuery.debug( ':isMenuOpen');
    
    this.assertSingle();
    this.assertMenuOrigin();
    
    if( target ===undefined || target ===null)
      target =this.get(0);// if no target specified, assume origin
      
    var jTarget =jQuery(target);
    
    // ensure target element is menu item
    jTarget.assertMenuItem();
    
    var jOrigin =this;
    var stack =jOrigin.data( '__stack');
    
    var ret =false;
    
    // i could use indexOf here, but damn IE does not support it, even IE8!
    for( var i =0; i < stack.length; ++i) {
      if( stack[i] ==target) {
        ret =true;
        break;
      }
    }

    return ret;
  },
  
  // see if menu is visible
  isMenuVisible: function( item) {
    jQuery.debug( ':isMenuVisible');
    
    this.assertSingle();
    this.assertMenuOrigin();
      
    if( item ===undefined)
      item =this.get(0);// if no item, assume origin selected
      
    var jOrigin =this;
    var jMenu =jQuery(item);
      
    var ret;
    
    if( jMenu._isMenuOrigin()) {
      // root menu is always invisible
      ret =false;
      
    } else {
      // false by default
      ret =false;
      
      // seek for item on all open levels of menu
      var stack =jOrigin.data( '__stack');
      
      while( stack.length >0) {
        // get stack element
        var elem =stack.pop();
        
        // see if it has searched item
        var elemCount =
          jQuery(elem)
            ._getSubmenuItems()
            // filter current item only
            .filter(function(){
              return this ==item;
            })
            .length;
            
        // if has
        if(elemCount >0) {
          // found menu item
          ret =true;
          break;
        }
      }
    }
 
    return ret;
  },
  
  // get parent menu item
  getParentMenuItem: function( parentOf) {
    jQuery.debug( ':getParentMenuItem');
    
    this.assertSingle();
    this.assertMenuOrigin();
    
    // get origin
    var origin =this.get(0);
    
    if( jQuery(parentOf.parentNode)._isMenuOrigin()) {
      // parentOf - root item
      if( parentOf.parentNode !=origin)
        throw 'The object does not belong to current menu';
      // this is the root menu item
      return null;
      
    } else {
      // return closes top div.item
      return parentOf.parentNode.parentNode;
    }
  },
  
  // open specified menu item (or origin menu, if no menu item is specified)
  openMenu: function( target) {
    jQuery.debug( ':openMenu');
    
    this.assertSingle();
    this.assertMenuOrigin();
    
    // item to pass to callbacks
    var item;
    
    if( target ===undefined || target ===null) {
      target =this.get(0);// reset item to indicate that root node has to be opened
      item =null;
      
    } else
      item =target;
      
    var jTarget =jQuery(target);
    
    // ensure target element is menu item
    jTarget.assertMenuItem();
      
    // get info
    var origin =this.get( 0);
    var jOrigin =this;
    var stack =jOrigin.data( '__stack');
    var options =jOrigin.data( '__options');
    
    // see if menu is already opened
    if( jOrigin.isMenuOpen( item))
      return;

    // cancel all pending operations for current menu
    jOrigin._menuCancelAll();
    
    // see if any nodes are open
    if( stack.length ==0) {
      // override target
      target =origin;
      
    } else {

      // find on which level of stack target to be opened is located
      var found =false;
      var stackIndex;
      
      for( stackIndex =0; stackIndex < stack.length; ++stackIndex) {
        // see if current stack level has the element
        var elemCount =
          jQuery( stack[stackIndex])
            ._getSubmenuItems()
            .filter(function(){
              return this ==target;
            })
            .length;
            
        // if has
        if( elemCount >0) {
          // item found
          found =true;
          break;
        }
      }
      
      if( !found)
        return;// item was not found, so do not open currently not visible items
        
      // see if there are any menus to close
      if( stackIndex < (stack.length -1)) {
        // close submenus
        jOrigin.closeMenu( stack[ stackIndex] /* leave this menu opened */);
      }
    }
    
    // obtain menu representation
    var jMenu =jQuery(target);
    
    // see if this menu has submenu
    if( !jMenu._hasSubmenu())
      return;// this menu has no submenu
    
    // see if there is need to reload submenu
    if( !options.cache || !jMenu._isSubmenuLoaded()) {
      // load submenu items and show it
      switch( options.type) {
        // load from callback
        case jQuery.MENU_FROM_CALLBACK:
          jMenu._showSubmenuFromCallback();
        break;
        // load from url
        case jQuery.MENU_FROM_URL:
          jMenu._showSubmenuFromUrl();
        break;
      }
      
    } else {
      // instantly show submenu
      jMenu._showSubmenuLoaded();
    }
    
    return this;
  },
  
  // close all menu items (or close till specified menu item is met (specified menu item remains visible))
  closeMenu: function( target) {
    jQuery.debug( ':closeMenu');
    
    this.assertSingle();
    this.assertMenuOrigin();
    
    // get data
    var origin =this.get( 0);
    var jOrigin =this;
    
    // item to pass to callbacks
    var item;
    
    if( target ===undefined) {
      target =null;// reset item to indicate that root node has to be closed
      item =null;
      
    } else if( target ==origin) {
      item =null;
      
    } else {
      item =target;
    }
    
    // ensure target element is menu item
    if( target !==null)
      jQuery(target).assertMenuItem();

    // get options
    var options =jOrigin.data( '__options');
    
    // search the stack for item from the end, and while not found,
    //  close all items on the way
    while( true) {
      var stack =jOrigin.data( '__stack');
      if( stack.length ==0)
        break;// no more opened menu items available
        
      // grab last stack item
      var elem =stack[ stack.length -1];
      
      // see if met leftmost menu item
      if( target !==null && elem ==target)
        break;// interrupt process
        
      var jElem =jQuery(elem);
        
      // hide submenu
      jElem._hideSubmenu();
    }
    
    return this;
  },
  
  // select menu
  selectMenu: function( target) {
    jQuery.debug( ':selectMenu');
    
    this.assertSingle();
    this.assertMenuOrigin();
    
    var jOrigin =this;
    var jTarget =jQuery( target);
    
    jTarget.assertMenuItem();
    jTarget.assertNotMenuOrigin();
    
    // see if menu item is visible
    if( !jOrigin.isMenuVisible( target))
      throw 'Unable to select hidden menu item';
      
    // get options
    var options =jOrigin.data( '__options');
      
    // trigger selection
    options.select( item, jTarget.data( '__data'));
    
    return this;
  },
  
  // see if menu item has submenu object
  _hasSubmenu: function() {
    jQuery.debug( ':_hasSubmenu');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // see if menu item has submenu
    var menu =this.get(0);
    var jMenu =this;
    
    if( jMenu._isMenuOrigin())
      return true;// menu origin always has submenu
    
    var ret =(menu.getAttribute( 'submenu') =='yes');
    
    if( ret) {
      // create submenu object inside item if it is not already there
      if( !jMenu._hasSubmenuObject()) {
        // create submenu and return it
        jMenu._createSubmenuObject();
      }
    }
    
    // return info
    return ret;
  },
  
  // align menu to user viewport
  _menuAlignToViewport: function() {
    jQuery.debug( ':_menuAlignToViewport');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // get options
    var jMenu =this;
    var origin =jMenu._getMenuOrigin();
    var jOrigin =jQuery( origin);
    var options =jOrigin.data( '__options');
    var jSubmenu =jMenu._getSubmenu();
    
    // align item to viewport
    jSubmenu.alignToViewport({
      gap: options.viewportGap
    });
    
    // see if was aligned horizontally
    var horizAlignResult =jSubmenu.data( 'viewportHorizAlign');
    if( horizAlignResult !==null && horizAlignResult =='right') {
      // get menu position
      var pos =jSubmenu.position();
      // move menu to the left side of the screen
      jSubmenu.css( 'left', pos.left -jSubmenu.outerWidth( false));
    }
    
    return this;
  },
  
  // create submenu object
  _createSubmenuObject: function() {
    this.assertSingle();
    this.assertMenuItem();

    // append every item with submenu
    this
      .append( '<div class="submenu"></div>')
      .find( '> div.submenu')
      .hide();

    return this;
  },
  
  // get submenu object
  _hasSubmenuObject: function( ) {
    jQuery.debug( ':_hasSubmenuObject');
    
    this.assertSingle();
    this.assertMenuItem();
    
    var ret;
    
    if( !this._isMenuOrigin())
      ret =this.find( '> div.submenu').length >0;
    else
      // root menu always has submenu
      ret =true;
      
    return ret;
  },
  
  // see if object is menu origin
  _isMenuOrigin: function() {
    jQuery.debug( ':_isMenuOrigin');
    
    this.assertSingle();

    var ret =(this.data( '__menuOrigin') !==undefined);
    
    return ret;
  },
  
  // get menu submenu
  _getSubmenu: function() {
    jQuery.debug( ':_getSubmenu');
    
    this.assertSingle();
    this.assertMenuItem();

    // see if current node is origin node
    if( jQuery(this)._isMenuOrigin())
      return this;
    else
      return jQuery(this).find( '> div.submenu');
  },
  
  // get menu items
  _getSubmenuItems: function() {
    jQuery.debug( ':_getSubmenuItems');
    
    this.assertSingle();
    this.assertMenuItem();

    return this._getSubmenu().find( '> div.item');
  },
  
  // show submenu
  _showSubmenu: function() {
    jQuery.debug( ':_showSubmenu');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // get data
    var menu =this.get( 0);
    var jMenu =jQuery( menu);
    var origin =jMenu._getMenuOrigin();
    var jOrigin =jQuery( origin);
    var options =jOrigin.data( '__options');
      
    // show submenu
    var jSubmenu =jMenu._getSubmenu();
    
    // show submenu to be able to correctly position it on the screen
    jSubmenu.show();

    // call menu positioning callback
    var applyFactoryEffects =options.draw( menu ==origin ? null : menu, jSubmenu.get( 0), jMenu.data( '__data'));
      
    // see if menu is absolute, and if it is, see if it fits the user's viewport
    if( jOrigin.data( '__absolute') && options.alignToViewport)
      jMenu._menuAlignToViewport();

    // see if factory effects need to be displayed
    if( applyFactoryEffects) {
    
      // hide submenu
      jSubmenu.hide();
    
      // apply factory effects
    
      if( options.effect ==jQuery.MENU_EFFECT_NONE) {
        // instant update
        jSubmenu.show();
          
      } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_OUT) {
        // slide effect
        jSubmenu.show( 'fast');
          
      } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_DOWN) {
        // slide effect
        jSubmenu.slideDown( 'fast');
          
      } else if( options.effect ==jQuery.MENU_EFFECT_FADE) {
        // slide effect
        jSubmenu.fadeIn( 'fast');
      }
    }
    
    // update stack
    var stack =jOrigin.data( '__stack');
    
    // push opened element to stack
    stack.push( menu);
    
    // update stack
    jOrigin.data( '__stack', stack);
    
    // trigger open handler
    options.open( menu, jMenu.data( '__data'));
    
    return this;
  },
  
  // hide submenu
  _hideSubmenu: function() {
    jQuery.debug( ':_hideSubmenu');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // get data
    var menu =this.get(0);
    var jMenu =jQuery( menu);
    var origin =jMenu._getMenuOrigin();
    var jOrigin =jQuery( origin);
    var options =jOrigin.data( '__options');
    
    // update stack
    var stack =jOrigin.data( '__stack');
    
    // po opened element to stack
    if( stack.pop() !=menu)
      throw 'Unable to close not opened menu';
    
    // update stack
    jOrigin.data( '__stack', stack);
    
    // call close callback
    options.close( menu ==origin ? null : menu, jMenu.data( '__data'));
    
    // get submenu
    var jSubmenu =jMenu._getSubmenu();
    
    if( options.effect ==jQuery.MENU_EFFECT_NONE) {
      // instant update
      jSubmenu.hide();
      
    } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_OUT) {
      // slide
      jSubmenu.hide( 'fast');
      
    } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_DOWN) {
      // slide
      jSubmenu.slideUp( 'fast');
      
    } else if( options.effect ==jQuery.MENU_EFFECT_FADE) {
      // slide
      jSubmenu.fadeOut( 'fast');
    }
    
    return this;
  },
  
  // cancel all pending events for this menu
  _menuCancelAll: function() {
    jQuery.debug( ':_menuCancelAll');
    
    this.assertSingle();
    this.assertMenuOrigin();
      
    var jOrigin =this;
    var options =jOrigin.data( '__options');
      
    // cancel ajax requests
    if(( options.type ==jQuery.MENU_FROM_URL) && (jOrigin.data( '__xhr') !==undefined)) {
      // abort request
      jOrigin.data( '__xhr').abort();
      // remove data
      jOrigin.removeData( '__xhr');
    }
    
    // cancel timed operations
    if( jOrigin.data( '__timer') !==undefined) {
      // cancel timer
      clearTimeout( jOrigin.data( '__timer'));
      // remove data
      jOrigin.removeData( '__timer');
    }
    
    return this;
  },
  
  // get menu item origin
  _getMenuOrigin: function() {
    jQuery.debug( ':_getMenuOrigin');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // menu to return
    var menu =this.get(0);
    
    // search for origin
    while( true) {
      if( jQuery(menu)._isMenuOrigin())
        break;
        
      if( !menu.parentNode)
        throw 'Could not find menu origin';
        
      menu =menu.parentNode;
    }
    
    // return origin
    return menu;
  },
  
  // see if menu is open
  _isSubmenuOpened: function() {
    jQuery.debug( ':_isSubmenuOpened');
    
    this.assertSingle();
    this.assertMenuItem();

    // return hidden flag
    var ret =this._getSubmenu().is(":visible");
    
    return ret;
  },
  
  // see if submenu is loaded
  _isSubmenuLoaded: function() {
    jQuery.debug( ':_isSubmenuLoaded');
    
    this.assertSingle();
    this.assertMenuItem();
    
    var ret =(this.data( '__submenuLoaded') !==undefined);
    
    return ret;
  },
  
  // mark submenu as loaded
  _submenuLoaded: function() {
    jQuery.debug( ':_submenuLoaded');
    
    this.assertSingle();
    this.assertMenuItem();
    
    this.data( '__submenuLoaded', true);
    
    return this;
  },
  
  // set submenu items
  _setSubmenuItems: function( nodes) {
    jQuery.debug( ':_setSubmenuItems');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // get data
    var menu =this.get( 0);
    var jMenu =jQuery(menu);
    var origin =jMenu._getMenuOrigin();
    var jOrigin =jQuery(origin);
    var options =jOrigin.data( '__options');
    
    var jSubmenu =jMenu._getSubmenu();
    
    // render nodes
    var html ='';
    var i;
    for( i =0; i < nodes.length; ++i)
      html += '<div class="item" submenu="' +(nodes[ i].hasSubmenu ? 'yes' : 'no') +'">' +
                '<div class="entry">' +nodes[ i].html +'</div>' +
              '</div>';

    // iteration index
    i =0;
              
    jSubmenu
      // set submenu items
      .html( html)
      // find them
      .find( '> div.item')
      // initialize them
      .each( function(){
        var menu =this;
        var jMenu =jQuery(menu);
        var menuData =nodes[i++].data;
        
        // assign each menu item data
        jMenu.data( '__data', menuData);
        
        // initialize it
        options.init( menu, menuData);
        
        // bind events for menu items
        jMenu
          // listen to click event on current item
          .mouseenter( function( e){
            // trigger item selection

            // trigger menu selection
            //origin.selectMenu( elem);
            
            jOrigin.openMenu( this);

            // stop event propagation
            //e.stopPropagation();
          });/*
          // leave menu
          .mouseleave( function( e){
            // close menu
            jOrigin.closeMenu( this);
            
          });*/
        
      });
      
    jMenu
      // set submenu loaded
      ._submenuLoaded();

    return this;
  },
  
  // show submenu that is loaded and hidden
  _showSubmenuLoaded: function() {
    jQuery.debug( ':_showSubmenuLoaded');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // update stack
    var menu =this.get( 0);
    var jMenu =this;
    
    jMenu
      // show submenu
      ._showSubmenu();

    return this;
  },
  
  // show submenu from callback
  _showSubmenuFromCallback: function() {
    jQuery.debug( ':_showSubmenuFromCallback');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // get origin
    var menu =this.get(0);
    var jMenu =this;
    var origin =jMenu._getMenuOrigin();
    var jOrigin =jQuery( origin);
    var options =jOrigin.data( '__options');
    
    jMenu
      // assign submenu items
      ._setSubmenuItems( options.callback( menu ==origin ? null : menu))
      // show submenu
      ._showSubmenu();
    
    return this;
  },
  
  // show submenu from url
  _showSubmenuFromUrl: function() {
    jQuery.debug( ':_showSubmenuFromUrl');
    
    this.assertSingle();
    this.assertMenuItem();
    
    // get data
    var menu =this.get(0);
    var jMenu =this;
    var origin =jMenu._getMenuOrigin();
    var jOrigin =jQuery( origin);
    
    // item to pass to callbacks
    var item =(menu ==origin ? null : menu);
    
    // get options
    var options =jOrigin.data( '__options');
    var menuData =jMenu.data( '__data');
    
    // execute preloading handler
    var requestData =options.beforeLoadUrl( item, menuData);
    
    // assign xml http request to current element
    jOrigin.data( '__xhr', jQuery.ajax({
      // asynchronous request
      async: true,
      // do not cache results
      cache: false,
      // pass request data
      data: requestData,
      // expecting json array to be returned
      dataType: 'json',
      // specify timeout
      timeout: options.timeout,
      // post
      type: 'POST',
      // to this url
      url: options.url,
      // do not poll XmlHttpRequest, attach directly to onreadystatechange
      requestPolling: false,
      
      // handle success
      success: function( data) {
        
        // open url success
        options.loadUrlSuccess( item, menuData);
        
        // assign submenu
        jMenu._setSubmenuItems( data);
        
        // see if menu is already opened
        if( jOrigin.isMenuOpen( menu))
          return;// no need to show submenu at this point

        // show submenu
        jMenu._showSubmenu();
      },
      
      // handle error
      error: function( XMLHttpRequest, textStatus, errorThrown) {
        // trigger error
        options.loadUrlError( menu, menuData);
        
        jQuery.debug( 'error - ' +textStatus);
      },
      
      // handle complete
      complete: function() {
        // remove xml http request object
        jOrigin.removeData( '__xhr');
        
        // call completion routine
        options.loadUrlComplete( menu, menuData);
      }
    }));
    
    return this;
  }
  
});