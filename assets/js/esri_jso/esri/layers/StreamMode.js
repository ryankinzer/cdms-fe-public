//>>built
define("esri/layers/StreamMode","dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/has ../kernel ../SpatialReference ../tasks/query ./RenderMode".split(" "),function(g,h,k,l,m,p,q,n){g=g([n],{declaredClass:"esri.layers._StreamMode",constructor:function(a){this.featureLayer=a;this._featureMap={};this._drawFeatures=h.hitch(this,this._drawFeatures);this._queryErrorHandler=h.hitch(this,this._queryErrorHandler)},startup:function(){this.featureLayer._collection||this._fetchArchive()},propertyChangeHandler:function(a){this._init&&
!a&&this._applyTimeFilter()},drawFeature:function(a){a.visible=this._checkFeatureTimeIntersects(a);this._addTrackedFeature(a)},resume:function(){this.propertyChangeHandler(0)},refresh:function(){var a=this.featureLayer;a._collection?(a._fireUpdateStart(),a._refresh(!0),a._fireUpdateEnd()):this._fetchArchive()},_drawFeatures:function(a){this._purgeRequests();a=a.features||[];var b=this.featureLayer.objectIdField,c,d=a.length,e,f;for(c=0;c<d;c++)e=a[c],f=e.attributes[b],this._addFeatureIIf(f,e),this._incRefCount(f);
this._applyTimeFilter(!0)},_applyTimeFilter:function(a){var b=this.featureLayer._trackManager,c;this.inherited(arguments);if(b&&(c=b.trimTracks())&&0<c.length)this._removeFeatures(c),b.refreshTracks()},_addTrackedFeature:function(a){var b=this.featureLayer,c=b._trackManager,d,e=a.attributes[b.objectIdField],f;c&&a.visible&&(c.addFeatures([a]),d=a.attributes[b._trackIdField],f=c.trimTracks([d]));this._addFeatureIIf(e,a);this._incRefCount(e);d&&(this._removeFeatures(f),c.refreshTracks([d]))},_removeFeatures:function(a){var b=
this.featureLayer,c=b.objectIdField;a&&k.forEach(a,function(a){a=a.attributes[c];b._unSelectFeatureIIf(a,this);this._decRefCount(a);this._removeFeatureIIf(a)},this)},_checkFeatureTimeIntersects:function(a){var b=this.featureLayer,c=b.getMap().timeExtent;return!c||!b.timeInfo||!b.timeInfo.startTimeField&&!b.timeInfo.endTimeField?!0:0<b._filterByTime([a],c.startTime,c.endTime).match.length},_fetchArchive:function(){},_queryErrorHandler:function(a){this._purgeRequests();var b=this.featureLayer;b._errorHandler(a);
b._fireUpdateEnd(a)}});l("extend-esri")&&h.setObject("layers._StreamMode",g,m);return g});