//>>built
define("dojo/_base/array",["./kernel","../has","./lang"],function(q,t,r){function l(a){return k[a]=new Function("item","index","array",a)}function n(a){var e=!a;return function(f,b,c){var g=0,d=f&&f.length||0,h;d&&"string"==typeof f&&(f=f.split(""));"string"==typeof b&&(b=k[b]||l(b));if(c)for(;g<d;++g){if(h=!b.call(c,f[g],g,f),a^h)return!h}else for(;g<d;++g)if(h=!b(f[g],g,f),a^h)return!h;return e}}function p(a){var e=1,f=0,b=0;a||(e=f=b=-1);return function(c,g,d,h){if(h&&0<e)return m.lastIndexOf(c,
g,d);h=c&&c.length||0;var k=a?h+b:f;d===s?d=a?f:h+b:0>d?(d=h+d,0>d&&(d=f)):d=d>=h?h+b:d;for(h&&"string"==typeof c&&(c=c.split(""));d!=k;d+=e)if(c[d]==g)return d;return-1}}var k={},s,m={every:n(!1),some:n(!0),indexOf:p(!0),lastIndexOf:p(!1),forEach:function(a,e,f){var b=0,c=a&&a.length||0;c&&"string"==typeof a&&(a=a.split(""));"string"==typeof e&&(e=k[e]||l(e));if(f)for(;b<c;++b)e.call(f,a[b],b,a);else for(;b<c;++b)e(a[b],b,a)},map:function(a,e,f,b){var c=0,g=a&&a.length||0;b=new (b||Array)(g);g&&
"string"==typeof a&&(a=a.split(""));"string"==typeof e&&(e=k[e]||l(e));if(f)for(;c<g;++c)b[c]=e.call(f,a[c],c,a);else for(;c<g;++c)b[c]=e(a[c],c,a);return b},filter:function(a,e,f){var b=0,c=a&&a.length||0,g=[],d;c&&"string"==typeof a&&(a=a.split(""));"string"==typeof e&&(e=k[e]||l(e));if(f)for(;b<c;++b)d=a[b],e.call(f,d,b,a)&&g.push(d);else for(;b<c;++b)d=a[b],e(d,b,a)&&g.push(d);return g},clearCache:function(){k={}}};r.mixin(q,m);return m});