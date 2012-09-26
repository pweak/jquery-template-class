/*
JQUERY TEMPLATE CLASS

Copyright (c) 2012   Ivan Garrido
https://github.com/pweak/jquery-template-class

This software is under MIT license:

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/* Template class begin */
function TemplateClass( template ) {
    this.templateClass = this;
    this.defaultLang = 'en';
    this.lang = this.defaultLang;
    this.__sequenceReplacementCounter = [];

    if( 'undefined' == typeof template || null == template ) {
        this.base = '';
        }
    else if( 'string' == typeof template ) {
        this.base = template;
        }
    else if( 'object' == typeof template ) {
        for( key in template ) {
            this[ key ] = template[ key ];
            }
        }
    else {
        this.base = '';
        }
    }

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

if( this.nestedIterations > 100 ) { console.log('jquery-template-class: Too deep nested calls.'); return ''; }

        var finnished=false;
        var idx = 0;
        var str='';
        while( !finnished ) {
if( this.templateIterations > 10000 ) { console.log('jquery-template-class: Too much iterative calls.'); return str; }

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
                if( 0 > idx ) { console.log( 'jquery-template-class: Template error, tag isn\'t closed.' ); return 'Error'; }
                var key = templateText.substring( lastIdx, idx );
                if( key.length == 0 ) { console.log( 'jquery-template-class: Template error (empty key)' ); return 'Error'; }
                if( key.length > 32 ) { console.log( 'jquery-template-class: Template error (key too long "'+key+'")' ); return 'Error'; }
                if( key.indexOf(' ') >= 0 ) { console.log( 'jquery-template-class: Template error (key malformed "'+key+'")' ); return 'Error'; }
                // CHECK if part
                var idxFirstPart = templateText.lastIndexOf( '<!--', lastIdx );
                if( idxFirstPart < 0 ||idxFirstPart>lastIdx || $.trim( templateText.substring(idxFirstPart+4,lastIdx-2) ) != '' ) {
                    // No part
                    // INSERT key
                    var replacementValue = this.getValue( key, objectValues );
                    if( replacementValue.indexOf( '||' ) > 0 ) {
                        if( 'undefined' == typeof this.__sequenceReplacementCounter[ key ] ) { this.__sequenceReplacementCounter[ key ] = 0; }
                        replacementValueList = replacementValue.split( '||' );
                        replacementValue = $.trim( replacementValueList[ this.__sequenceReplacementCounter[ key ] ] );
                        this.__sequenceReplacementCounter[ key ] = (1+this.__sequenceReplacementCounter[ key ]) % replacementValueList.length;
                        }
                    else {
                        replacementValue.replace( '\|\|', '||' );
                        }
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
                    var partObjectValues = [];
                    for( objectKey in objectValues ) {
                        if( 'function' != typeof objectValues[ objectKey ] ) {
                            partObjectValues[ objectKey ] = objectValues[ objectKey ];
                            }
                        }
                    replacementValue = this.translateArray( repeatedText, this.getValue( key, objectValues ), partObjectValues );//this.getValue( key, objectValues ) );
                    str = str.substring(0,str.length-5)+replacementValue;
                    idx = 3+templateText.indexOf( '-->', idxLastPart );
                    finnished = (templateText.length <= idx);
                    }
                }
            }  // while
        return str;
        };

TemplateClass.prototype.translateArray = function(templateText, arrayObjectValues, parentObjectValues) {
    if( !$.isArray( arrayObjectValues ) || arrayObjectValues.length == 0 ) { return ''; }
    var str = '';
    var numValues = arrayObjectValues.length;
    for( var idxValue = 0; idxValue < numValues; ++idxValue ) {
        var partObjectValues = arrayObjectValues[ idxValue ];
        for( objectKey in parentObjectValues ) {
            partObjectValues[ objectKey ] = parentObjectValues[ objectKey ];
            }
        var replacementValue = templateText;
        ++this.nestedIterations;
        replacementValue = this.translate( replacementValue, partObjectValues );
        --this.nestedIterations;
        str += replacementValue;
        }
    return str;
    };

