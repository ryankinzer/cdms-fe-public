//>>built
define("esri/layers/CodedValueDomain","dojo/_base/declare dojo/_base/lang dojo/has ../kernel ../lang ./Domain".split(" "),function(b,c,d,e,f,g){b=b([g],{declaredClass:"esri.layers.CodedValueDomain",constructor:function(a){a&&c.isObject(a)&&(this.codedValues=a.codedValues)},toJson:function(){var a=this.inherited(arguments);a.codedValues=c.clone(this.codedValues);return f.fixJson(a)}});d("extend-esri")&&c.setObject("layers.CodedValueDomain",b,e);return b});