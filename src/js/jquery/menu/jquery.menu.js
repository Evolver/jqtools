/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  
  jQuery UI tools - JavaScript library.
  Copyright (C) 2009  Dmitry Stepanov <dmitrij@stepanov.lv>
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';
if( typeof jQuery.viewportVersion =='undefined')
  throw 'jQuery.viewport library is required';

// define constants
jQuery.extend({
  
  // library version
  menuVersion: 1.0,
  
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
    
    if( options.effectSpeed ===undefined)
      options.effectSpeed ='fast';
    
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
      if( options.async ===undefined)
        options.async =true;
      if( options.url ===undefined)
        throw 'No url defined. System will be unable to render menu.';
      if( options.varName ===undefined)
        options.varName ='nodeId';
      if( options.timeout ===undefined)
        options.timeout =5000;
        
      // function to call when loading nodes from url.
      //  this function is expected to return object with request data to
      //  send to server
      if( options.beforeLoadUrl ===undefined /* [object requestData] function( element, data) */)
        throw 'No beforeLoadUrl callback is defined';
        
      // menu url open handler
      if( options.loadUrlSuccess ===undefined)
        options.loadUrlSuccess =function( menu, element, data) {};
        
      // menu url error handler
      if( options.loadUrlError ===undefined)
        options.loadUrlError =function( menu, element, data) {};
        
      // menu url completion handler
      if( options.loadUrlComplete ===undefined)
        options.loadUrlComplete =function( menu, element, data) {};
    }
      
    // menu select handler
    if( options.select ===undefined)
      options.select =function( menu, element, data) {};
      
    // menu open handler
    if( options.open ===undefined)
      options.open =function( menu, element, data) {};
      
    // menu close handler
    if( options.close ===undefined)
      options.close =function( menu, element, data) {};
      
    // callback to initialize menu item
    if( options.init ===undefined)
      throw 'No init callback has been specified, menu rendering will not be possible';
      
    // menu draw handler
    if( options.draw ===undefined)
      options.draw =function( menu, element, submenu, data){ return true; /* apply factory effects */};
      
    // align absolute menu to viewport?
    if( options.alignToViewport ===undefined)
      options.alignToViewport =true;
      
    // viewport alignment gap in pixels
    if( options.viewportGap ===undefined)
      options.viewportGap =20;
      
    // do not reload menu's cache all the time
    if( options.cache ===undefined)
      options.cache =false;
      
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
      
      // document click handler
      var clickFn =function(e){
        jMenu.closeMenu();
      };
      
      // close menu on document click
      jQuery(document).click( clickFn);
      
      // cleanup when menu object is removed
      jMenu
        .bind( 'remove', function( e){
          // remove click event handler
          jQuery(document).unbind( 'click', clickFn);
          // cancel all pending actions
          jMenu._menuCancelAll();
        });
    });
    
    return this;
  },
  
  // see if menu is opened
  isMenuOpened: function( target) {
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
    this.assertSingle();
    this.assertMenuOrigin();
      
    if( item ===undefined)
      item =this.get(0);// if no item, assume origin selected
      
    var jOrigin =this;
    var jMenu =jQuery(item);
      
    var ret;
    
    if( jMenu._isMenuOrigin()) {
      // root menu (origin) is always invisible
      ret =false;
      
    } else {
      // false by default
      ret =false;
      
      // seek for item on all open levels of menu
      var stack =jOrigin.data( '__stack');
      
      for( var i =0; i < stack.length; ++i) {
        // get stack element
        var elem =stack[ i];
        
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
  getParentMenuItem: function() {
    this.assertSingle();
    this.assertMenuItem();
    
    var parentOf =this.get(0);
    
    if( jQuery(parentOf.parentNode)._isMenuOrigin()) {
      // this is the root menu item
      return null;
      
    } else {
      // return closes top div.item
      return parentOf.parentNode.parentNode;
    }
  },
  
  // open specified menu item (or origin menu, if no menu item is specified)
  openMenu: function( options, __internal) {
    this.assertSingle();
    this.assertMenuOrigin();
    
    if( __internal ===undefined)
      __internal =false;
      
    // get info
    var origin =this.get( 0);
    var jOrigin =this;
    var stack =jOrigin.data( '__stack');
    var menuOptions =jOrigin.data( '__options');

    if( options ===undefined)
      options ={};
    if( options.target ===undefined)
      options.target =null;// open menu origin
    if( options.after ===undefined)
      options.after =0;// open instantly by default
      
    // item to pass to callbacks
    var item;
    var target =options.target;// target element to open
    
    if( target ===null) {
      target =this.get(0);// reset item to indicate that root node has to be opened
      item =null;
      
    } else
      item =target;
      
    var jTarget =jQuery(target);
    
    // ensure target element is menu item
    jTarget.assertMenuItem();
    
    // cancel all pending operations for current menu
    if( !__internal)
      jOrigin._menuCancelAll();
      
    // see if menu item is visible, because if it is not, we shouldn't open it
    if( target !=origin && !jOrigin.isMenuVisible( target))
      return;
      
    // see if menu has to be opened after specified timeout
    if( options.after >0) {
      // open after specified amount of miliseconds elapses
      
      // create timer
      jOrigin.data( '__timer', setTimeout( function(){
        // remove timer
        jOrigin.removeData( '__timer');
        
        // update options to indicate that menu has to be opened instantly
        options.after =0;
        
        // open menu
        jOrigin.openMenu( options, true /* internal call */);
  
      }, options.after));
      
      return;
    }
    
    // see if any nodes are open
    if( stack.length ==0) {
      // override target
      target =origin;
      
    } else {
      // close submenus
      jOrigin.closeMenu({
          'target': target /* this menu remains visible */
        },
        // internal call
        true);
    }
    
    // obtain menu representation
    var jMenu =jQuery(target);
    
    // see if this menu has submenu
    if( !jMenu._hasSubmenu())
      return;// this menu has no submenu
    
    // see if there is need to reload submenu
    if( !menuOptions.cache || !jMenu._isSubmenuLoaded()) {
      // load submenu items and show it
      switch( menuOptions.type) {
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
  closeMenu: function( options, __internal) {
    this.assertSingle();
    this.assertMenuOrigin();
    
    if( __internal ===undefined)
      __internal =false;
      
    var origin =this.get( 0);
    var jOrigin =this;
    var menuOptions =jOrigin.data( '__options');
      
    if( options ===undefined)
      options ={};
    if( options.target ===undefined)
      options.target =null;// target node to close
    if( options.after ===undefined)
      options.after =0;// close instantly by default
    
    // get data
    var target =options.target;
    
    // cancel all timed events for current menu (only if called internally)
    if( !__internal)
      jOrigin._menuCancelAll();
      
    // see if menu has to be opened after specified timeout
    if( options.after >0) {
      // open after specified amount of miliseconds elapses
      
      // create timer
      jOrigin.data( '__timer', setTimeout( function(){
        // remove timer
        jOrigin.removeData( '__timer');
        
        // update options to indicate that menu has to be opened instantly
        options.after =0;
        
        // open menu
        jOrigin.closeMenu( options, true /* internal call */);
  
      }, options.after));
      
      return;
    }
    
    // item to pass to callbacks
    var item;
    
    if( target ===null || target ==origin) {
      item =null;
      
    } else {
      item =target;
    }
    
    // ensure target element is menu item
    if( target !==null)
      jQuery(target).assertMenuItem();
    
    // get stack
    var stack =jOrigin.data( '__stack');
    
    // search the stack for item from the end, and while not found,
    //  close all items on the way
    while( true) {
      if( stack.length ==0)
        break;// no more opened menu items available
        
      // grab last stack item
      var elem =stack[ stack.length -1];
      var jElem =jQuery(elem);
   
      if( target !==null) {
        // see if there are matching menu items on current level
        var found =jElem
          ._getSubmenuItems()
          .filter(function(){
            return this ==target;
          })
          .length >0;
        
        if( found)
          break;
      }
        
      // hide submenu
      jElem._hideSubmenu();
    }
    
    return this;
  },
  
  // select menu
  selectMenu: function( target, __internal) {
    this.assertSingle();
    this.assertMenuOrigin();
    
    if( __internal ===undefined)
      __internal =false;
    
    var origin =this.get(0);
    var jOrigin =this;
    
    // cancel all pending actions
    if( !__internal)
      jOrigin._menuCancelAll();
    
    var jTarget =jQuery( target);
    
    jTarget.assertMenuItem();
    jTarget.assertNotMenuOrigin();
    
    // see if menu item is visible
    if( !jOrigin.isMenuVisible( target))
      throw 'Unable to select hidden menu item';
      
    // get options
    var menuOptions =jOrigin.data( '__options');
      
    // trigger selection
    menuOptions.select( origin, target, jTarget.data( '__data'));
    
    return this;
  },
  
  // see if menu item has submenu object
  _hasSubmenu: function() {
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
      gap: options.viewportGap,
      hide: false/* show all elements after alignment */
    });
    
    // see if was aligned horizontally
    var horizAlignResult =jSubmenu.data( 'viewportHorizAlign');
    if( horizAlignResult !==null && horizAlignResult =='right') {
      // get menu position
      var pos =jSubmenu.position();
      // move menu to the left side of the screen
      jSubmenu.css( 'left', pos.left -jSubmenu.outerWidth( false));
    }
    
    // hide all ements
    jSubmenu.hide();
    
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
    this.assertSingle();

    var ret =(this.data( '__menuOrigin') !==undefined);
    
    return ret;
  },
  
  // get menu submenu
  _getSubmenu: function() {
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
    this.assertSingle();
    this.assertMenuItem();

    return this._getSubmenu().find( '> div.item');
  },
  
  // show submenu
  _showSubmenu: function() {
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
    
    // cancel all effects on submenu
    jSubmenu.stop( true, true);

    // call menu positioning callback
    options.draw( origin, menu ==origin ? null : menu, jSubmenu.get( 0), jMenu.data( '__data'));
      
    // see if menu is absolute, and if it is, see if it fits the user's viewport
    if( jOrigin.data( '__absolute') && options.alignToViewport)
      jMenu._menuAlignToViewport();

    // apply effect
  
    if( options.effect ==jQuery.MENU_EFFECT_NONE) {
      // instant update
      jSubmenu.show();
        
    } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_OUT) {
      // slide effect
      jSubmenu.show( options.effectSpeed);
        
    } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_DOWN) {
      // slide effect
      jSubmenu.slideDown( options.effectSpeed);
        
    } else if( options.effect ==jQuery.MENU_EFFECT_FADE) {
      // slide effect
      jSubmenu.fadeIn( options.effectSpeed);
    }
    
    // update stack
    var stack =jOrigin.data( '__stack');
    
    // push opened element to stack
    stack.push( menu);
    
    // trigger open handler
    options.open( origin, menu ==origin ? null : menu, jMenu.data( '__data'));
    
    return this;
  },
  
  // hide submenu
  _hideSubmenu: function() {
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
    if( stack[ stack.length -1] !=menu)
      throw 'Unable to close not opened menu';
      
    // pop the stack
    stack.pop();
    
    // call close callback
    options.close( origin, menu ==origin ? null : menu, jMenu.data( '__data'));
    
    // get submenu
    var jSubmenu =jMenu._getSubmenu();
    
    // cancel all effects on submenu
    jSubmenu.stop( true, true);
    
    if( options.effect ==jQuery.MENU_EFFECT_NONE) {
      // instant update
      jSubmenu.hide();
      
    } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_OUT) {
      // slide
      jSubmenu.hide( options.effectSpeed);
      
    } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_DOWN) {
      // slide
      jSubmenu.slideUp( options.effectSpeed);
      
    } else if( options.effect ==jQuery.MENU_EFFECT_FADE) {
      // slide
      jSubmenu.fadeOut( options.effectSpeed);
    }
    
    return this;
  },
  
  // cancel all pending events for this menu
  _menuCancelAll: function() {
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
    this.assertSingle();
    this.assertMenuItem();
    
    var menu =this.get(0);
    var jMenu =this;
    var origin =jMenu._getMenuOrigin();
    var jOrigin =jQuery(origin);
    
    var stack =jOrigin.data( '__stack');
    
    for( var i =0; i < stack.length; ++i)
      if( stack[i] ==menu)
        return true;
        
    return false;
  },
  
  // see if submenu is loaded
  _isSubmenuLoaded: function() {
    this.assertSingle();
    this.assertMenuItem();
    
    var ret =(this.data( '__submenuLoaded') !==undefined);
    
    return ret;
  },
  
  // mark submenu as loaded
  _submenuLoaded: function() {
    this.assertSingle();
    this.assertMenuItem();
    
    this.data( '__submenuLoaded', true);
    
    return this;
  },
  
  // set submenu items
  _setSubmenuItems: function( nodes) {
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
        options.init( origin, menu, menuData);

      });
      
    jMenu
      // set submenu loaded
      ._submenuLoaded();

    return this;
  },
  
  // show submenu that is loaded and hidden
  _showSubmenuLoaded: function() {
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
      ._setSubmenuItems( options.callback( origin, menu ==origin ? null : menu, jMenu.data( '__data')))
      // show submenu
      ._showSubmenu();
    
    return this;
  },
  
  // show submenu from url
  _showSubmenuFromUrl: function() {
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
    var requestData =options.beforeLoadUrl( origin, item, menuData);
    
    // assign xml http request to current element
    jOrigin.data( '__xhr', jQuery.ajax({
      // asynchronous request
      async: options.async,
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
        options.loadUrlSuccess( origin, item, menuData);
        
        // assign submenu
        jMenu._setSubmenuItems( data);
        
        // see if menu is already opened
        if( jOrigin.isMenuOpened( menu))
          return;// no need to show submenu at this point

        // show submenu
        jMenu._showSubmenu();
      },
      
      // handle error
      error: function( XMLHttpRequest, textStatus, errorThrown) {
        // trigger error
        options.loadUrlError( origin, menu, menuData);
      },
      
      // handle complete
      complete: function() {
        // remove xml http request object
        jOrigin.removeData( '__xhr');
        
        // call completion routine
        options.loadUrlComplete( origin, menu, menuData);
      }
    }));
    
    return this;
  }
  
});