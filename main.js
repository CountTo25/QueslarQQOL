// ==UserScript==
// @name         QQOL
// @namespace    http://tampermonkey.net/
// @version      0.14
// @description  Quality of Quality of Life!
// @include *queslar.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        unsafeWindow
// ==/UserScript==


//TODO HOOK INTO document.querySelector('app-gamecontent') observer

class FTGMod {
 constructor() {
   let ver = '0.13';
   //OBSERVERS
   var modbody = this;
   this.newActionObserver = new MutationObserver(function(mutations) {
     mutations.forEach(function(mutation) {
          modbody.OnNewAction();
     });
    });
    this.newActionObserver.observe(
      document.querySelector('head > title'),
      {subtree: true, characterData: true, childList: true }
    );
    this.onactionhooks = [];



    this.newTabObserver = new MutationObserver(function(mutations) {
      //APP-INVENTORY
      mutations.forEach(function(mutation) {
        if (mutation.target.nodeName.toLowerCase().includes('app-')) {
          if (mutation.addedNodes.length>0) {
            if (mutation.target.nodeName.toLowerCase().split('-').length==2) {
              if (mutation.target.nodeName.toLowerCase().split('-')[1]!='gamecontent') {
              modbody.OnNewTab(mutation.target.nodeName.toLowerCase().split('-')[1]);
            }
            }

          }
        }
      });
    });

   this.newTabObserver.observe(
     document.querySelector('app-gamecontent'),
     {subtree: true, childList: true }
   );
   this.ontabhooks = [];
   //I SUCK AT JS
   document.onclick = function(){modbody.Update()} //im retarded, look up hooks later
                                                   //.clickable onclick?

   //NEW DOM
   var csselem = document.createElement("link");
   csselem.setAttribute("rel", "stylesheet");
   csselem.setAttribute("type", "text/css");
   csselem.setAttribute("href", "https://cdn.jsdelivr.net/gh/countto25/queslarQQOL@latest/cssfix.css");
   document.getElementsByTagName("head")[0].appendChild(csselem);

   let QQOLholder = document.createElement('div');
   QQOLholder.id = 'QQOL_holder';
   document.getElementById('profile-next-level').parentNode.insertBefore(QQOLholder,document.getElementById('profile-next-level').nextSibling)
   let QQOLinfo = document.createElement('div');
   QQOLinfo.style.marginTop = '10px';
   QQOLinfo.id='QQOL_info';
   QQOLinfo.innerHTML = 'QQOL v'+ver;
   let timetoleveluptooltip = document.createElement('div');
   timetoleveluptooltip.id = 'QQOL_time_to_levelup';
   let idletimeremainingtooltip = document.createElement('div');
   idletimeremainingtooltip.id='QQOL_remaining_time';
   document.getElementById('QQOL_holder').appendChild(QQOLinfo);
   document.getElementById('QQOL_holder').appendChild(timetoleveluptooltip);
   document.getElementById('QQOL_holder').appendChild(idletimeremainingtooltip);

   //DECLARE SHIT

   //FINISH
   this.HookOnAction(() => {modbody.Update()}, true);
   this.HookOnTab(function(x) {console.log(x)});
   console.log('loaded Quality of Quality of Life mod v'+ver+'. Have a nice day!');
 }
 HookOnAction(func, exec=false) {
   if (exec) func();
   this.onactionhooks.push(func);
 }
 HookOnTab(func, exec=false) {
   if (exec) func();
   this.ontabhooks.push(func);
 }

 Update() {
   this.TimeRemaining();
   this.TimeToLevelUp();
   this.TimeToCraft();
   this.TrySearchProviderUI();
 }

 GetRemainingActions() {
   return parseInt(parseInt(document.title.split(' - ')[0]));
 }

 OnNewAction() {
   for (let i=0; i<this.onactionhooks.length; i++) {
     this.onactionhooks[i]();
   }
 }

 OnNewTab(tname) {
   for (let i=0; i<this.ontabhooks.length; i++) {
     this.ontabhooks[i](tname);
   }
 }

