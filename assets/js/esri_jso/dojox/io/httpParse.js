//>>built
define("dojox/io/httpParse",["dojo/_base/kernel"],function(e){e.getObject("io.httpParse",!0,dojox);dojox.io.httpParse=function(b,e,k){var g=[],l=b.length;do{var f={},c=b.match(/(\n*[^\n]+)/);if(!c)return null;b=b.substring(c[0].length+1);var c=c[1],a=b.match(/([^\n]+\n)*/)[0];b=b.substring(a.length);var m=b.substring(0,1);b=b.substring(1);for(var n=a=(e||"")+a,a=a.match(/[^:\n]+:[^\n]+\n/g),d=0;d<a.length;d++){var h=a[d].indexOf(":");f[a[d].substring(0,h)]=a[d].substring(h+1).replace(/(^[ \r\n]*)|([ \r\n]*)$/g,
"")}c=c.split(" ");c={status:parseInt(c[1],10),statusText:c[2],readyState:3,getAllResponseHeaders:function(){return n},getResponseHeader:function(a){return f[a]}};if(a=f["Content-Length"])if(a<=b.length)a=b.substring(0,a);else break;else if(a=b.match(/(.*)HTTP\/\d\.\d \d\d\d[\w\s]*\n/))a=a[0];else if(!k||"\n"==m)a=b;else break;g.push(c);b=b.substring(a.length);c.responseText=a;c.readyState=4;c._lastIndex=l-b.length}while(b);return g};return dojox.io.httpParse});