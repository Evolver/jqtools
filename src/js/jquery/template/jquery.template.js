/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  */

if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';

jQuery.extend({
  
  // library version
  templateVersion: 1.0,
  
  // parse template
  parse: function( tpl, options) {
    
    // replace params
    for( k in options) {
      // replace all occurences
      tpl =tpl.split( '{' +k +'}').join( options[k]);
    }
  
    // return output
    return tpl;
  };

});

jQuery.fn.extend({
  
  // parse template and return output
  template: function( options) {
    this.assertSingle();
      
    return jQuery.parse( this.html(), options);
  };
  
});