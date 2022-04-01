var b=Object.defineProperty,x=Object.defineProperties;var y=Object.getOwnPropertyDescriptors;var m=Object.getOwnPropertySymbols;var L=Object.prototype.hasOwnProperty,N=Object.prototype.propertyIsEnumerable;var g=(r,e,n)=>e in r?b(r,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):r[e]=n,d=(r,e)=>{for(var n in e||(e={}))L.call(e,n)&&g(r,n,e[n]);if(m)for(var n of m(e))N.call(e,n)&&g(r,n,e[n]);return r},p=(r,e)=>x(r,y(e));import{r as l,j as u,a as i,i as w,p as $,b as E}from"./vendor.e282d7c4.js";const j=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerpolicy&&(s.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?s.credentials="include":t.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(t){if(t.ep)return;t.ep=!0;const s=n(t);fetch(t.href,s)}};j();const S=r=>l.exports.createElement("svg",d({xmlns:"http://www.w3.org/2000/svg",width:32,height:32,viewBox:"0 0 24 24"},r),l.exports.createElement("path",{d:"M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4.44c-.32-.07-.33-.68-.33-.89l.01-2.47c0-.84-.29-1.39-.61-1.67 2.01-.22 4.11-.97 4.11-4.44 0-.98-.35-1.79-.92-2.42.09-.22.4-1.14-.09-2.38 0 0-.76-.23-2.48.93-.72-.2-1.48-.3-2.25-.31-.76.01-1.54.11-2.25.31-1.72-1.16-2.48-.93-2.48-.93-.49 1.24-.18 2.16-.09 2.38-.57.63-.92 1.44-.92 2.42 0 3.47 2.1 4.22 4.1 4.47-.26.2-.49.6-.57 1.18-.52.23-1.82.63-2.62-.75 0 0-.48-.86-1.38-.93 0 0-.88 0-.06.55 0 0 .59.28 1 1.32 0 0 .52 1.75 3.03 1.21l.01 1.53c0 .21-.02.82-.34.89H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",fill:"currentColor"})),O=(r,e,n)=>l.exports.useEffect(()=>{const o=setTimeout(r,n);return()=>clearTimeout(o)},[...e,r,n]);function _(){return function(r,e){return d(d({},r),typeof e=="function"?e(r):e)}}function R(r){return l.exports.useReducer(_(),r)}const X=r=>{const[e,n]=R(p(d({},r||{width:"90vw",height:200}),{dragging:!1,offsetX:0,offsetY:0}));return[e,{down:o=>{var t;((t=o.target)==null?void 0:t.closest(".cursor-nwse-resize"))!==null&&(o.preventDefault(),n({dragging:!0,offsetX:o.offsetX,offsetY:o.offsetY}))},drag:o=>{if(!e.dragging)return;let t=window.innerWidth+e.offsetX-o.clientX;t>window.innerWidth&&(t=window.innerWidth),n({width:t,height:window.innerHeight+e.offsetY-o.clientY})},up:o=>{o.preventDefault(),n({dragging:!1,offsetX:0,offsetY:0})}}]},Y=({small:r,children:e})=>{const[n,o]=l.exports.useState(0),[{width:t,height:s},{down:a,drag:f,up:c}]=X(),v=l.exports.useCallback(h=>o((h==null?void 0:h.getBoundingClientRect().height)||0),[]);return l.exports.useEffect(()=>(window.addEventListener("mousedown",a),window.addEventListener("mousemove",f),window.addEventListener("mouseup",c),window.addEventListener("mouseleave",c),()=>{window.removeEventListener("mousedown",a),window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",c),window.removeEventListener("mouseleave",c)}),[a,f,c]),u("div",{className:"w-100% h-100%",children:[e,u("div",{className:"absolute bottom-0 right-0 min-w-200px min-h-200px bg-white b-1 p-1 max-h-75vh z-666",style:{width:typeof t=="number"?`${t}px`:t,height:`${s}px`},children:[i("div",{className:"flex align-center cursor-nwse-resize pb-1",ref:v,children:"output"}),i("div",{className:"w-100% h-100%",style:n===0?void 0:{height:`calc(100% - ${n}px)`},children:r})]})]})},k=`
# strings in some forms
string = string
also_string = "string"
"also.string" = string
nested.string = string
multiline_raw = \`
  hello
  world
\`
multiline_formatted = """
  hello
  formatted
  world
"""
var = $var(123) # not appearing!!
sum = $math.sum(1,2,3,4)
concat = $concat(a, b, c)
assign = $assign($ref(obj), $ref(otherObj))
clone = $clone($ref(assign))

number = 123
also_number = 123.03

bool = true
also_bool = false

ref = $ref(obj.hello)

obj {
  hello = world
}

otherObj {
  hallo = mundo
}

obj.test {
  arrayInside [1,2,3]
}

obj {
  mergeMeSenpai = true
}

arr [
  1
  2
]

/*
  fibonacci
  ... or not
*/
otherArr [
  0
  1
  1
  2
  3
  5
  7
  $ref(.3)
]
`,z=()=>{const[r,e]=l.exports.useState(k),[n,o]=l.exports.useState("");return O(()=>{try{o(JSON.stringify($(r),null,2))}catch({message:t}){o(`parsing error: ${t}`)}},[r],750),u("div",{className:"flex flex-col w-100% h-100%",children:[u("nav",{className:"flex justify-between p-2",children:[i("div",{children:i("b",{children:"Ahocon Playground"})}),u("div",{className:"flex items-center",children:[i("div",{className:"pr-4 color-gray",children:"v0.1.8"}),i("div",{className:"w-20px h-20px",children:i("a",{target:"_blank",href:"https://github.com/steve-py96/ahocon",rel:"noopener noreferrer",className:"color-black",children:i(S,{className:"cursor-pointer w-100% h-100%"})})})]})]}),i("div",{className:"flex w-100% h-100% flex-1",children:i(Y,{small:i(w,{value:n,width:"100%",height:"100%",theme:"vs-dark",options:{minimap:{enabled:!1},readOnly:!0,scrollBeyondLastLine:!1}}),children:i(w,{value:r,onChange:t=>e(t||""),width:"100%",height:"100%",theme:"vs-dark",options:{minimap:{enabled:!1},scrollBeyondLastLine:!1}})})})]})};E.exports.render(i(z,{}),document.querySelector("#root"));
