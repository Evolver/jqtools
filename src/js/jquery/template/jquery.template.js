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