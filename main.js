// ==UserScript==
// @name         QQOL
// @namespace    http://tampermonkey.net/
// @version      0.32
// @description  Quality of Quality of Life!
// @include *queslar.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        unsafeWindow
// ==/UserScript==

//mat-tab-label-0-1
//TODO HOOK INTO document.querySelector('app-gamecontent') observer


////
//var rootElement = getAllAngularRootElements()[0].children[1]["__ngContext__"][30];
//      storage = rootElement.playerGeneralService;
////

class FTGMod {
 constructor() {
   this.ver = '0.32';
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
                let tab = mutation.target.nodeName.toLowerCase().split('-')[1];
                //crafting
                if (tab=='actions') {
                  let subtab = mutation.target.childNodes[2].nodeName.toLowerCase().split('-')[1];
                  if (subtab=='actions') {
                    subtab=='pets'; //Blah pls
                  }
                  modbody.currentTab = subtab;
                  modbody.OnNewTab(subtab);
                } else if (tab=='market') {
                  let subtab = mutation.target.childNodes[2].nodeName.toLowerCase().split('-')[2];
                  modbody.currentTab = subtab;
                  modbody.OnNewTab(subtab);
                } else {
                  modbody.currentTab = mutation.target.nodeName.toLowerCase().split('-')[1];
                  modbody.OnNewTab(mutation.target.nodeName.toLowerCase().split('-')[1]);
                }

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
   //document.onclick = function(){modbody.Update()} //im retarded, look up hooks later
                                                   //.clickable onclick?

   //NEW DOM
   var csselem = document.createElement("link");
   csselem.setAttribute("rel", "stylesheet");
   csselem.setAttribute("type", "text/css");
   csselem.setAttribute("href", "https://countto25.github.io/QueslarQQOL/cssfix.css");
   document.getElementsByTagName("head")[0].appendChild(csselem);

   let QQOLholder = document.createElement('div');
   QQOLholder.id = 'QQOL_holder';
   document.getElementById('profile-next-level').parentNode.insertBefore(QQOLholder,document.getElementById('profile-next-level').nextSibling);

   let QQOLinfo = document.createElement('div');
   QQOLinfo.style.marginTop = '10px';
   QQOLinfo.id='QQOL_info';
   QQOLinfo.innerHTML = '<span class="QQAOL-link-action">QQOL v'+this.ver+'</span>';

   let QQOLquests = document.createElement('div');
   QQOLquests.id='QQOL_quests';
   QQOLquests.innerHTML = 'Loading...';

   let timetoleveluptooltip = document.createElement('div');
   timetoleveluptooltip.id = 'QQOL_time_to_levelup';
   let idletimeremainingtooltip = document.createElement('div');
   idletimeremainingtooltip.id='QQOL_remaining_time';
   document.getElementById('QQOL_holder').appendChild(QQOLinfo);
   document.getElementById('QQOL_holder').appendChild(idletimeremainingtooltip);
   document.getElementById('QQOL_holder').appendChild(timetoleveluptooltip);
   document.getElementById('QQOL_holder').appendChild(QQOLquests);

   //DECLARE SHIT
   this.rememberquest = null;
   this.activetab = null;

   //FINISH
   this.HookOnAction(() => {modbody.Update()});
   this.HookOnAction(() => {if (modbody.rememberquest!=null && document.title.split(' - ')[1]!='Party') modbody.rememberquest--;});

   this.HookOnTab((x) => {console.log(x)});
   this.HookOnTab((x) => {if (x==='enchanting'||x==='crafting') modbody.Update()});
   this.HookOnTab((x) => {modbody.activetab = x});

   setInterval(() => {modbody.CheckLatestVersion()}, 1000000);

   this.CheckLatestVersion();

   console.log('loaded Quality of Quality of Life mod v'+this.ver+'. Have a nice day!');
 }

 HookOnAction(func, exec=false) {
   if (exec) func();
   this.onactionhooks.push(func);
 }
 HookOnTab(func, exec=false) {
   if (exec) func();
   this.ontabhooks.push(func);
 }

 get gameData() {
   let rootElement = getAllAngularRootElements()[0].children[1]["__ngContext__"][30];
   return rootElement.playerGeneralService;

 }

 Update() {
   this.TimeRemaining();
   this.TimeToLevelUp();
   this.TimeToCraft();
   this.TrySearchProviderUI();
   this.TimeToQuestComplete();
   this.IncomePerHour();
 }

 GetRemainingActions() {
   return this.gameData.playerActionService.actions.remaining;
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
   if (document.getElementById('QQOL_remaining_time'))
    document.getElementById('QQOL_remaining_time').innerHTML=txt;
 }

