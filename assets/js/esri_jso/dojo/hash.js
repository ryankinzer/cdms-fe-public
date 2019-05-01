//>>built
define("dojo/hash","./_base/kernel require ./_base/config ./aspect ./_base/lang ./topic ./domReady ./sniff".split(" "),function(d,x,h,y,k,z,A,l){function t(a,f){var b=a.indexOf(f);return 0<=b?a.substring(b+1):""}function c(){return t(location.href,"#")}function p(){z.publish("/dojo/hashchange",c())}function m(){c()!==b&&(b=c(),p())}function v(a){if(e)if(e.isTransitioning())setTimeout(k.hitch(null,v,a),q);else{var b=e.iframe.location.href,c=b.indexOf("?");e.iframe.location.replace(b.substring(0,c)+
"?"+a)}else location.replace("#"+a),!w&&m()}function B(){function a(){b=c();l=g?b:t(u.href,"?");r=!1;s=null}var f=document.createElement("iframe"),e=h.dojoBlankHtmlUrl||x.toUrl("./resources/blank.html");h.useXDomain&&!h.dojoBlankHtmlUrl&&console.warn("dojo.hash: When using cross-domain Dojo builds, please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl to the path on your domain to blank.html");f.id="dojo-hash-iframe";f.src=e+"?"+c();f.style.display="none";document.body.appendChild(f);
this.iframe=d.global["dojo-hash-iframe"];var l,r,s,m,g,u=this.iframe.location;this.isTransitioning=function(){return r};this.pollLocation=function(){if(!g)try{var d=t(u.href,"?");document.title!=m&&(m=this.iframe.document.title=document.title)}catch(h){g=!0,console.error("dojo.hash: Error adding history entry. Server unreachable.")}var n=c();if(r&&b===n)if(g||d===s)a(),p();else{setTimeout(k.hitch(this,this.pollLocation),0);return}else if(!(b===n&&(g||l===d))){if(b!==n){b=n;r=!0;s=n;f.src=e+"?"+s;
g=!1;setTimeout(k.hitch(this,this.pollLocation),0);return}g||(location.href="#"+u.search.substring(1),a(),p())}setTimeout(k.hitch(this,this.pollLocation),q)};a();setTimeout(k.hitch(this,this.pollLocation),q)}d.hash=function(a,b){if(!arguments.length)return c();"#"==a.charAt(0)&&(a=a.substring(1));b?v(a):location.href="#"+a;return a};var b,e,w,q=h.hashPollFrequency||100;A(function(){"onhashchange"in d.global&&(!l("ie")||8<=l("ie")&&"BackCompat"!=document.compatMode)?w=y.after(d.global,"onhashchange",
p,!0):document.addEventListener?(b=c(),setInterval(m,q)):document.attachEvent&&(e=new B)});return d.hash});