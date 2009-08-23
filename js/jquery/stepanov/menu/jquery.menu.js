/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  */

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

jQuery.fn.extend({
  
  // initialize menu
  menu: function( options) {
    
    if( typeof options.effect =='undefined')
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
    
    if( typeof options.type =='undefined')
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
      if( typeof options.callback =='undefined')
        throw 'No preload callback defined. System will be unable to render menu.';
        
    } else if( options.type ==jQuery.MENU_FROM_URL) {
      // see if url is defined
      if( typeof options.url =='undefined')
        throw 'No url defined. System will be unable to render menu.';
      if( typeof options.varName =='undefined')
        options.varName ='nodeId';
      if( typeof options.requestData =='undefined')
        options.requestData ={};
      if( typeof options.timeout =='undefined')
        options.timeout =5;
    }
      
    // menu select handler
    if( typeof options.select =='undefined')
      options.select =function( id, element) {};
      
    // menu open handler
    if( typeof options.open =='undefined')
      options.open =function( id, element) {};
      
    // menu close handler
    if( typeof options.close =='undefined')
      options.close =function( id, element) {};
      
    // function to call when loading nodes from url
    if( typeof options.beforeLoadUrl =='undefined')
      options.beforeLoadUrl =function( id, element) {};
      
    // menu url open handler
    if( typeof options.loadUrlSuccess =='undefined')
      options.loadUrlSuccess =function( id, element) {};
      
    // menu url error handler
    if( typeof options.loadUrlError =='undefined')
      options.loadUrlError =function( id, element) {};
      
    // menu draw handler
    if( typeof options.draw =='undefined')
      options.draw =function( menu){ return true; /* apply factory effects */};
      
    // align absolute menu to viewport?
    if( typeof options.alignToViewport =='undefined')
      options.alignToViewport =true;
      
    // viewport alignment gap in pixels
    if( typeof options.viewportGap =='undefined')
      options.viewportGap =20;
      
    // menu opening delay in ms
    if( typeof options.openDelay =='undefined')
      options.openDelay =200;
      
    // menu closing delay in ms
    if( typeof options.closeDelay =='undefined')
      options.closeDelay =1000;
      
    // do not reload menu's cache all the time
    if( typeof options.cache =='undefined')
      options.cache =false;

    // iterate each matched element
    this.each( function(){
      
      // assign origin
      if( this.getAttribute( 'node') ===null)
        var origin =this;
      else
        var origin =jQuery(this.parentNode.parentNode).data( 'origin');
        
      // if this is origin node, bind event handlers for menu close
      if( this.getAttribute( 'node') ===null) {
        // close menu when mouse leaves
        jQuery(this).mouseleave( function( e){
          // cancel timing if exists
          jQuery(this)._menuCancelTiming();
          
          // begin close timing
          jQuery(this)._menuBeginCloseTiming();
        });
      }
      
      // store data
      jQuery(this)
        .data( 'options', options)
        .data( 'origin', origin)
        .data( 'initialized', true);
      
      // see if submenu already exists
      if( jQuery(this).find( '> div.submenu').size() >0) {
        // initialize all submenu items
        jQuery(this)
          .find( '> div.submenu > div')
          .filter( function(){
            // filter out already initialized menu items
            return !jQuery(this).data( 'initialized');
          })
          .menu( options);
          
      } else {
        // manually create submenu
        jQuery(this).append( '<div class="submenu"></div>');
      }
      
      // hide submenu
      jQuery(this)
          .find( '> div.submenu')
          .hide();

      // bind events
      jQuery(this)
        
        // listen to click event on current item
        .click( function( e){
          // handle click events
          options.select( this.getAttribute( 'node'), this);
          
          // cancel timing if exists
          jQuery(this)._menuCancelTiming();

          e.stopPropagation();
        })
        
        .mouseover( function( e){
          // cancel timing if exists
          jQuery(this)._menuCancelTiming();
          
          // assign focus info
          jQuery(origin).data( 'focused', this);
          
          // begin open timing
          jQuery(this)._menuBeginOpenTiming();
          
          e.stopPropagation();
        });
      
      // see if submenus are set to be absolute positioned, and if so,
      //  automatically adjust their z-indexes
      var submenu =jQuery(this).find( '> div.submenu');
      
      if( submenu.css( 'position') =='absolute') {
        // get z-index
        var zIndex =jQuery(this).css( 'z-index');
        if( zIndex =='auto')
          zIndex =1;
          
        // assign z-index to submenu
        submenu.css( 'z-index', zIndex);
        
        // remember the absolute positioning state
        jQuery(this)
          .data( 'absolute', true);
          
      } else
        jQuery(this)
          .data( 'absolute', false);
        
      // store menu reference
      var menu =this;
        
      // close menu on document click
      jQuery(document).click(function(){
        jQuery(menu).menuClose();
      });
    });
    
    return this;
  },
  
  // internal menu handlers
  menuOpen: function() {

    // iterate each menu we have to open
    this.each( function(){
      
      // get options
      var nodeId =this.getAttribute( 'node');
      var options =jQuery(this).data( 'options');
      
      // see if root node, and if not, remove selected class
      if( this.getAttribute( 'node') !==null) {
        // remove selected class from all nodes
        jQuery(this.parentNode)
          .find( '> div')
          .removeClass( 'focused');
      }
      
      // see if there are menus opened on another levels than current node
      //  and close them
      jQuery(this)._menuCloseParentLevels();

      if( this.getAttribute( 'submenu') ===null || this.getAttribute( 'submenu') =='yes') {
        // got submenu, render it
        var submenu =jQuery(this).find( '> div.submenu');
          
        // see if caching is enabled and current menu is already loaded
        if( options.cache && submenu.find( '> div').size() >0) {
          // close opened submenus
          submenu.find( '> div').menuClose();
  
        } else {
          // load menu
          var nodes ={};
          
          switch( options.type) {
            // load from callback
            case jQuery.MENU_FROM_CALLBACK:
              nodes =options.callback( nodeId, this);
            break;
            // load from url
            case jQuery.MENU_FROM_URL:
              nodes =jQuery(this)._menuItemsFromUrl( nodeId, options);
            break;
          }
          
          // render nodes
          var html ='';
          for( k in nodes)
            html += '<div node="' +k +'" submenu="' +(nodes[ k].hasSubmenu ? 'yes' : 'no') +'">' +
                      '<div class="item">' +nodes[ k].html +'</div>' +
                    '</div>';
                    
          // assign html
          submenu
            .html( html);
            
          // initialize each menu item
          submenu
            .find( '> div')
            .menu( options);
        }
        
        // see if submenu is hidden, and if is, show it
        if( jQuery(this).find( '> div.submenu:hidden').size() >0) {
        
          // show subnode to be able to correctly position it on the screen
          submenu.show();
            
          // call menu positioning callback
          var applyFactoryEffects =options.draw( submenu.get( 0));
            
          // see if menu is absolute, and if it is, see if it fits the user's viewport
          if( jQuery(this).data( 'absolute') && options.alignToViewport)
            jQuery(this).menuAlignToViewport();
                    
          // see if factory effects need to be displayed
          if( applyFactoryEffects) {
          
            // hide submenu
            submenu.hide();
          
            // apply factory effects
          
            if( options.effect ==jQuery.MENU_EFFECT_NONE) {
              // instant update
              submenu.show();
                
            } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_OUT) {
              // slide effect
              submenu.show( 'fast');
                
            } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_DOWN) {
              // slide effect
              submenu.slideDown( 'fast');
                
            } else if( options.effect ==jQuery.MENU_EFFECT_FADE) {
              // slide effect
              submenu.fadeIn( 'fast');
            }
          }
          
          // trigger open handler
          options.open( this.getAttribute( 'node'), this);
        }
      }
        
      // add selected class to the menu item
      jQuery(this)
        .addClass( 'focused');
      
    });
    
  },
  
  // handle menu close
  menuClose: function() {
    // iterate each item
    this.each( function(){
      // get options
      var nodeId =this.getAttribute( 'node');
      var options =jQuery(this).data( 'options');

      // see if menu is already closed
      if( jQuery(this).find( '> div.submenu:hidden').size() >0)
        return;

      var submenu =jQuery(this)
        .find( '> div.submenu > div')
        .menuClose()
        .end()
        .find( '> div.submenu');
        
      if( options.effect ==jQuery.MENU_EFFECT_NONE) {
        // instant update
        submenu
          .hide();
        
      } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_OUT) {
        // slide
        submenu.hide( 'fast');
        
      } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_DOWN) {
        // slide
        submenu.slideUp( 'fast');
        
      } else if( options.effect ==jQuery.MENU_EFFECT_FADE) {
        // slide
        submenu.fadeOut( 'fast');
        
      }
      
      // remove selected class
      jQuery(this)
        .removeClass( 'focused');
        
      // call close callback
      options.close( nodeId, this);

    });
    
    return this;
  },
  
  // find and close parent items of selected nodes
  _menuCloseParentLevels: function() {
    // iterate each item
    this.each( function(){
      // see if we are currently in root node
      if( this.getAttribute( 'node') ===null)
        return;
        
      // get container
      var container =this.parentNode;

      // reference self
      var self =this;
      
      // close all menus except mine on current level
      jQuery( container)
        .find( '> div')
        .filter( function(){
          return this !=self;
        })
        .menuClose();
        
      // check next upper level
      jQuery( container.parentNode)._menuCloseParentLevels();
    });
  },
  
  // align menu to user viewport
  menuAlignToViewport: function() {
    // see if viewport lib is loaded
    if( typeof jQuery.fn.viewport =='undefined')
      return;// viewport lib is not loaded
      
    // iterate each item
    this.each(function(){
      // get options
      var options =jQuery(this).data( 'options');
      var menu =jQuery(this).find( '> div.submenu');
      
      // align item to viewport
      menu.alignToViewport({
        gap: options.viewportGap
      });
      
      // see if was aligned horizontally
      var horizAlignResult =menu.data( 'viewportHorizAlign');
      if( horizAlignResult !==null && horizAlignResult =='right') {
        // get menu position
        var pos =menu.position();
        // move menu to the left side of the screen
        menu.css( 'left', pos.left -menu.outerWidth( false));
      }
      
    });
  },
  
  // begin timed open event
  _menuBeginOpenTiming: function() {
    
    this.each(function(){
      // get data
      var origin =jQuery(this).data( 'origin');
      var options =jQuery(this).data( 'options');
      var self =this;
    
      // create timer
      var timer =setTimeout( function(){
        if( !self) return;// element removed while timing was active
        
        // get focused menu
        var menu =jQuery(origin).data( 'focused');
        
        // remove timer
        jQuery(origin)
          .removeData( 'timer');
          
        // open menu
        jQuery(menu)
          .menuOpen();
        
      }, options.openDelay);
      
      // assign timer
      jQuery(origin).data( 'timer', timer);
    });
    
    return this;
  },
  
  // begin timed close event
  _menuBeginCloseTiming: function() {
    
    this.each(function(){
      // get data
      var origin =jQuery(this).data( 'origin');
      var options =jQuery(this).data( 'options');
      var self =this;
    
      // create timer
      var timer =setTimeout( function(){
        if( !self) return;// element removed while timing was active
        
        // remove timer
        jQuery(origin)
          .removeData( 'timer')
          .menuClose();
        
      }, options.closeDelay);
      
      // assign timer
      jQuery(origin).data( 'timer', timer);
    });
    
    return this;
  },
  
  // cancel timed open event
  _menuCancelTiming: function() {

    this.each( function(){
      // get data
      var origin =jQuery(this).data( 'origin');
      
      // cancel timer if it exists
      if( jQuery(origin).data( 'timer')) {
        // cancel timer
        clearTimeout( jQuery(origin).data( 'timer'));
        // remove timer data
        jQuery(origin).removeData( 'timer');
      }
    });
  },
  
  // load menu items from url
  _menuItemsFromUrl: function( nodeId, options) {

    if( this.size() ==0)
      return {};// no nodes matched
      
    var elem =this.get( 0);
    
    // call function to display optional preloader if needed
    options.beforeLoadUrl( nodeId, elem);

    // return value
    var ret ={};
    var req =options.requestData;
    // append node id to the request data
    req[ options.varName] =nodeId;
    
    jQuery.ajax({
      async: false,
      cache: false,
      data: req,
      dataType: 'json',
      timeout: options.timeout,
      type: 'POST',
      url: options.url,
      
      // handle success
      success: function( data) {
        // assign return data
        ret =data;
        
        // open url success
        options.loadUrlSuccess( nodeId, elem);
      },
      
      // handle error
      error: function() {
        options.loadUrlError( nodeId, elem);
      }
    });

    // return nodes
    return ret;
  }

});