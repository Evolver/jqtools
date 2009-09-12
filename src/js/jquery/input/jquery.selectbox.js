/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  *
  * Custom select box
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';

jQuery.extend({
  
  // library version
  selectboxVersion: 1.0,
  
  // select box opening effects
  SELECTBOX_EFFECT_NONE: 'none',
  SELECTBOX_EFFECT_FADE: 'fade',
  SELECTBOX_EFFECT_SLIDE_OUT: 'slideOut',
  SELECTBOX_EFFECT_SLIDE_DOWN: 'slideDown'
  
});

jQuery.fn.extend({
  
  // initialize custom select box
  selectbox: function( options) {
    if( options ===undefined || typeof options !='object')
      options ={};
      
    if( options.effect ===undefined)
      options.effect =jQuery.SELECTBOX_EFFECT_NONE;
      
    else switch( options.effect) {
      // see if valid effect passed
      case jQuery.SELECTBOX_EFFECT_NONE:
      case jQuery.SELECTBOX_EFFECT_FADE:
      case jQuery.SELECTBOX_EFFECT_SLIDE_OUT:
      case jQuery.SELECTBOX_EFFECT_SLIDE_DOWN:
      break;
      // invalid effect
      default:
        throw 'Invalid effect type "' +options.effect +'"';
      break;
    }

    if( options.presentation ===undefined || typeof options.presentation !='object')
      throw 'No presentation callbacks have been specified';
    if( options.presentation.open ===undefined)
      throw 'No presentation.open() callback was specified';
    if( options.presentation.close ===undefined)
      throw 'No presentation.close() callback was specified';
      
    // callback to call when custom select box is initialized
    if( options.presentation.init ===undefined)
      options.presentation.init =function(){};
      
    // callback to call when custom select box is about to be unloaded to
    //  gracefully shutdown pending UI effects.
    if( options.presentation.cleanup ===undefined)
      options.presentation.cleanup =function(){};
    
    if( options.makeValue ===undefined) {
      // internal value builder
      options.makeValue =function() {

        if( this.multiple) {
          // multiple option selection allowed
          var values =new Array();
          var opt;
        
          for( var i =0; i < this.options.length; ++i) {
            opt =this.options[ i];
            if( opt.selected)
              // store label or text
              values.push( opt.label ? opt.label : opt.text);
          }
          
          // return comma-joined list of selected values
          return values.join( ', ');
          
        } else {
          var opt =this.options[ this.selectedIndex];

          // return label or text
          return opt.label ? opt.label : opt.text;
        }

      };
    }
      
    // iterate each select box
    this
      .filter( function(){
        // keep only select boxes
        return this.nodeName =='SELECT';
      })
      .each( function(){
        
        var sbox =this;
        var jSbox =jQuery(this);
        
        // get select box input name
        var customSboxId =jQuery.uniqueId();
        var sboxClass =sbox.className;
        var sboxStyle =sbox.getAttribute( 'style');

        jSbox
          // hide select box
          .hide()
          // insert table right after select box object
          .after(
            '<table id="' +customSboxId +'" class="' +sboxClass +'" style="' +(sboxStyle ===null ? '' : sboxStyle) +'">' +
            '<tr class="top">' +
              '<td class="left"></td>' +
              '<td class="mid"></td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '<tr class="mid">' +
              '<td class="left"></td>' +
              '<td class="canvas">' +
                '<div class="value"></div>' +
                '<div class="menu"></div>' +
              '</td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '<tr class="bot">' +
              '<td class="left"></td>' +
              '<td class="mid"></td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '</table>'
          );
          

        var customSbox =document.getElementById( customSboxId);
        var jCustomSbox =jQuery( customSbox);
        
        // store custom select box object reference on an original select object.
        //  this reference can be used by custom views to reference custom sbox object.
        jSbox.data( '__customSbox', customSbox);

        jCustomSbox
          // reference select box
          .data( '__sbox', sbox)
          // initially hide menu object
          ._getSelectboxMenuObject()
          .hide();
        
        // bind click
        jCustomSbox.click(function(e){
          
          var wasOpened =jCustomSbox.isSelectboxOpened();
          
          // trigger on select box
          jSbox.trigger( jQuery.Event( 'click'));
          
          // toggle select box
          if( !wasOpened)
            jCustomSbox.openSelectbox();
          
          // stop event propagation
          e.stopPropagation();
        });

        // pass these event handling to the original SELECT element.
        // Google Chrome has a bug with handling this. Chrome does
        // not register (at least i tested mouseover and mouseout)
        // events and does not pass them to sbox object. This is
        // not Webkit-specific bug, Safari handles this well.
        jQuery.transferEvents(
          [
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', 'blur',
            'focus'
          ],
          jCustomSbox._getSelectboxValueObject().get(0),
          sbox);
        
        jCustomSbox
          // store config
          .data( '__options', options)
          // show initial value of select box
          ._updateSelectboxValue();
          
        // document click handler
        var clickFn =function(e){
          if( jCustomSbox.isSelectboxOpened())
            jCustomSbox.closeSelectbox();
        };
          
        // close select box when user clicks document
        jQuery(document).click( clickFn);
        
        // cleanup after custom select box is removed
        jCustomSbox
          .bind( 'remove', function( e){
            // unbind click handler from document
            jQuery(document).unbind( 'click', clickFn);
            // deinitialize presentation layer
            options.presentation.cleanup.call( customSbox);
          });
          
        // cleanup after select box object is removed
        jSbox
          .bind( 'remove', function( e){
            // remove custom select box
            jCustomSbox.remove();
          });
          
        // initialize presentation layer
        options.presentation.init.call( customSbox);
      });
      
    return this;
  },
  
  // toggle select box
  toggleSelectbox: function() {
    this.assertSingle();
    
    var jSbox =this;
    
    if( !jSbox.isSelectboxOpened())
      jSbox.openSelectbox();
    else
      jSbox.closeSelectbox();
  },
  
  // open select box
  openSelectbox: function() {
    this.assertSingle();
 
    var jSbox =this;
    var options =jSbox.data( '__options');
    
    // open overlay for selection of options
    options.presentation.open.call( this);
    
    // mark select box as opened
    jSbox.data( '__opened', true);
    
    // add opened class
    jSbox.find( '> tbody').addClass( 'opened');
  },
  
  // see if select box is opened
  isSelectboxOpened: function() {
    this.assertSingle();
    
    return this.data( '__opened') !==undefined;
  },
  
  // close select box
  closeSelectbox: function() {
    this.assertSingle();
    
    var jSbox =this;
    var options =jSbox.data( '__options');
    
    // open overlay for selection of options
    options.presentation.close.call( this);
    
    // remove opened flag
    jSbox.removeData( '__opened');
    
    // remove opened class
    jSbox.find( '> tbody').removeClass( 'opened');
  },
  
  // check select box value
  toggleSelectboxOption: function( option) {
    this.assertSingle();

    var jSbox =this;
    var elem =jSbox.data( '__sbox');
    var multi =elem.multiple;
      
    if( !multi) {
      // search for an option and save it's index
      for( var i =0; i < elem.options.length; ++i) {
        if( elem.options[ i] ==option) {
          elem.selectedIndex =i;
          break;
        }
      }

    } else
      // mark option as one of selected options
      option.selected =!option.selected;
      
    this._updateSelectboxValue( true);
  },
  
  // get select box menu object
  _getSelectboxMenuObject: function() {
    this.assertSingle();
    
    return this.find( '> tbody > tr.mid > td.canvas > div.menu');
  },
  
  // get select box canvas object
  _getSelectboxValueObject: function() {
    this.assertSingle();
    
    return this.find( '> tbody > tr.mid > td.canvas > div.value');
  },
  
  // update select box value
  _updateSelectboxValue: function( triggerChange) {
    this.assertSingle();
    
    if( triggerChange ===undefined)
      triggerChange =false;
    
    var jSbox =this;
    var elem =jSbox.data( '__sbox');
    var multi =elem.multiple;
    var options =jSbox.data( '__options');
    
    // collect selected options
    jSbox
      ._getSelectboxValueObject()
      .html( options.makeValue.call( elem));
      
    // trigger change event only if requested
    if( triggerChange)
      jQuery(elem).trigger( 'change');
  }
  
});