 CreateTimerWindow() {
   if (document.querySelector('.h5.mt-1')) {
     let timerelement = document.createElement('span');
    timerelement.id = 'FTG_idle_timer';
    timerelement.classList.add('h5');
    timerelement.setAttribute('style','margin-top: .25rem !important;');
    document.querySelector('.h5.mt-1').parentNode.insertBefore(timerelement,document.querySelector('.h5.mt-1'))
  }
 }

 TimeRemaining() {
   let actionsRemaining = this.GetRemainingActions();
   let txt ='Idle time remaining: '+this.ActionsToTime(actionsRemaining)+this.GetSeconds(this.GetRemainingActions());
   if (actionsRemaining<0) {
     txt ="<span style='color: red'>Restart your actions!</span>";
   }
   document.getElementById('QQOL_remaining_time').innerHTML=txt;
 }

 TimeToCraft() {
   if (document.querySelector('.progress-bar-text')) {
     let txt = document.querySelector('.progress-bar-text').innerHTML;
     if (!document.getElementById('FTG_time_to_craft')) {
      let TTCelement = document.createElement('span');
      TTCelement.id = 'FTG_time_to_craft';
      document.querySelector('.progress-bar-text').appendChild(TTCelement);
     }
     let actionVal = parseInt(txt.split(' / ')[1].split(' ')[0]) - parseInt(txt.split(' / ')[0]);
     document.getElementById('FTG_time_to_craft').innerHTML = '('+this.ActionsToTime(actionVal)+this.GetSeconds(actionVal)+' remaining)';
   }
 }

 GetSeconds(actions) {
   let t = actions*6%60;
   if (t<10) t='.0'+t;
   else t='.'+t;
   return t;
 }

 TimeToLevelUp() {
   let txt = document.getElementById('profile-next-level').innerHTML;
   let actionVal = parseInt(txt.replace(/\D/g,''));
   txt='Time to next level: '+this.ActionsToTime(actionVal)+this.GetSeconds(actionVal);
   document.getElementById('QQOL_time_to_levelup').innerHTML = txt;

 }

 TrySearchProviderUI() {
   if (document.querySelector('.cdk-column-username.mat-column-username')&&!(document.getElementById('QQOL_service_search'))) {
     let serviceSearchBar = document.createElement('input');
     serviceSearchBar.id = 'QQOL_service_search';
     serviceSearchBar.placeholder='Find service provider by name';
     serviceSearchBar.classList.add('QQOL-searchbar');
     serviceSearchBar.addEventListener('input', ()=>{this.FindProvider()});
     let insertBefore = document.querySelector('.mat-table.cdk-table.mat-elevation-z8');
     insertBefore.parentNode.insertBefore(serviceSearchBar,insertBefore)
   }
   //on services tab
 }

 FindProvider() {

   let sTerm = document.getElementById('QQOL_service_search').value.toLowerCase();
   let users = document.querySelectorAll('td.cdk-column-username.mat-column-username > div');
   for (let i=0; i<users.length; i++) {
     if (users[i].innerHTML.toLowerCase().includes(sTerm)) {
       users[i].parentNode.parentNode.removeAttribute('style');
     } else {
       users[i].parentNode.parentNode.style.display='none'
     }
   }
 }

ActionsToTime(actions) {
   if (actions<0) return '00:00';
   let minval = Math.floor(actions/10);
   let hourval = Math.floor(minval/60);
   let remMinutes = minval%60;
   let remSeconds = actions/10
   return hourval+':'+(remMinutes<10?('0'+remMinutes):(remMinutes));
 }
}

//TY GREASEMONKEY
var QQOL = null;
var QQOLSetupInterval = setInterval(QQOLGMSetup, 100);
function QQOLGMSetup() {
  if (document.getElementById('profile-next-level')&&QQOL===null) {QQOL = new FTGMod(); clearInterval(QQOLSetupInterval); window.QQOL = QQOL;}
}
QQOLGMSetup();