TemplateClass.prototype.getValue = function( originalKey, objectValues ) {
    if( 'string' == typeof objectValues[ originalKey ] || $.isArray(objectValues[ originalKey ]) ) { return this[ originalKey ]; }
    if( 'object' == typeof objectValues[ originalKey ] ) {
        var langKey = 'lang.'+this.lang;
        if( 'string' == typeof objectValues[ originalKey ][ langKey ] ) { return objectValues[ originalKey ][ langKey ]; }
        for( firstKey in objectValues[ originalKey ] ) { langKey = firstKey; break; }
        if( 'string' == typeof objectValues[ originalKey ][ langKey ] ) { console.log( 'jquery-template-class: ##'+originalKey+'##.lang.'+this.lang+' NOT DEFINED!!' ); return objectValues[ originalKey ][ langKey ]; }
        return '@@'+originalKey+'.'+this.lang+'@@';
        }

    var key = originalKey.toLowerCase();
    if( 'string' == typeof objectValues[ key ] || $.isArray(objectValues[ key ]) ) { return objectValues[ key ]; }
    if( 'object' == typeof objectValues[ key ] ) {
        var langKey = 'lang.'+this.lang;
        if( 'string' == typeof objectValues[ key ][ langKey ] ) { return objectValues[ key ][ langKey ]; }
        for( firstKey in objectValues[ key ] ) { langKey = firstKey; break; }
        if( 'string' == typeof objectValues[ key ][ langKey ] ) { console.log( 'jquery-template-class: ##'+originalKey+'##.lang.'+this.lang+' NOT DEFINED!!' ); return objectValues[ key ][ langKey ]; }
        return '@@'+originalKey+'.'+this.lang+'@@';
        }

    key = originalKey.toLowerCase();
    var parts = key.split('_');
    for( var idx=0; idx < parts.length; ++idx ) { if( 0!=idx ) { parts[idx] = parts[idx].substring(0,1).toUpperCase()+parts[idx].substring(1); } }
    var key = parts.join('');
    if( 'string' == typeof objectValues[ key ] || $.isArray(objectValues[ key ]) ) { return objectValues[ key ]; }
    if( 'object' == typeof objectValues[ key ] ) {
        var langKey = 'lang.'+this.lang;
        if( 'string' == typeof objectValues[ key ][ langKey ] ) { return objectValues[ key ][ langKey ]; }
        for( firstKey in objectValues[ key ] ) { langKey = firstKey; break; }
        if( 'string' == typeof objectValues[ key ][ langKey ] ) { console.log( 'jquery-template-class: ##'+originalKey+'##.lang.'+this.lang+' NOT DEFINED!!' ); return objectValues[ key ][ langKey ]; }
        return '@@'+originalKey+'.'+this.lang+'@@';
        }

    key = originalKey.toLowerCase();
    var parts = key.split('-');
    for( var idx=0; idx < parts.length; ++idx ) { if( 0!=idx ) { parts[idx] = parts[idx].substring(0,1).toUpperCase()+parts[idx].substring(1); } }
    var key = parts.join('');
    if( 'string' == typeof objectValues[ key ] || $.isArray(objectValues[ key ]) ) { return objectValues[ key ]; }
    if( 'object' == typeof objectValues[ key ] ) {
        var langKey = 'lang.'+this.lang;
        if( 'string' == typeof objectValues[ key ][ langKey ] ) { return objectValues[ key ][ langKey ]; }
        for( firstKey in objectValues[ key ] ) { langKey = firstKey; break; }
        if( 'string' == typeof objectValues[ key ][ langKey ] ) { console.log( 'jquery-template-class: ##'+originalKey+'##.lang.'+this.lang+' NOT DEFINED!!' ); return objectValues[ key ][ langKey ]; }
        return '@@'+originalKey+'.'+this.lang+'@@';
        }

    return '@@'+originalKey+'@@';
    };

TemplateClass.prototype.toString = new Function("return this.render();");
TemplateClass.prototype.valueOf  = new Function("return this.render();");
/* Template class end */

/* jQuery plugin begin */
if( typeof $ != 'undefined' && $ != null ) {
    (
    function( $ ) {
        $.createTemplate = function( tmpl ) {
            return new TemplateClass( tmpl );
            }

        $.fn.__append = $.fn.append;
        $.fn.append = function( elem ) {
            if( 'undefined' != typeof elem && null != elem && 'object' == typeof elem.templateClass && 'function' == typeof elem.render ) {
                return this.__append( elem.render() );
                }
            else {
                return this.__append( elem );
                }
            }

        $.fn.__prepend = $.fn.prepend;
        $.fn.prepend = function( elem ) {
            if( 'undefined' != typeof elem && null != elem && 'object' == typeof elem.templateClass && 'function' == typeof elem.render ) {
                return this.__prepend( elem.render() );
                }
            else {
                return this.__prepend( elem );
                }
            }

        $.fn.__after = $.fn.after;
        $.fn.after = function( elem ) {
            if( 'undefined' != typeof elem && null != elem && 'object' == typeof elem.templateClass && 'function' == typeof elem.render ) {
                return this.__after( elem.render() );
                }
            else {
                return this.__after( elem );
                }
            }

        $.fn.__before = $.fn.before;
        $.fn.before = function( elem ) {
            if( 'undefined' != typeof elem && null != elem && 'object' == typeof elem.templateClass && 'function' == typeof elem.render ) {
                return this.__before( elem.render() );
                }
            else {
                return this.__before( elem );
                }
            }

        }
    )( $ );
    }
else { if( console && console.log ) { console.log( 'jquery-template-class: jQuery is not loaded' ); } }
/* jQuery plugin end */
