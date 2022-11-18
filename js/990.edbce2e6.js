"use strict";(self["webpackChunkauscultatio"]=self["webpackChunkauscultatio"]||[]).push([[990],{8990:function(t,e,n){n.r(e),n.d(e,{createSwipeBackGesture:function(){return i}});var r=n(6587),a=n(545),c=n(6515);
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const i=(t,e,n,i,o)=>{const s=t.ownerDocument.defaultView,u=(0,a.i)(t),l=t=>{const e=50,{startX:n}=t;return u?n>=s.innerWidth-e:n<=e},h=t=>u?-t.deltaX:t.deltaX,d=t=>u?-t.velocityX:t.velocityX,f=t=>l(t)&&e(),k=t=>{const e=h(t),n=e/s.innerWidth;i(n)},w=t=>{const e=h(t),n=s.innerWidth,a=e/n,c=d(t),i=n/2,u=c>=0&&(c>.2||e>i),l=u?1-a:a,f=l*n;let k=0;if(f>5){const t=f/Math.abs(c);k=Math.min(t,540)}o(u,a<=0?.01:(0,r.h)(0,a,.9999),k)};return(0,c.createGesture)({el:t,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:f,onStart:n,onMove:k,onEnd:w})}}}]);
//# sourceMappingURL=990.edbce2e6.js.map