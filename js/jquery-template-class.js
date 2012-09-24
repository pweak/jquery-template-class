/*  HTML EASY TEMPLATE 
    Copyright (C) <2012>  <OpenSistemas - Iván Garrido>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. */


/* TEMPLATE CLASS BEGIN */
function TemplateClass( template ) { if( 'undefined' == typeof template || null != template ) { this.base = template; } else { this.base = ''; } }
TemplateClass.prototype.render = function() {
    if( 'undefined' == this.base || null == this.base || 'string' != typeof this.base ) { return ''; }

    this.nestedIterations = 0;
    this.templateIterations = 0;

    return this.translate( this.base, this );
    };
TemplateClass.prototype.translate = function( templateText, objectValues ) {
        if( 'undefined' == templateText || null == templateText || 'string' != typeof templateText ) { return ''; }
        templateText = $.trim( templateText );
        if( '' == templateText || 0 > templateText.indexOf( '##' ) ) { return templateText; }

if( this.nestedIterations > 100 ) { console.log('TemplateClass: Too deep nested calls.'); return ''; }

        var finnished=false;
        var idx = 0;
        var str='';
        while( !finnished ) {
if( this.templateIterations > 10000 ) { console.log('TemplateClass: Too much iterative calls.'); return str; }

            ++this.templateIterations;

            var lastIdx = idx;
            idx = templateText.indexOf( '##', lastIdx );
            if( idx < 0 ) {
                finnished = true;
                str += templateText.substring( lastIdx );
                }
            else {
                str += templateText.substring( lastIdx, idx );
                lastIdx = idx+2;
                idx = templateText.indexOf( '##', lastIdx );
                if( 0 > idx ) { console.log( 'Template error' ); return 'Error'; }
                var key = templateText.substring( lastIdx, idx );
                if( key.length == 0 ) { console.log( 'Template error (empty key)' ); return 'Error'; }
                if( key.length > 32 ) { console.log( 'Template error (key too long "'+key+'")' ); return 'Error'; }
                if( key.indexOf(' ') >= 0 ) { console.log( 'Template error (key malformed "'+key+'")' ); return 'Error'; }
                // CHECK if part
                var idxFirstPart = templateText.lastIndexOf( '<!--', lastIdx );
                if( idxFirstPart < 0 ||idxFirstPart>lastIdx || $.trim( templateText.substring(idxFirstPart+4,lastIdx-2) ) != '' ) {
                    // No part
                    // INSERT key
                    var replacementValue = this.getValue( key, objectValues );
                    replacementValue = this.translate( replacementValue, objectValues );
                    str += replacementValue;
                    // Add
                    idx = idx+2;
                    finnished = (templateText.length <= idx);
                    }
                else {
                    // PART
                    idxFirstPart = 3+templateText.indexOf( '-->', idxFirstPart );
                    var idxLastPart = templateText.indexOf( '##'+key+'##', idxFirstPart );
                    idxLastPart = templateText.lastIndexOf( '<!--', idxLastPart );
                    var repeatedText = templateText.substring(idxFirstPart,idxLastPart);
                    replacementValue = this.translateArray( repeatedText, this.getValue( key, objectValues ) );
                    str = str.substring(0,str.length-5)+replacementValue;
                    idx = 3+templateText.indexOf( '-->', idxLastPart );
                    finnished = (templateText.length <= idx);
                    }
                }
            }  // while
        return str;
        };
TemplateClass.prototype.translateArray = function(templateText, arrayObjectValues) {
    if( !$.isArray( arrayObjectValues ) || arrayObjectValues.length == 0 ) { return ''; }
    var str = '';
    var numValues = arrayObjectValues.length;
    for( var idxValue = 0; idxValue < numValues; ++idxValue ) {
        var objectValues = arrayObjectValues[ idxValue ];
        var replacementValue = templateText;
        ++this.nestedIterations;
        replacementValue = this.translate( replacementValue, objectValues );
        --this.nestedIterations;
        str += replacementValue;
        }
    return str;
    };
TemplateClass.prototype.getValue = function( originalKey, objectValues ) {
    if( 'string' == typeof objectValues[ originalKey ] || $.isArray(objectValues[ originalKey ]) ) { return this[ originalKey ]; }
    var key = originalKey.toLowerCase();
    if( 'string' == typeof objectValues[ key ] || $.isArray(objectValues[ key ]) ) { return objectValues[ key ]; }
    key = originalKey.toLowerCase();
    var parts = key.split('_');
    for( var idx=0; idx < parts.length; ++idx ) { if( 0!=idx ) { parts[idx] = parts[idx].substring(0,1).toUpperCase()+parts[idx].substring(1); } }
    var key = parts.join('');
    if( 'string' == typeof objectValues[ key ] || $.isArray(objectValues[ key ]) ) { return objectValues[ key ]; }

    key = originalKey.toLowerCase();
    var parts = key.split('-');
    for( var idx=0; idx < parts.length; ++idx ) { if( 0!=idx ) { parts[idx] = parts[idx].substring(0,1).toUpperCase()+parts[idx].substring(1); } }
    var key = parts.join('');
    if( 'string' == typeof objectValues[ key ] || $.isArray(objectValues[ key ]) ) { return objectValues[ key ]; }

    return '@@'+originalKey+'@@';
    }
TemplateClass.prototype.toString = new Function("return this.render();");
TemplateClass.prototype.valueOf = new Function("return this.render();");
// jQuery plugin
(
    function( $ ) {
        $.fn.appendTemplate = function( templateObj ) {
            if( 'object' == typeof templateObj && 'function' == typeof templateObj.render ) { return this.append( ''+templateObj.render() ); }
            else { return this.append( templateObj ); }
            }
        $.fn.appendTemplateAfter = function( templateObj ) {
            if( 'object' == typeof templateObj && 'function' == typeof templateObj.render ) {
                return this.after( ''+templateObj.render() );
                }
            else {
                return this.after( templateObj );
                }
            }
        $.fn.appendTemplateBefore = function( templateObj ) {
            if( 'object' == typeof templateObj && 'function' == typeof templateObj.render ) {
                return this.before( ''+templateObj.render() );
                }
            else {
                return this.before( templateObj );
                }
            }
        }
    )( $ );
/* TEMPLATE CLASS END */