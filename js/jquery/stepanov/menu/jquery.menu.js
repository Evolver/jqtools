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
  MENU_EFFECT_SLIDE_OUT: 'slideOut',
  
  // load menu items from url
  _menuItemsFromUrl: function( nodeId, options) {
    
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
      }
    });

    // return nodes
    return ret;
  }
  
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
      options.select =function( id) {};
      
    // menu focus handler
    if( typeof options.focus =='undefined')
      options.focus =function( id) {};
      
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

      // store handlers
      jQuery(this)
        .data( 'options', options)
        .data( 'origin', origin)
        .append( '<div class="submenu"></div>')
        // initially hide submenu
        .find( '> div.submenu')
        .hide()
        .end()
        
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
      var options =jQuery(this).data( 'options');
      
      // see if there are menus opened on another levels than current node
      //  and close them
      jQuery(this)._menuCloseParentLevels();
      
      // see if root node, and if not, remove selected class
      if( this.getAttribute( 'node') !==null) {
        // remove selected class from all nodes
        jQuery(this.parentNode)
          .find( '> div')
          .removeClass( 'selected');
      }
      
      // see if current menu is already loaded
      if( jQuery(this).find( '> div.submenu > div').size() >0) {
        // close opened submenus
        jQuery(this).find( '> div.submenu > div').menuClose();

      } else if( this.getAttribute( 'submenu') ===null || this.getAttribute( 'submenu') =='yes') {
        // got submenu, render it
          
        // get properties
        var nodeId =this.getAttribute( 'node');
        
        // node container
        var nodes ={};
        
        switch( options.type) {
          // load from callback
          case jQuery.MENU_FROM_CALLBACK:
            nodes =options.callback( nodeId, this);
          break;
          // load from url
          case jQuery.MENU_FROM_URL:
            nodes =jQuery._menuItemsFromUrl( nodeId, options);
          break;
        }
        
        // render nodes
        var html ='';
        for( k in nodes)
          html += '<div node="' +k +'" submenu="' +(nodes[ k].hasSubmenu ? 'yes' : 'no') +'">' +
                    '<div class="item">' +nodes[ k].html +'</div>' +
                  '</div>';
                  
        // assign html
        var submenu =jQuery(this).find( '> div.submenu');
        submenu
          .html( html)
          // show subnode to be able to correctly position it on the screen
          .show();
          
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
          
        // initialize each menu item
        jQuery(this)
          .find( '> div.submenu > div')
          .menu( options);
      }
        
      // add selected class to the menu item
      jQuery(this)
        .addClass( 'selected');
        
      // trigger focus handler
      options.focus( this.getAttribute( 'node'), this);
      
    });
    
  },
  
  // handle menu close
  menuClose: function() {
    // iterate each item
    this.each( function(){
      // see if menu has any submenus
      if( jQuery(this).find( '> div.submenu > div').size() ==0)
        return;
        
      // get options
      var options =jQuery(this).data( 'options');
  
      var submenu =jQuery(this)
        .find( '> div.submenu > div')
        .menuClose()
        .end()
        .find( '> div.submenu');
        
      if( options.effect ==jQuery.MENU_EFFECT_NONE) {
        // instant update
        submenu
          .html( '')
          .hide();
        
      } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_OUT) {
        // slide
        submenu.hide( 'fast', function(){
          jQuery( this)
            .html( '');
        });
        
      } else if( options.effect ==jQuery.MENU_EFFECT_SLIDE_DOWN) {
        // slide
        submenu.slideUp( 'fast', function(){
          jQuery( this)
            .html( '');
        });
        
      } else if( options.effect ==jQuery.MENU_EFFECT_FADE) {
        // slide
        submenu.fadeOut( 'fast', function(){
          jQuery( this)
            .html( '');
        });
        
      }
      
      // remove selected class
      jQuery(this)
        .removeClass( 'selected');

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
  }

});