 TimeToCraft() {
   if (this.currentTab === 'enchanting' || this.currentTab=='craft') {
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
 }

 GetSeconds(actions) {
   let t = actions*6%60;
   if (t<10) t='.0'+t;
   else t='.'+t;
   return t;
 }

 IncomePerHour() {
  let infospan;
  if (!document.querySelector('#QQOL_GEPH')) {
    let appendTo = document.querySelector('.action-result-value-container');
    infospan = document.createElement('div');
    infospan.style.marginTop = '10px';
    infospan.id='QQOL_GEPH';
    if (appendTo)
      appendTo.appendChild(infospan);
  } else {
    infospan = document.querySelector('#QQOL_GEPH');
  }
  let exp = this.gameData.playerActionService.actionResult.income.experience.amount;
  let gold = this.gameData.playerActionService.actionResult.income.gold.amount;
  infospan.innerHTML = `(<span class='QQOL-tooltip'>${(gold*600).toLocaleString()} gold and ${(exp*600).toLocaleString()} experience per hour<span class='QQOL-tooltiptext'>Unless you die</span></span>)`;
 }


 TimeToQuestComplete() {
   let txt;
   let cQuest = this.gameData.playerQuestService.currentQuest[0];
   if (this.gameData.playerQuestService.currentQuestId!=0) {
     console.log(this.gameData.playerQuestService.currentQuest[0].objectiveType);
     if (cQuest.objectiveType=='actions') {
       let remaining = cQuest.objectiveAmount - cQuest.currentProgress;
       txt = 'Time to quest completion: '+this.ActionsToTime(remaining)+this.GetSeconds(remaining);
    } else if (cQuest.objectiveType=='kills') {
      if (this.gameData.playerActionService.currentSkill=='battling') {
        txt = '<span class="QQOL-tooltip">Time to quest completion<span class="QQOL-tooltiptext">If you keep on fighting solo and avoiding death</span></span>: '
          +this.ActionsToTime(cQuest.objectiveAmount - cQuest.currentProgress)+this.GetSeconds(cQuest.objectiveAmount - cQuest.currentProgress);
      } else {
        txt = 'Kills quest active, not in battle';
      }
    } else if (cQuest.objectiveType=='gold') {
        if (this.gameData.playerActionService.currentSkill=='battling') {
          let gpt;
          if (!this.gameData.partyService.isFighting) {
            gpt = this.gameData.playerActionService.actionResult.income.gold.amount;
          } else {
            gpt = this.gameData.partyService.actionsResult.income.gold.amount;
          }
          let actionsToCompletion = Math.ceil((cQuest.objectiveAmount - cQuest.currentProgress)/gpt);
          txt =
            '<span class="QQOL-tooltip">Time to quest completion<span class="QQOL-tooltiptext">At '
            +gpt+' gold per turn</span></span>: '+this.ActionsToTime(actionsToCompletion)+this.GetSeconds(actionsToCompletion);
      } else {
        txt = 'Gold quest active, not in battle';
      }
    }
   } else {
     txt = '<span style="color:red">Grab a new quest!</span>';
   }
   if (document.querySelector('#QQOL_quests'))
    document.querySelector('#QQOL_quests').innerHTML=txt;
  }

 TimeToLevelUp() {
   if (document.getElementById('profile-next-level')) {
   let txt = document.getElementById('profile-next-level').innerHTML;
   let actionVal = parseInt(txt.replace(/\D/g,''));
   txt='Time to next level: '+this.ActionsToTime(actionVal)+this.GetSeconds(actionVal);
   if (document.getElementById('QQOL_time_to_levelup'))
    document.getElementById('QQOL_time_to_levelup').innerHTML = txt;
    }

 }

 TrySearchProviderUI() {
   if (document.querySelector('.cdk-column-username.mat-column-username')&&!(document.getElementById('QQOL_service_search'))) {
     if (this.currentTab == 'enchanting' || this.currentTab == 'crafting') {
       let serviceSearchBar = document.createElement('input');
       serviceSearchBar.id = 'QQOL_service_search';
       serviceSearchBar.placeholder='Find service provider by name';
       serviceSearchBar.classList.add('QQOL-searchbar');
       serviceSearchBar.addEventListener('input', ()=>{this.FindProvider()});
       let insertBefore = document.querySelector('.mat-table.cdk-table.mat-elevation-z8');
       insertBefore.parentNode.insertBefore(serviceSearchBar,insertBefore)
    }
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

  CheckLatestVersion() {
    let modbody = this;
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.github.com/repos/countto25/queslarqqol/tags', true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        console.log(data);
        let latestVersion = data[1].name;
        console.log(parseFloat(latestVersion) + ' vs ' +parseFloat(modbody.ver));
        console.log(modbody.ver);
        console.log(parseFloat(latestVersion) > parseFloat(modbody.ver));
        if ((parseFloat(latestVersion) > parseFloat(modbody.ver))) {
          let txt = 'QQOL v'+modbody.ver+'. <a target="_blank" href="https://countto25.github.io/QueslarQQOL/" class="QQOL-link-action" style="color:red; text-decoration: none">Please update</a>';
          document.querySelector('#QQOL_info').innerHTML=txt;
        }
      } else {console.log('error getting new version :')}
    }
    request.send();
  }
 }


//TY GREASEMONKEY
var QQOL = null;
var QQOLSetupInterval = setInterval(QQOLGMSetup, 100);
function QQOLGMSetup() {
  if (document.getElementById('profile-next-level')&&QQOL===null) {QQOL = new FTGMod(); clearInterval(QQOLSetupInterval); window.QQOL = QQOL;}
}
QQOLGMSetup();
