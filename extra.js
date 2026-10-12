(function(){
function LS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
var T=setInterval(function(){
if(!document.body.classList.contains("ok")||!window.firebase||!firebase.apps.length||!LS("sb-uid"))return;
clearInterval(T);try{go()}catch(e){console.error(e)}},600);
function go(){
var uid=LS("sb-uid"),name=LS("sb-name")||"Me",base=firebase.firestore().collection("rooms").doc(window.SB_ROOM||"study-room");
var wrap=h("section","xwrap");document.querySelector("main").append(wrap);
function card(e,t){var c=h("section","card tb"),hd=h("div","card-head"),g=h("h2");g.append(h("span","hb b",e),document.createTextNode(t));hd.append(g);c.append(hd);wrap.append(c);return c}
// exams
var ex=[];try{ex=JSON.parse(LS("sb-exams")||"[]")}catch(e){}
var ec=h("section","card tp"),eh=h("div","card-head"),eg=h("h2");eg.append(h("span","hb p","\uD83D\uDCC5"),document.createTextNode("Exam countdowns (max 5)"));eh.append(eg);ec.append(eh);
var el=h("div","xex"),ef=h("div","xform"),en=h("input"),es=h("input"),ed=h("input"),ea=h("button","xb","Add exam"),ex2=h("button","xb","Cancel"),ei=-1;
en.type="text";en.placeholder="Exam name (e.g. Mid-term)";es.type="text";es.placeholder="Subject";ed.type="datetime-local";ex2.hidden=true;
ef.append(en,es,ed,ea,ex2);ec.append(el,ef);document.querySelector(".board").before(ec);
function sv(){ex.sort(function(a,b){return a.t-b.t});try{localStorage.setItem("sb-exams",JSON.stringify(ex))}catch(e){}}
function cd(t){var m=t-Date.now();if(m<=0)return"Done \u2705";var d=Math.floor(m/864e5),a=Math.floor(m%864e5/36e5),b=Math.floor(m%36e5/6e4);return d+"d "+a+"h "+b+"m"}
function er(){el.replaceChildren();if(!ex.length)el.append(h("p","empty","No exams yet. Add up to 5 below."));
ex.forEach(function(e,i){var r=h("div","xe"),l=h("div"),rt=h("div","xer"),eb=h("button","xb","\u270E"),db=h("button","xb","\u00D7");
l.append(h("b",null,e.n||e.s),h("small",null,(e.n&&e.s?e.s+" \u00B7 ":"")+new Date(e.t).toLocaleString([],{dateStyle:"medium",timeStyle:"short"})));
eb.onclick=function(){ei=i;en.value=e.n||"";es.value=e.s||"";ed.value=new Date(e.t-new Date(e.t).getTimezoneOffset()*6e4).toISOString().slice(0,16);ea.textContent="Save";ex2.hidden=false;en.focus()};
db.onclick=function(){if(confirm("Delete this exam?")){ex.splice(i,1);sv();er()}};
rt.append(h("strong",null,cd(e.t)),eb,db);r.append(l,rt);el.append(r)})}
function rf(){ei=-1;en.value=es.value=ed.value="";ea.textContent="Add exam";ex2.hidden=true}
ea.onclick=function(){var t=new Date(ed.value).getTime();if(!(en.value.trim()||es.value.trim())||isNaN(t)){alert("Exam name or subject, and date + time daalo");return}
var o={n:en.value.trim().slice(0,40),s:es.value.trim().slice(0,40),t:t};if(ei>=0)ex[ei]=o;else{if(ex.length>=5){alert("Maximum 5 exams");return}ex.push(o)}sv();rf();er()};
ex2.onclick=rf;er();setInterval(er,3e4);
// who
var wc=card("\uD83D\uDC65","Who's here (last 24 hours)"),wl=h("div","xwho");wc.append(wl);var rows=[];
function ago(ms){var m=Math.round(ms/6e4);return m<60?m+" min ago":Math.round(m/60)+" h ago"}
function rw(){wl.replaceChildren.apply(wl,rows.map(function(r){var on=r.age<15e4,p=h("div","xp"+(on?" on":""));p.append(h("i"),document.createTextNode(r.n+(r.me?" (you)":"")),h("small",null,on?"online":"last seen "+ago(r.age)));return p}))}
var seen=base.collection("seen");
function ping(){seen.doc(uid).set({name:name,t:Date.now()}).catch(function(){})}
ping();setInterval(ping,6e4);setInterval(rw,6e4);
seen.onSnapshot(function(s){var now=Date.now();rows=[];s.docs.forEach(function(d){var v=d.data()||{},a=now-(v.t||0);
if(a>864e5){if(d.id!==uid)d.ref.delete().catch(function(){});return}rows.push({n:v.name||"Friend",age:a,me:d.id===uid})});
rows.sort(function(a,b){return a.age-b.age});rw()});
// manage people
var mc2=card("\uD83E\uDDF9","Remove old people (offline)"),ml2=h("div","xex"),ra=h("button","xb","Remove all offline"),pp=[],pr={};
mc2.append(ml2,ra);
function offl(){var n=Date.now();return pp.filter(function(p){return p.id!==uid&&!(pr[p.id]&&n-pr[p.id]<45000)})}
function rm(id){["people","presence","seen","boards"].forEach(function(c){base.collection(c).doc(id).delete().catch(function(){})})}
function mr(){ml2.replaceChildren();var o=offl();
o.forEach(function(p){var r=h("div","xe"),l=h("div"),b=h("button","xb","Remove");
l.append(h("b",null,p.name||"Friend"),h("small",null,p.ls?"last seen "+new Date(p.ls).toLocaleString([],{dateStyle:"medium",timeStyle:"short"}):"offline"));
b.onclick=function(){if(confirm("Remove "+(p.name||"Friend")+"?"))rm(p.id)};r.append(l,b);ml2.append(r)});
if(!o.length)ml2.append(h("p","empty","No offline people."));ra.hidden=!o.length}
ra.onclick=function(){var o=offl();if(o.length&&confirm("Remove "+o.length+" offline people?"))o.forEach(function(p){rm(p.id)})};
base.collection("people").onSnapshot(function(s){pp=s.docs.map(function(d){var v=d.data()||{};return{id:d.id,name:v.name,ls:v.lastSeen}});mr()});
base.collection("presence").onSnapshot(function(s){pr={};s.docs.forEach(function(d){pr[d.id]=(d.data()||{}).beat||0});mr()});
setInterval(mr,2e4);
// boards
var W=800,H=500,bc=card("\uD83C\uDFA8","Drawing boards");
function cv(){var c=h("canvas","xcv");c.width=W;c.height=H;return c}
function draw(c,ss){var g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,W,H);g.lineCap=g.lineJoin="round";
ss.forEach(function(s){var p=s.p;g.strokeStyle=s.c;g.lineWidth=s.w;g.beginPath();g.moveTo(p[0],p[1]);if(p.length<4)g.lineTo(p[0]+.1,p[1]);for(var i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.stroke()})}
var fl=h("div","xlab","Friend's board (live, view only)"),ft=cv(),ml=h("div","xlab","My board (draw here)"),mc=cv(),tl=h("div","xtools");
bc.append(fl,ft,ml,mc,tl);draw(ft,[]);draw(mc,[]);
var mine=[],col="#D4577F",sz=5,cur=null,tm=0,loaded=false,bd=base.collection("boards");
function fire(){tm=0;var j=JSON.stringify(mine);if(j.length>9e5){alert("Board is full. Press Clear.");return}bd.doc(uid).set({name:name,s:j,t:Date.now()}).catch(function(){})}
function save(){if(!tm)tm=setTimeout(fire,300)}
var sw=["#D4577F","#FF8F76","#F4C95D","#5BBE8A","#6B7FD7","#8E6FE0","#3B2F63"];
function pick(c,b){col=c;tl.querySelectorAll(".xc").forEach(function(x){x.classList.remove("on")});if(b)b.classList.add("on")}
sw.forEach(function(c){var b=h("button","xc"+(c===col?" on":""));b.style.background=c;b.onclick=function(){pick(c,b)};tl.append(b)});
var cp=h("input");cp.type="color";cp.value="#D4577F";cp.className="xcp";cp.title="Any colour";cp.oninput=function(){pick(cp.value,null)};tl.append(cp);
var er=h("button","xb","Eraser");er.onclick=function(){pick("#FFFFFF",null)};tl.append(er);
var tw=h("div","xthick"),tr=h("input"),tv=h("span",null,sz+"px");tr.type="range";tr.min=1;tr.max=40;tr.value=sz;tr.oninput=function(){sz=+tr.value;tv.textContent=sz+"px"};tw.append(h("span",null,"Thickness"),tr,tv);bc.append(tw);
var u=h("button","xb","Undo");u.onclick=function(){mine.pop();draw(mc,mine);fire()};
var cl=h("button","xb","Clear");cl.onclick=function(){if(confirm("Clear my board?")){mine=[];draw(mc,mine);fire()}};tl.append(u,cl);
function pt(e){var r=mc.getBoundingClientRect();return[Math.round((e.clientX-r.left)/r.width*W),Math.round((e.clientY-r.top)/r.height*H)]}
mc.addEventListener("pointerdown",function(e){e.preventDefault();mc.setPointerCapture(e.pointerId);var p=pt(e);cur={c:col,w:sz,p:p};mine.push(cur);draw(mc,mine);save()});
mc.addEventListener("pointermove",function(e){if(!cur)return;var p=pt(e);cur.p.push(p[0],p[1]);draw(mc,mine);save()});
function up(){if(cur){cur=null;save()}}mc.addEventListener("pointerup",up);mc.addEventListener("pointercancel",up);
bd.onSnapshot(function(s){var f=null;s.docs.forEach(function(d){var v=d.data()||{};
if(d.id===uid){if(!loaded&&v.s){try{mine=JSON.parse(v.s);draw(mc,mine)}catch(e){}}loaded=true}
else if(!f||(v.t||0)>(f.t||0))f=v});
loaded=true;if(f){fl.textContent=(f.name||"Friend")+"'s board (live, view only)";try{draw(ft,JSON.parse(f.s||"[]"))}catch(e){}}});
// youtube
var yc=card("\u25B6\uFE0F","YouTube (watch together)"),yr=h("div","row"),yi=h("input"),yb=h("button","xb","Play"),yf=h("div","xyt"),yd=base.collection("games").doc("yt");
yi.type="text";yi.placeholder="Paste YouTube link here";yr.append(yi,yb);yc.append(yr,yf);
function yid(u){var m=String(u).trim().match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);return m?m[1]:""}
function ys(id){yf.replaceChildren();if(!id)return;var f=h("iframe");f.src="https://www.youtube-nocookie.com/embed/"+id+"?playsinline=1&rel=0";f.allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";f.allowFullscreen=true;f.referrerPolicy="strict-origin-when-cross-origin";yf.append(f)}
var yl="";yb.onclick=function(){var id=yid(yi.value);if(!id){alert("Valid YouTube link daalo");return}ys(id);yl=id;yd.set({id:id,by:name,t:Date.now()}).catch(function(){})};
yd.onSnapshot(function(d){var v=d.exists?d.data():null;if(v&&v.id&&v.id!==yl){yl=v.id;ys(v.id)}});
// tic tac toe
var tc=card("\u2B55","Tic Tac Toe"),gd=h("div","xttt"),gs=h("p","xs"),rb=h("button","xb","New game"),g=base.collection("games").doc("ttt");
var E={c:"         ",x:"",o:"",n:"X",w:""},st=E,bs=[];
for(var i=0;i<9;i++)(function(i){var b=h("button");b.onclick=function(){mv(i)};bs.push(b);gd.append(b)})(i);
tc.append(gd,gs,rb);var sc=h("div");sc.style.textAlign="center";sc.append(rb);tc.append(sc);
function me(){return st.x===uid?"X":st.o===uid?"O":""}
function win(c){var L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(var k=0;k<8;k++){var a=L[k];if(c[a[0]]!==" "&&c[a[0]]===c[a[1]]&&c[a[0]]===c[a[2]])return c[a[0]]}return c.indexOf(" ")<0?"D":""}
function mv(i){var s=Object.assign({},st),m=me();if(s.w||s.c[i]!==" ")return;
if(!m){if(!s.x){s.x=uid;m="X"}else if(!s.o){s.o=uid;m="O"}else return}
if(s.n!==m)return;var a=s.c.split("");a[i]=m;s.c=a.join("");s.w=win(s.c);s.n=m==="X"?"O":"X";g.set(s).catch(function(){})}
rb.onclick=function(){g.set({c:E.c,x:st.x||"",o:st.o||"",n:"X",w:""}).catch(function(){})};
function rt(){bs.forEach(function(b,i){var v=st.c[i];b.textContent=v===" "?"":v;b.className=v===" "?"":v});var m=me();
gs.textContent=st.w==="D"?"Draw!":st.w?(st.w===m?"You win! \uD83C\uDF89":"Friend wins"):!m&&st.x&&st.o?"Game is full":(!m?"Tap a box to join as "+(st.x?"O":"X"):(st.n===m?"Your turn ("+m+")":"Waiting for friend..."))}
g.onSnapshot(function(d){st=d.exists?d.data():E;rt()});rt();
}})();
