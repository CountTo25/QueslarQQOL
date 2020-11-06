// ==UserScript==
// @name         QQOL
// @namespace    http://tampermonkey.net/
// @version      0.45
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


//QQOL.gameData.marketService.serviceOrders
//

class FTGMod {
 constructor() {
   this.ver = '0.45';
   //OBSERVERS
   var modbody = this;
   this.serviceOrders = {};
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
   //document.getElementById('mat-tab-content-0-1').children[0].appendChild(QQOLholder);

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
   this.updateInterval = null;

   //FINISH
   this.HookOnAction(() => {modbody.Update()});
   this.HookOnAction(() => {if (modbody.rememberquest!=null && document.title.split(' - ')[1]!='Party') modbody.rememberquest--;});
   this.HookOnAction(() => {if (modbody.updateInterval == null) {modbody.updateInterval = setInterval(() => {modbody.Update()}, 100)}});
   this.HookOnAction(() => {if (this.currentTab == 'enchanting' ) {this.CraftingServiceUI()}});
   this.HookOnAction(() => {if (this.currentTab == 'crafting' ) {this.CraftingServiceUI(false)}});
   this.HookOnAction(() => this.IncomePerHour());

   this.HookOnTab((x) => {console.log(x)});
   this.HookOnTab((x) => {if (x==='enchanting'||x==='crafting') modbody.Update()});
   this.HookOnTab((x) => {if (x==='enchanting'||x==='crafting') modbody.CraftingServiceUI()});
   this.HookOnTab((x) => {modbody.activetab = x});
   this.HookOnTab((x) => {if (x==='battle') this.BlockActionsOnOvercap()});

   setInterval(() => {modbody.CheckLatestVersion()}, 1000000);

   this.CheckLatestVersion();
   this.DoUI();

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

 BlockActionsOnOvercap() {
   return '';
   //find smth to do with issue
   if (this.gameData.playerActionService.actions.remaining > this.gameData.playerActionService.actions.total &&
       this.gameData.playerActionService.currentSkill == "battling" &&
       !this.gameData.partyService.isFighting) {
     document.querySelector('[joyridestep="startingTutorialSix"]').style.pointerEvents = 'none';
     document.querySelector('[joyridestep="startingTutorialSix"]').innerHTML = 'Refreshing will reset action cap';
   } else {
     document.querySelector('[joyridestep="startingTutorialSix"]').style.pointerEvents = 'unset';
     document.querySelector('[joyridestep="startingTutorialSix"]').innerHTML = 'Fight';
   }
 }

 TimeRemaining() {
   let actionsRemaining = this.GetRemainingActions();
   let txt ='Idle time remaining: '+this.ActionsToTime(actionsRemaining);
   let playerId = this.gameData.gameService.playerData.id;
   if (this.gameData.partyService.hasParty) {
    let partyActionsRemaining = this.gameData.partyService.partyInformation[playerId].actions.daily_actions_remaining;
    actionsRemaining += partyActionsRemaining;
    //<span class="QQOL-tooltip">
    txt ='<span class="QQOL-tooltip"><span class="QQOL-tooltiptext">'
      +this.GetRemainingActions()+
      ' solo actions and '+partyActionsRemaining+' party actions</span>Idle time remaining</span>: '
      +this.ActionsToTime(actionsRemaining);
   }
   if (this.GetRemainingActions()<0) {
     txt ="<span style='color: red'>Restart your actions!</span>";
   }
   if (document.getElementById('QQOL_remaining_time'))
    document.getElementById('QQOL_remaining_time').innerHTML=txt;
 }

 TimeToCraft() {
   if (this.currentTab === 'enchanting' || this.currentTab==='craft') {
     if (document.querySelector('.progress-bar-text')) {
       let txt = document.querySelector('.progress-bar-text').innerHTML;
       if (!document.getElementById('FTG_time_to_craft')) {
         let TTCelement = document.createElement('span');
         TTCelement.id = 'FTG_time_to_craft';
         document.querySelector('.progress-bar-text').appendChild(TTCelement);
       }
       let actionVal = parseInt(txt.split(' / ')[1].split(' ')[0]) - parseInt(txt.split(' / ')[0]);
       let chantBonus = (this.currentTab === 'enchanting')?this.myEquipmentData.enchanting:this.myEquipmentData.crafting;
       if (isNaN(chantBonus)) chantBonus = 0;
       let speed = 1+chantBonus;
       let estActionVal = Math.floor(actionVal/speed)
       document.getElementById('FTG_time_to_craft').innerHTML = '(~'+this.ActionsToTime(estActionVal)+')';
     }
   }
 }

 GetSeconds(actions) {
   return '';
 }

 IncomePerHour() {
  let infospan;
  let subname = (this.currentTab == 'party')?'p':'s'
  if (!document.querySelector('#QQOL_GEPH_'+subname)) {
    let appendTo = document.querySelector('.action-result-value-container');
    infospan = document.createElement('div');
    infospan.style.marginTop = '10px';
    infospan.id='QQOL_GEPH_'+subname;
    if (appendTo)
      appendTo.appendChild(infospan);
  } else {
    infospan = document.querySelector('#QQOL_GEPH_'+subname);
  }
  if (this.currentTab == 'party') {
    if (Object.keys(this.gameData.partyService.actionResult).length!=0) {
      let exp = this.gameData.partyService.actionResult.income.experience.amount;
      let gold = this.gameData.partyService.actionResult.income.gold.amount;
      infospan.innerHTML = `(<span class='QQOL-tooltip'>${(gold*600).toLocaleString()} gold and ${(exp*600).toLocaleString()} experience per hour<span class='QQOL-tooltiptext'>Unless you die</span></span>)`;
    }
  } else {
    if (Object.keys(this.gameData.playerActionService.actionResult).length!=0) {
      let exp = this.gameData.playerActionService.actionResult.income.experience.amount;
      let gold = this.gameData.playerActionService.actionResult.income.gold.amount;
      infospan.innerHTML = `(<span class='QQOL-tooltip'>${(gold*600).toLocaleString()} gold and ${(exp*600).toLocaleString()} experience per hour<span class='QQOL-tooltiptext'>Unless you die</span></span>)`;
    }
  }
 }


 TimeToQuestComplete() {
   let txt;
   let cQuest = this.gameData.playerQuestService.currentQuest[0];
   if (this.gameData.playerQuestService.currentQuestId!=0) {
     if (cQuest.objectiveType=='actions') {
       let remaining = cQuest.objectiveAmount - cQuest.currentProgress;
       txt = 'Time to quest completion: '+this.ActionsToTime(remaining);
    } else if (cQuest.objectiveType=='kills') {
      if (this.gameData.playerActionService.currentSkill=='battling') {
        txt = '<span class="QQOL-tooltip">Time to quest completion<span class="QQOL-tooltiptext">If you keep on fighting solo and avoiding death</span></span>: '
          +this.ActionsToTime(cQuest.objectiveAmount - cQuest.currentProgress)
      } else {
        txt = 'Kills quest active, not in battle';
      }
    } else if (cQuest.objectiveType=='gold') {
        if (this.gameData.playerActionService.currentSkill=='battling') {
          let gpt = 0;
          if (!this.gameData.partyService.isFighting) {
            gpt = this.gameData.playerActionService.actionResult.income.gold.amount;
            if (this.gameData.playerActionService.actionResult.income.gold.tax)
              gpt+=this.gameData.playerActionService.actionResult.income.gold.tax;
          } else {
              txt = 'Doing party actions';
              if (document.querySelector('#QQOL_quests'))
               document.querySelector('#QQOL_quests').innerHTML=txt;
              return false;
          }
          let actionsToCompletion = Math.ceil((cQuest.objectiveAmount - cQuest.currentProgress)/gpt);
          txt =
            '<span class="QQOL-tooltip">Time to quest completion<span class="QQOL-tooltiptext">At '
            +gpt+' gold per turn</span></span>: '+this.ActionsToTime(actionsToCompletion);
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
   txt='Time to next level: '+this.ActionsToTime(actionVal);
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
   let subSeconds =  this.gameData.partyService.isFighting?this.gameData.partyService.countDown:this.gameData.playerActionService.countDown;
   if ((actions*6%60) - (6-subSeconds)  < 0)
    remMinutes--;

    let remSec = actions*6%60;
    let a = 6-subSeconds;
    if (remSec-a<0) {remSec=remSec+60-a} else {remSec = remSec-a;}
    if (remSec<10) remSec='.0'+remSec;
    else remSec='.'+remSec;

   return hourval+':'+(remMinutes<10?('0'+remMinutes):(remMinutes))+remSec;
 }

 CraftingServiceUI(isEnch = true) {

   let drawFrom = isEnch?this.gameData.playerEnchantingService : this.gameData.playerCraftingService;
   if (!(this.gameData.playerEnchantingService.isEnchanting||this.gameData.playerCraftingService.isCrafting)) return 'eh';
   let serviceData = drawFrom.serviceData;
   let dataHolder;
   let chantBonus = isEnch?this.myEquipmentData.enchanting:this.myEquipmentData.crafting;
   if (isNaN(chantBonus)) chantBonus = 0;
   let speed = 1+chantBonus;
   if (!document.querySelector('#QQOL_service_window')) {
     let objClass = 'app-'+(isEnch?'enchanting':'craft');
     let insertWhere;
     if (document.querySelector(objClass + ' .action-progress')) {
     insertWhere = document.querySelector('.'+(isEnch?'enchanting':'crafting')+'-action-blocks').parentNode;
   } else {
     insertWhere = document.querySelector(objClass);
   }
     dataHolder = document.createElement('div');
     dataHolder.id='QQOL_service_window';
     dataHolder.style.width='25%';
     dataHolder.classList.add('grid-item');
     dataHolder.style.border='var(--main-border-color)';
     dataHolder.style.borderRadius='10px';
     dataHolder.style.marginLeft='5px';
     dataHolder.style.marginRight='5px';
     dataHolder.style.height='max-content';
     if (insertWhere)
      insertWhere.appendChild(dataHolder);
   } else {
     dataHolder = document.querySelector('#QQOL_service_window');
   }
   let title = serviceData.listings.length > 0 ? 'Your upcoming orders:' : 'No orders in your queue :(';
   dataHolder.innerHTML = '<div class="main-color under-menu-title"><span>'+title+'</span></div>';
    dataHolder.innerHTML+='<div id="QQOL_service_list" style="overflow-y: scroll; height: 150px; padding-left: 5px; text-align:left"></div>';
    dataHolder = document.querySelector('#QQOL_service_list');
   let queueTime = 0;
   let currentData = isEnch?this.gameData.playerEnchantingService:this.gameData.playerCraftingService;
   let totalRelics = 0;
   if (currentData.isEnchanting||currentData.isCrafting) {
     let source = (isEnch?currentData.craftedEnchant:currentData.craftedEquipment);
     let currentRem = source.crafted_actions_required - source.crafted_actions_done;
     queueTime = Math.floor((currentRem) /speed)*6;
   }

   let q = this.gameData.playerQueueService['player'+(isEnch?'Enchanting':'Crafting')+'Queue'];
   if (q.length>0) {
     for (let i=0; i<q.length; i++) {
       //not sure if the formula is right, shoutout   to dude who didnt want to be shoutouted lol
       //round(N5^0.5*4*3)
       //whoever did that formula, shout out to you. Contact me, i'll reference ya
       let formula = 0;
       if (isEnch)
        formula = Math.ceil(Math.pow(q[i].level_requirement,0.5)*((q[i].item_rarity+1)/2)*3);
       else
        formula = Math.ceil(Math.pow(q[i].level_requirement/2, 0.5)*(Math.pow(5, 0.5)+(q[i].item_rarity+1)/2)*3);
       //look up into whats this
       //=ROUND(($C$5/2)^0.5*(5^0.5+switch($C$8,"Relic",4,"Unique",3.5,"Magical",3))*3)
       //whoever did that formula, shout out to you. Contact me, i'll reference ya
       console.log('adding actions: '+formula/speed+'('+formula/speed*6+')');
       queueTime+=(formula/speed)*6;
     }
   }
   let totalOrders = 0;
   let relativeOrders = 0;
   for (let i = 0; i<serviceData.listings.length; i++) {
     let txt = '';
     let listing = serviceData.listings[i];
     totalRelics+=(listing.price_type=='flat'?listing.price_value:listing.price_value*listing.crafted_actions_required);
     let remActions = listing.crafted_actions_required;
     console.log(speed+'?')
     let timer = Math.floor(listing.crafted_actions_required / speed)*6;
     txt+='<p style="margin-bottom: 0px;">In '+this.SecondsToString(queueTime)+': ';
     queueTime+=timer;
     totalOrders++;
     if (this.IsPlayerRelated(listing.buyerUsername))
      relativeOrders++;


     if (this.IsPlayerRelated(listing.buyerUsername)) {
        txt+='<span class="QQOL-tooltip" style="color: var(--main-color)">'+listing.buyerUsername+'<span class="QQOL-tooltiptext">Your party, village or kingdom member</span></span>, '+listing.price_value+(listing.price_type=='flat'?' flat':'/action')+'</p>';
     } else {
        txt+='<span>'+listing.buyerUsername+'</span>, '+listing.price_value+(listing.price_type=='flat'?' flat':'/action')+'</p>';
     }
     dataHolder.innerHTML+=txt;
   }
   dataHolder=document.querySelector('#QQOL_service_window');
   let footer = '';
   footer+='<div class="main-color under-menu-title" style="border-radius: 0px; border-bottom: 1px solid var(--menu-background-color)"><p style="margin-bottom: 0px">';
   footer+='Total orders: '+totalOrders;
   if (relativeOrders>0) {
      footer+=', '+relativeOrders+' from relatives';
   }
   footer+='</p></div>';
   footer+='<div class="main-color under-menu-title" style="border-radius: 0px"><p style="margin-bottom: 0px">Total relics: '+totalRelics.toLocaleString()+'</p></div>';
   let hVal = Math.floor(((queueTime % 31536000) % 86400) / 3600);
   let split = (Math.floor(totalRelics/hVal*10)/10);
   let output = 'Clean RPH: '+(split/10*2) + '</br>Broken RPH: '+(split/10*8);
   footer+='<div class="main-color under-menu-title" style="border-radius: 0px 0px 8px 8px"><p style="margin-bottom: 0px">RPH: <span class="QQOL-tooltip">'+(Math.floor(totalRelics/hVal*10)/10).toLocaleString()+'<span class="QQOL-tooltiptext">'+output+'</span></span></p></div>';
   if(dataHolder)
    dataHolder.innerHTML+=footer;
 }



 SecondsToString(seconds)
{
  var numyears = Math.floor(seconds / 31536000);
  var numdays = Math.floor((seconds % 31536000) / 86400);
  var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  var numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
  return numhours.toString().padStart(2, '0') + ":" + numminutes.toString().padStart(2, '0') + "." + numseconds.toString().padStart(2, '0');
}




 get myEquipmentData() {
   let myID = this.gameData.gameService.playerData.id;
   return this.gameData.partyService.partyInformation[myID].equipment;
 }
 get playerRelatives() {
   let relatives = [];
   if (this.gameData.playerKingdomService.isInKingdom) {
    this.gameData.playerKingdomService.kingdomData.village.forEach((village) => {
       village.members.forEach((member) => {
         relatives.push(member.username);
       });
     });
   } else if (this.gameData.playerVillageService.isInVillage) {
     this.gameData.playerVillageService.general.members.forEach((member) => {
       relatives.push(member.username);
     });
   }
   if (this.gameData.partyService.hasParty) {
     for (let member in this.gameData.partyService.partyInformation) {
       if (!relatives.includes(this.gameData.partyService.partyInformation[member].player.username))
        relatives.push(this.gameData.partyService.partyInformation[member].player.username);
     }
   }
   return relatives;
 }

  IsPlayerRelated(name) {
    if (this.playerRelatives.includes(name))
      return true;
    else
      return false;
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
          let txt = 'QQOL v'+modbody.ver+'. <a target="_blank" href="https://countto25.github.io/QueslarQQOL?update=true" class="QQOL-link-action" style="color:red; text-decoration: none">Please update</a>';
          document.querySelector('#QQOL_info').innerHTML=txt;
        } else if (parseFloat(latestVersion) < parseFloat(modbody.ver)) {
          let txt = 'QQOL v'+modbody.ver+'. <span style="color:green; text-decoration: none">Maybe do your actual job?</span>';
          document.querySelector('#QQOL_info').innerHTML=txt;
        }
      } else {console.log('error getting new version :')}
    }
    request.send();
  }

  fetchHTML(url) {
    if( 'undefined' == typeof(url) ) return false;
    let p;
    if( document.all ){
      p = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
    p = new XMLHttpRequest();
    }
    let rnd = Math.random().toString().substring(3);
    if( url.indexOf('?') > -1 )
    {
      url+='&rnd='+rnd;
    }
    else
    {
      url+='?rnd='+rnd;
    }
    p.open("GET",url,false);
    p.send(null);
    return p.responseText;
}

  DoUI() {
    let div = document.createElement("div");
    let settingsmenu = this.fetchHTML('https://countto25.github.io/QueslarQQOL/menu.html');
    div.classList.add("QQOLsettings");
    div.style.display = 'none';
    div.innerHTML = settingsmenu;
    document.body.appendChild(div);
  }
 }


//TY GREASEMONKEY
var QQOL = null;
var QQOLSetupInterval = setInterval(QQOLGMSetup, 100);
function QQOLGMSetup() {
  if (document.getElementById('profile-next-level')&&QQOL===null) {QQOL = new FTGMod(); clearInterval(QQOLSetupInterval); window.QQOL = QQOL;}
}
QQOLGMSetup();
