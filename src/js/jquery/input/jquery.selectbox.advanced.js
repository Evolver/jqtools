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

(function($){
  
if( typeof $.selectboxVersion =='undefined')
  throw 'jQuery.selectbox library is required';
if( typeof $.viewportVersion =='undefined')
  throw 'jQuery.viewport library is required';

$.fn.extend({
  
  // create advanced select box
  advancedSelectbox: function( options) {
    if( options ===undefined || typeof options !='object')
      options ={};
      
    // see if heading is set
    if( options.heading ===undefined)
      options.heading ='Select option(s):';
      
    // see if menu init callback is set
    if( options.initMenuCallback ===undefined)
      options.initMenuCallback =function( sbox, menuObject){};
      
    // see if toolbar init callback is set
    if( options.initToolbarCallback ===undefined)
      options.initToolbarCallback =function( sbox, toolbarObject){};
      
    // see if alphabet init callback is set
    if( options.initAlphabetCallback ===undefined)
      options.initAlphabetCallback =function( sbox, alphabetObject){};
      
    // see if search init callback is set
    if( options.initSearchCallback ===undefined)
      options.initSearchCallback =function( sbox, searchObject){};
      
    // see if option init callback is set
    if( options.initOptionCallback ===undefined)
      options.initOptionCallback =function( sbox, optionObject){};
      
    // close button caption
    if( options.closeButtonCaption ===undefined)
      options.closeButtonCaption ='Close';
      
    // search button caption
    if( options.searchButtonCaption ===undefined)
      options.searchButtonCaption ='Filter';
      
    // search title
    if( options.searchTitle ===undefined)
      options.searchTitle ='Search:';
      
    // 'check all' button caption
    if( options.checkAllButtonCaption ===undefined)
      options.checkAllButtonCaption ='Check All';
      
    // 'uncheck all' button caption
    if( options.uncheckAllButtonCaption ===undefined)
      options.uncheckAllButtonCaption ='Uncheck All';
      
    // 'show all' button caption
    if( options.showAllButtonCaption ===undefined)
      options.showAllButtonCaption ='Show all';
      
    // background image to show
    if( options.backgroundImageUrl ===undefined)
      options.backgroundImageUrl =null;
      
    // add presentation callbacks
    options.presentation ={
      // open callback
      open: $.fn.openAdvancedSelectbox,
      // close callback
      close: $.fn.closeAdvancedSelectbox
    };
    
    this.selectbox( options);
  },
  
  // open select box
  openAdvancedSelectbox: function() {
    this.assertSingle();

    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    
    // get options
    var options =$sbox.data( '__options');
    
    // stop all animations if such existed
    $menu.stop( true, true);
    
    // assign background image if requested
    if( options.backgroundImageUrl !==null) {
      $menu.css({
        'backgroundImage': 'url(\'' +options.backgroundImageUrl +'\')',
        'backgroundRepeat': 'no-repeat',
        'backgroundPosition': 'right bottom'
      });
    }
    
    // generate contents
    $sbox._generateAdvancedSelectboxMenu();
    
    // align menu object
    $sbox._alignAdvancedSelectboxMenu();
    
    // store alignment callback
    $sbox.data( '__alignCallback', function(){
      $sbox._alignAdvancedSelectboxMenu();
    });
    
    // show menu object with specified effect
    switch( options.effect) {
      case $.SELECTBOX_EFFECT_SLIDE_OUT:
        $menu.show( 'fast');
      break;
      case $.SELECTBOX_EFFECT_SLIDE_DOWN:
        $menu.slideDown( 'fast');
      break;
      case $.SELECTBOX_EFFECT_FADE:
        $menu.fadeIn( 'fast');
      break;
      case $.SELECTBOX_EFFECT_NONE:
      default:
        $menu.show();
      break;
    }
    
    // realign menu on resize
    $(window).bind( 'resize', $sbox.data( '__alignCallback'));
  },
  
  // close select box
  closeAdvancedSelectbox: function() {
    this.assertSingle();
    
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    
    // get options
    var options =$sbox.data( '__options');
    
    // stop all animations if such existed
    $menu.stop( true, true);
    
    // hide menu according to specified effect
    switch( options.effect) {
      case $.SELECTBOX_EFFECT_SLIDE_OUT:
        $menu.hide( 'fast');
      break;
      case $.SELECTBOX_EFFECT_SLIDE_DOWN:
        $menu.slideUp( 'fast');
      break;
      case $.SELECTBOX_EFFECT_FADE:
        $menu.fadeOut( 'fast');
      break;
      case $.SELECTBOX_EFFECT_NONE:
      default:
        // hide instantly
        $menu.hide();
      break;
    }
    
    // remove alignment callback
    $(window).unbind( 'resize', $sbox.data( '__alignCallback'));
    
    // remove align callback reference
    $sbox.removeData( '__alignCallback');
  },
  
  // generate select box contents
  _generateAdvancedSelectboxMenu: function() {
    this.assertSingle();

    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    
    // get options
    var options =$sbox.data( '__options');
    
    // basic contents (layout)
    var html ='';
    
    if( options.heading !==null)
      html += '<div class="heading">' +$.escapeHTML( options.heading) +'</div>';
      
    // append the rest of elements
    html += '<div class="alphabet"></div>' +
            '<form class="search"></form>' +
            '<form class="options"></form>' +
            '<div class="toolbar"></div>';
            
    // assign contents
    $menu.html( html);
    
    // call menu init callback
    options.initMenuCallback( $sbox.get(0), $menu.get(0));
    
    // render inner contents
    $sbox._generateAdvancedSelectboxAlphabet();
    $sbox._generateAdvancedSelectboxSearch();
    $sbox._generateAdvancedSelectboxOptions();
    $sbox._generateAdvancedSelectboxToolbar();
  },
  
  // render alphabet
  _generateAdvancedSelectboxAlphabet: function() {
    this.assertSingle();

    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    var $alphabet =$menu.find( '> .alphabet');
    
    // get options
    var options =$sbox.data( '__options');
    
    var elem =$sbox.data( '__sbox');
    var multi =elem.multiple;
    
    // alphabet index
    var alphabet =new Array();
    
    // index all letters
    var i;
    var opt;
    var val;
    var chr;
    for( i =0; i < elem.options.length; ++i) {
      // reference option
  		opt =elem.options[i];
  		val =opt.text;
  		
  		// see if alphabet already has first letter
  		if( val =='')
  		  // skip empty options
  		  continue;
  		  
  		// character to index
  		chr =val.substr( 0, 1).toUpperCase();
  		  
  		if( util.indexOf( alphabet, chr) !=-1)
  		  // letter already indexed
  		  continue;
  		  
  		alphabet.push( chr);
    }
    
    // sort alphabet
    alphabet.sort();
    
    // render alphabet
    var html ='';
    
    for( i =0; i < alphabet.length; ++i) {
      chr =alphabet[i];
      html += '<a class="letter" href="javascript:;">' +chr +'</a> ';
    }
    
    // add last button, that will show all options
    html += '<a class="all" href="javascript:;">' +$.escapeHTML( options.showAllButtonCaption) +'</a>';
    
    // assign alphabet
    $alphabet.html( html);
    
    // find all letter links
    $alphabet.find( '> a.letter').bind( 'click', function( e){
      var letter =$(this).html();
      
      // assign a click handler
      $sbox.filterAdvancedSelectboxOptionsByLetter( letter);

      // do not propagate event
      e.stopPropagation();
    });
    
    // find 'show all' button
    $alphabet.find( '> a.all').bind( 'click', function( e){
      // assign a click handler
      $sbox.showAllAdvancedSelectboxOptions();
      
      // remove 'selected' class from all letters
      $alphabet.find( '> a.letter.selected').removeClass( 'selected');
      
      // do not propagate event
      e.stopPropagation();
    });
    
    // call alphabet init callback
    options.initAlphabetCallback( $sbox.get(0), $alphabet.get(0));
  },
  
  // show all advanced selectbox options
  showAllAdvancedSelectboxOptions: function() {
    this.assertSingle();
    
    var $sbox =this;
    var $options =$sbox.find( '> .options');
    
    // select no letter
    $sbox.selectAdvancedSelectboxLetter( null);
    
    // select box element
    var elem =$sbox.data( '__sbox');
    
    var options =new Array();
    var i;
    for( i =0; i < elem.options.length; ++i)
      options.push( elem.options[i]);
    
    // show all options initially
    $sbox.showAdvancedSelectboxOptions( options);
  },
  
  // render search box
  _generateAdvancedSelectboxSearch: function() {
    this.assertSingle();
    
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    var $search =$menu.find( '> .search');
    
    // get options
    var options =$sbox.data( '__options');
    
    // prepare html for the search object
    var html ='<div class="title">' +$.escapeHTML( options.searchTitle) +'</div>' +
              '<div class="button">' +
                '<input type="button" value="' +$.escapeHTML( options.searchButtonCaption) +'" onclick="$(\'#' +$sbox.uniqueId() +'\').filterAdvancedSelectboxOptionsBySearchString();" />' +
              '</div>' +
              '<div class="input">' +
                '<input type="text" />' +
              '</div>';
    
    // assign html
    $search.html( html);
    
    // call init callback
    options.initSearchCallback( $sbox.get(0), $search.get(0));
  },
  
  // render toolbar
  _generateAdvancedSelectboxToolbar: function() {
    this.assertSingle();
    
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    var $toolbar =$menu.find( '> .toolbar');
    
    // get options
    var elem =$sbox.data( '__sbox');
    var multi =elem.multiple;
    var options =$sbox.data( '__options');
    
    // prepare html for the toolbar
    var html ='';
    
    if( multi) {
      // add "check all" and "uncheck all" buttons
      html += '<div class="check-all">' +
                '<input type="button" value="' +$.escapeHTML( options.checkAllButtonCaption) +'" onclick="$(\'#' +$sbox.uniqueId() +'\').checkAllVisibleAdvancedSelectboxOptions( true);return false;" />' +
              '</div>' +
              '<div class="uncheck-all">' +
                '<input type="button" value="' +$.escapeHTML( options.uncheckAllButtonCaption) +'" onclick="$(\'#' +$sbox.uniqueId() +'\').checkAllVisibleAdvancedSelectboxOptions( false);return false;" />' +
              '</div>';
    }
    
    // add close button
    html += '<div class="close">' +
              '<input type="button" value="' +$.escapeHTML( options.closeButtonCaption) +'" onclick="$(\'#' +$sbox.uniqueId() +'\').closeSelectbox();return false;" />' +
            '</div>'
    
    // assign html
    $toolbar.html( html);
    
    // call init callback
    options.initToolbarCallback( $sbox.get(0), $toolbar.get(0));
  },
  
  // render options
  _generateAdvancedSelectboxOptions: function() {
    this.assertSingle();
    
    var $sbox =this;
    
    // show all options
    $sbox.showAllAdvancedSelectboxOptions();
  },
  
  // align menu
  _alignAdvancedSelectboxMenu: function() {
    this.assertSingle();

    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    
    // remember visibility state
    var isVisible =$menu.is( ':visible');
    
    // obtain metrics
    $menu
      // reset offsets
      .css({
        'top': '0px',
        'left': '0px'
      });
    
    if( !isVisible)
      // show menu if hidden to obtain correct metrics
      $menu.show();

    // align object
    var width =$menu.outerWidth(true);
    var height =$menu.outerHeight(true);
    
    // get viewport width and height
    var viewport =$(document).viewport();
    
    // calculate offsets
    var top =parseInt(( viewport.viewportHeight -height) /2);
    var left =parseInt(( viewport.viewportWidth -width) /2);
    
    // hide menu if was not visible
    if( !isVisible)
      $menu.hide();

    $menu
      // assign offsets
      .css({
        'left': left +'px',
        'top': top +'px'
      });
  },
  
  // filter options by letter
  filterAdvancedSelectboxOptionsByLetter: function( letter) {
    this.assertSingle();
    
    // get objects
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    
    // select letter
    $sbox.selectAdvancedSelectboxLetter( letter);
    
    var elem =$sbox.data( '__sbox');
    
    // gather all options that start with specified letter
    var options =new Array();
    var opt;
    var i;
    var val;
    for( i =0; i < elem.options.length; ++i) {
      opt =elem.options[i];
      val =opt.text;
      
      if( val.substr( 0, 1).toUpperCase() ==letter)
        // push option object
        options.push( opt);
    }
    
    // render options
    $sbox.showAdvancedSelectboxOptions( options);
  },
  
  // filter options by search string
  filterAdvancedSelectboxOptionsBySearchString: function() {
    this.assertSingle();
    
    // get objects
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    
    // select no letter
    $sbox.selectAdvancedSelectboxLetter( null);
    
    // get search string
    var $searchText =$menu.find( '> .search input[type="text"]');
    var searchText =$searchText.get(0);
    var elem =$sbox.data( '__sbox');
    
    // read value
    var string =searchText.value.toLowerCase();
    
    // gather matching option list
    var options =new Array();
    var opt;
    var i;
    var val;
    for( i =0; i < elem.options.length; ++i) {
      opt =elem.options[i];
      val =opt.text;
      
      if( val.toLowerCase().indexOf( string) !=-1)
        // push option object
        options.push( opt);
    }
    
    // show options
    $sbox.showAdvancedSelectboxOptions( options);
    
    // reset search text value
    searchText.value ='';
    
    // trigger change
    $searchText.trigger( 'change');
  },
  
  // show specified array of options
  showAdvancedSelectboxOptions: function( opts) {
    this.assertSingle();
    
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    var $options =$menu.find( '> .options');
    
    // get options
    var options =$sbox.data( '__options');
    
    // get information on select box
    var elem =$sbox.data( '__sbox');
    var multi =elem.multiple;
    
    var opt;
    var i;
    var html ='';
    var uid;
    var escapedText;
    var checked;
    for( i =0; i < opts.length; ++i) {
      opt =opts[i];
      uid =$.uniqueId();
      escapedText =opt.label =='' ? $.escapeHTML( opt.text) : opt.label;
      
      html += '<div class="option" data-value="' +$.escapeHTML( opt.value) +'">' +
                '<div class="input"><input name="option" id="' +uid +'" type="' +( multi ? 'checkbox' : 'radio') +'" ' +(opt.selected ? ' checked="checked"' :'') +'/></div>' +
                '<label class="text" for="' +uid +'" title="' +escapedText +'">' +escapedText +'</label>' +
              '</div>';
    }
    
    // set options
    $options.html( html);
    
    // find all checkboxes and bind change events on them
    $options.find( '> .option > .input > input').bind( 'change', function(e){
      // determine value of option
      var value =$(this.parentNode.parentNode).attr( 'data-value');
      
      // check box
      $sbox.toggleSelectboxOptionByValue( value);

      if( !multi)
        // close selectbox
        $sbox.closeSelectbox();
    });
    
    // init options
    options.initOptionCallback( $sbox.get(0), $options.get(0));
  },
  
  // check all visible options
  checkAllVisibleAdvancedSelectboxOptions: function( check) {
    this.assertSingle();
    
    if( check ===undefined)
      check =true;
    
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    var $options =$menu.find( '> .options');
    
    // get options
    var options =$sbox.data( '__options');
    
    // get information on select box
    var elem =$sbox.data( '__sbox');
    var multi =elem.multiple;
    
    if( !multi)
      throw 'Should not happen';
      
    // iterate all options
    $options.find( '> .option').each( function(){
      var $this =$(this);
      var $input =$this.find( '> .input > input');
      var isChecked =$input.is( ':checked');
      
      // see if option is checked
      if(( check && isChecked) || (!check && !isChecked))
        // skip already synchronized states
        return;
        
      // toggle checkbox
      $input.get(0).checked =check;
      $input.trigger( 'change');
      
    });
  },
  
  // select letter
  selectAdvancedSelectboxLetter: function( letter) {
    this.assertSingle();

    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    var $alphabet =$menu.find( '> .alphabet');
    
    // remove 'selected' class from all letters
    $alphabet.find( '> a.letter.selected').removeClass( 'selected');
    
    if( letter !==null) {
      // add 'selected' class
      $alphabet.find( '> a.letter').each(function(){
        var $this =$(this);
        
        if( $this.html() ==letter)
          $this.addClass( 'selected');
      });
    }
  }
  
});

})( jQuery);