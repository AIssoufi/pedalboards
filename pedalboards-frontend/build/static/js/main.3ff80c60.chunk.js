(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{25:function(e,t,n){e.exports=n(57)},30:function(e,t,n){},32:function(e,t,n){},34:function(e,t,n){},40:function(e,t,n){},44:function(e,t,n){},46:function(e,t,n){},49:function(e,t,n){},53:function(e,t,n){},55:function(e,t,n){},57:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),c=n(20),l=n.n(c),o=(n(30),n(5)),i=n(6),s=n(9),u=n(8),m=n(10),p=n(60),h=n(62),g=n(58),b=n(61),d=(n(32),n(34),n(7)),f=n.n(d),E=n(15),v=new(function(){function e(){Object(o.a)(this,e),this.url="http://localhost:8080",this.header={"Content-Type":"application/json; charset=utf-8"}}return Object(i.a)(e,[{key:"getPlugins",value:function(){var e=Object(E.a)(f.a.mark(function e(){var t,n,a,r=arguments;return f.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=r.length>0&&void 0!==r[0]?r[0]:1,n=r.length>1&&void 0!==r[1]?r[1]:10,(a=new URL("".concat(this.url,"/api/plugins"))).searchParams.append("page",t),a.searchParams.append("pagesize",n),e.abrupt("return",fetch(a).then(function(e){return e.json()}));case 6:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"findPlugins",value:function(){var e=Object(E.a)(f.a.mark(function e(t){var n,a,r,c,l,o,i,s,u,m=arguments;return f.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(n=m.length>1&&void 0!==m[1]?m[1]:1,a=m.length>2&&void 0!==m[2]?m[2]:10,(r=new URL("".concat(this.url,"/api/plugins"))).searchParams.append("page",n),r.searchParams.append("pagesize",a),!(t instanceof URLSearchParams)){e.next=25;break}for(c=!0,l=!1,o=void 0,e.prev=9,i=t.entries()[Symbol.iterator]();!(c=(s=i.next()).done);c=!0)u=s.value,console.log(u),r.searchParams.append("filterby[".concat(u[0],"]"),u[1]);e.next=17;break;case 13:e.prev=13,e.t0=e.catch(9),l=!0,o=e.t0;case 17:e.prev=17,e.prev=18,c||null==i.return||i.return();case 20:if(e.prev=20,!l){e.next=23;break}throw o;case 23:return e.finish(20);case 24:return e.finish(17);case 25:return e.abrupt("return",fetch(r).then(function(e){return e.json()}).then(function(e){return console.log(e),e}));case 26:case"end":return e.stop()}},e,this,[[9,13,17,25],[18,,20,24]])}));return function(t){return e.apply(this,arguments)}}()},{key:"getPlugin",value:function(){var e=Object(E.a)(f.a.mark(function e(t){return f.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch("".concat(this.url,"/api/plugin/").concat(t)).then(function(e){return e.json()}));case 1:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"updatePlugin",value:function(){var e=Object(E.a)(f.a.mark(function e(t,n){return f.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch("".concat(this.url,"/api/plugin/").concat(t),{method:"PUT",header:this.header,body:n}).then(function(e){return e.json()}));case 1:case"end":return e.stop()}},e,this)}));return function(t,n){return e.apply(this,arguments)}}()},{key:"createPlugin",value:function(){var e=Object(E.a)(f.a.mark(function e(t){return f.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch("".concat(this.url,"/api/plugin"),{method:"POST",header:this.header,body:t}).then(function(e){return e.json()}));case 1:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"deletePlugin",value:function(){var e=Object(E.a)(f.a.mark(function e(t){return f.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch("".concat(this.url,"/api/plugin/").concat(t),{method:"DELETE"}).then(function(e){return e.json()}));case 1:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()}]),e}()),P=n(42),y=n(59),N=n(11),C=n(12),j=(n(40),function(e){function t(){return Object(o.a)(this,t),Object(s.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(m.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){return r.a.createElement("nav",{className:"toolbar whiteframe"},r.a.createElement("div",{className:"toolbar-content"},r.a.createElement(P.a,{to:"/",className:"mobile-menu-button"},r.a.createElement("span",{className:"icon-bar"}),r.a.createElement("span",{className:"icon-bar"}),r.a.createElement("span",{className:"icon-bar"})),r.a.createElement("div",{className:"toolbar-brand-container"},r.a.createElement("div",{className:"toolbar-brand"},r.a.createElement(P.a,{className:"logo",to:"/"},"Projet MBDS"))),r.a.createElement("div",{className:"toolbar-option-container"},r.a.createElement(y.a,{className:"toolbar-option",activeClassName:"active",to:"/plugins"},r.a.createElement(N.a,{icon:C.d}),r.a.createElement("span",null,"Plugins")),r.a.createElement(y.a,{className:"toolbar-option",to:"http://localhost:3000/login",target:"_blank"},r.a.createElement(N.a,{icon:C.e}),r.a.createElement("span",null,"Log In")))))}}]),t}(a.Component)),k=(n(44),function(e){function t(){return Object(o.a)(this,t),Object(s.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(m.a)(t,e),Object(i.a)(t,[{key:"getLeftPageNumbers",value:function(e){var t=[];if(e<=4)for(var n=1;n<e;n++)t.push(n);else t.push(1),t.push("..."),t.push(e-1);return t}},{key:"getRightPageNumbers",value:function(e,t){var n=[];return e===t?n:(n.push(e+1),e+1===t?n:(e+1===2?(n.push(e+2),e+3!==t&&n.push("...")):e+1!==t&&e+2!==t&&n.push("..."),n.push(t),n))}},{key:"render",value:function(){var e=this;return!this.props.elementCount||this.props.elementCount<=0?null:r.a.createElement("div",{className:"navigation"},r.a.createElement("div",{className:"page-precedente",onClick:function(){return e.props.onCurrentPageChange(e.props.currentPage-1)}},r.a.createElement(N.a,{icon:C.a}),r.a.createElement("p",null,"Page p\xe9r\xe9cedente")),r.a.createElement("div",{className:"numero-de-page"},this.getLeftPageNumbers(this.props.currentPage).map(function(t){return r.a.createElement("button",{type:"button",key:t,onClick:function(){return e.props.onCurrentPageChange(t)}},t)}),r.a.createElement("button",{type:"button",className:"current-page"},this.props.currentPage),this.getRightPageNumbers(this.props.currentPage,this.props.elementCount).map(function(t){return r.a.createElement("button",{type:"button",key:t,onClick:function(){return e.props.onCurrentPageChange(t)}},t)})),r.a.createElement("div",{className:"page-suivante",onClick:function(){return e.props.onCurrentPageChange(e.props.currentPage+1)}},r.a.createElement("p",null,"Page suivante"),r.a.createElement(N.a,{icon:C.b})))}}]),t}(a.Component)),O=(n(46),function(e){return r.a.createElement("div",{className:"pedalboard"},r.a.createElement("header",null,r.a.createElement("div",{className:"author"},r.a.createElement("span",{className:"author-name"}," ",e.author.name),r.a.createElement("a",{href:e.uri,target:"_blank",rel:"noopener noreferrer"},e.uri)),e.pedalboardCount?r.a.createElement("div",{className:"count-container"},r.a.createElement("a",{className:"count",href:"#null"},r.a.createElement("span",null,e.pedalboardCount)),r.a.createElement("span",{className:"pedalboard-count-text"},"Pedalboards using it")):null),r.a.createElement("h2",null,e.label),r.a.createElement("div",{className:"plugin-media-container"},r.a.createElement("img",{className:"plugin-media",src:e.screenshotUrl,alt:"Plugin screenshot"})),r.a.createElement("div",{className:"category-container"},e.categories.map(function(e,t){return r.a.createElement(P.a,{to:{pathname:"/plugins",search:"?categories=".concat(e)},key:t,className:"plugin-category"},e)})),r.a.createElement("p",{className:"pedalboard-description",dangerouslySetInnerHTML:{__html:e.description}}),r.a.createElement("div",{className:"plugin-control-ports"},r.a.createElement("table",null,r.a.createElement("thead",null,r.a.createElement("tr",null,r.a.createElement("th",null,"Control"),r.a.createElement("th",null,"Default"),r.a.createElement("th",null,"Min"),r.a.createElement("th",null,"Max"))),r.a.createElement("tbody",null,e.controlPorts.map(function(e,t){return r.a.createElement("tr",{key:t},r.a.createElement("td",null,e.name),r.a.createElement("td",null,e.default),r.a.createElement("td",null,e.min),r.a.createElement("td",null,e.max))})))),r.a.createElement("div",{className:"plugin-misc-info-container"},r.a.createElement("span",{className:"plugin-uri"},e.uri),r.a.createElement("span",{className:"plugin-version"},"v",e.version)))}),w=n(14),S=(n(49),n(23),function(e){return r.a.createElement("div",{className:"plugin"},r.a.createElement(P.a,{to:"/plugin/".concat(e._id)},r.a.createElement(w.Tooltip,{title:"<i>Click to discover<br>more details about ".concat(e.name,".</i>"),position:"bottom"},r.a.createElement("img",{src:e.screenshotUrl,alt:"Plugin screenshot"}))),r.a.createElement("div",{className:"category-container"},e.categories.map(function(e){return r.a.createElement(w.Tooltip,{key:e,title:"<b>Categorie</b><br><i>Click to filter plugin<br>by <b>".concat(e,"</b> categories.</i>"),position:"top"},r.a.createElement(P.a,{to:{pathname:"/plugins",search:"?categories=".concat(e)},className:"category"},e))})),r.a.createElement("hr",null),r.a.createElement("div",{className:"info-container"},r.a.createElement(w.Tooltip,{title:"<b>Label</b><br><i>Click to filter plugin<br>by ".concat(e.label," labels.</i>"),position:"top"},r.a.createElement(P.a,{to:{pathname:"/plugins",search:"?label=".concat(e.label)},className:"info"},e.label)),r.a.createElement(w.Tooltip,{title:"<b>Brand</b><br><i>Click to filter plugin<br>by ".concat(e.brand," brands.</i>"),position:"bottom"},r.a.createElement(P.a,{to:{pathname:"/plugins",search:"?brand=".concat(e.brand)},className:"info brand"},e.brand))))}),x=n(24),L=n.n(x),R=(n(53),function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(s.a)(this,Object(u.a)(t).call(this,e))).handleFormSubmit=function(e){e.preventDefault();var t=n.fromRef.current,a=new FormData(t);n.props.onSubmit(a)},n.fromRef=Object(a.createRef)(),n}return Object(m.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){return r.a.createElement("form",{className:"search-container",onSubmit:this.handleFormSubmit,ref:this.fromRef},r.a.createElement("div",{className:"search"},r.a.createElement("input",{type:"text",name:"value",placeholder:"Search Plugins",onChange:L.a.debounce(this.handleFormSubmit,900)}),r.a.createElement(w.Tooltip,{title:"<i>Click to launch the search</i>",position:"top"},r.a.createElement("button",{type:"submit"},r.a.createElement(N.a,{icon:C.c})))),r.a.createElement("div",{className:"filter"},r.a.createElement("label",{htmlFor:"options"},"in"),r.a.createElement(w.Tooltip,{title:"<i>Choose a search filter</i>",position:"bottom"},r.a.createElement("select",{id:"options",name:"label",defaultValue:"brand",onChange:this.handleFormSubmit},r.a.createElement("option",{value:"brand"},"brand"),r.a.createElement("option",{value:"categories"},"categorie"),r.a.createElement("option",{value:"label"},"lebel")))))}}]),t}(a.Component)),T=function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(s.a)(this,Object(u.a)(t).call(this,e))).handleSearchSubmit=function(e){var t=e.get("label"),a=e.get("value"),r=new URLSearchParams;r.append(t,a),v.findPlugins(r,n.state.currentPage,n.state.displayNumber).then(function(e){n.setState({plugins:e.data,elementCount:e.count,countPlugins:e.numberPages})}).catch(function(e){return console.log(e)})},n.setCurrentPage=function(e){isNaN(e)||e>=n.state.elementCount||e<=0||v.getPlugins(e,n.state.displayNumber).then(function(e){n.setState({plugins:e.data,elementCount:e.count,currentPage:e.currentPage,countPlugins:e.numberPages})})},n.state={plugins:[],elementCount:0,displayNumber:10,currentPage:1,countPlugins:-1},n}return Object(m.a)(t,e),Object(i.a)(t,[{key:"componentDidMount",value:function(){var e=this;(this.props.location&&this.props.location.search?v.findPlugins(new URLSearchParams(this.props.location.search),this.state.currentPage,this.state.displayNumber):v.getPlugins(this.state.currentPage,this.state.displayNumber)).then(function(t){e.setState({plugins:t.data,elementCount:t.count,countPlugins:t.numberPages})})}},{key:"componentDidUpdate",value:function(e,t){var n=this;this.props.location&&e.location&&this.props.location.search!==e.location.search&&v.findPlugins(new URLSearchParams(this.props.location.search),this.state.currentPage,this.state.displayNumber).then(function(e){n.setState({plugins:e.data,elementCount:e.count,countPlugins:e.numberPages})}).catch(function(e){return console.log(e)})}},{key:"render",value:function(){return r.a.createElement("div",{className:"plugins-page-container"},r.a.createElement("header",null,r.a.createElement("h2",null,"Plugins"),r.a.createElement("p",null,"Here be plugins"),r.a.createElement("hr",null)),r.a.createElement(R,{onChange:null,onSubmit:this.handleSearchSubmit}),r.a.createElement(k,{currentPage:this.state.currentPage,elementCount:this.state.countPlugins,onCurrentPageChange:this.setCurrentPage}),r.a.createElement("div",{className:"plugin-container"},this.state.plugins&&this.state.plugins.length>0?this.state.plugins.map(function(e){return r.a.createElement(S,Object.assign({key:e._id},e))}):r.a.createElement("p",null,"Aucun plugin ne correspond \xe0 votre recherche !")),r.a.createElement(k,{currentPage:this.state.currentPage,elementCount:this.state.countPlugins,onCurrentPageChange:this.setCurrentPage}))}}]),t}(a.Component),U=(n(55),function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(s.a)(this,Object(u.a)(t).call(this,e))).state={plugin:null},n}return Object(m.a)(t,e),Object(i.a)(t,[{key:"componentDidMount",value:function(){var e=this;v.getPlugin(this.props.match.params.id).then(function(t){return e.setState({plugin:t.data})})}},{key:"render",value:function(){return r.a.createElement("div",{className:"pedalboard-details-container"},this.state.plugin?r.a.createElement(O,this.state.plugin):r.a.createElement("p",null,"Pas de donn\xe9es disponible"))}}]),t}(a.Component)),D=function(e){function t(){return Object(o.a)(this,t),Object(s.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(m.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){return r.a.createElement(p.a,null,r.a.createElement(a.Fragment,null,r.a.createElement(j,null),r.a.createElement("main",{className:"main-container"},r.a.createElement(h.a,null,r.a.createElement(g.a,{exact:!0,path:"/plugins",component:T}),r.a.createElement(g.a,{exact:!0,path:"/plugin/:id",component:U}),r.a.createElement(b.a,{to:"/plugins"})))))}}]),t}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(D,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[25,2,1]]]);
//# sourceMappingURL=main.3ff80c60.chunk.js.map