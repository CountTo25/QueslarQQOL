// ==UserScript==
// @name         QQOL
// @namespace    countto25.queslar.qqol
// @version      1.00
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
        this.ver = '1.00';
        this.logging = true;

        //DECLARE SHIT
        this.onactionhooks = [];
        this.ontabhooks = [];
        this.settings = {
            show_itr: true,
            show_nl: true,
            show_ttqc: true,
            show_tttl: false,
            show_ttke: false,
            target_level: 0
        };
        this.currentTab = 'battle';
        this.updateInterval = null;
        this.fightTxtChanged = false;
        this.incomeInfo = false;

        // Setup/loading.
        this.loadData();
        this.setupObservers();
        this.setupDom();
        this.SetupSettings();


        // Add action and tab listeners.
        let qqolMod = this;
        this.HookOnAction(() => {this.Update()});
        this.HookOnAction(() => {if (this.updateInterval == null) {this.updateInterval = setInterval(() => {qqolMod.Update()}, 1000)}});
        this.HookOnAction(() => this.IncomePerHour());
        this.HookOnAction(() => this.BlockActionsOnOvercap());

        this.HookOnTab((tabName) => {this.logText("Tab Name: " + tabName)});
        this.HookOnTab((tabName) => {this.IncomePerHour()});
        this.HookOnTab((tabName) => {this.BlockActionsOnOvercap()});


        // Check for an update right now.
        this.CheckLatestVersion();
        // Continue checking for updates every hour.
        setInterval(() => {qqolMod.CheckLatestVersion()}, 3600000);

        this.logText('Loaded Queslar Quality of Life mod v'+this.ver+'. Have a nice day!');
    }

    HookOnAction(func, exec=false) {
        if (exec) func();
        this.onactionhooks.push(func);
    }
    HookOnTab(func, exec=false) {
        if (exec) func();
        this.ontabhooks.push(func);
    }

    OnNewAction() {
        for (let i=0; i<this.onactionhooks.length; i++) {
            this.onactionhooks[i]();
        }
    }
    OnNewTab(tname) {
        // If the tab changed, then any of the main page elements that may have been added by QQOL will have been removed, so reset all of those trackers.
        this.incomeInfo = false;
        this.fightTxtChanged = false;

        for (let i=0; i<this.ontabhooks.length; i++) {
            this.ontabhooks[i](tname);
        }
    }


    logText(text, objectData=null) {
        if (this.logging) {
            console.log("countto25.queslar.qqol    " + text);

            if (objectData !== null) {
                console.log(objectData);
            }
        }
    }
    loadData() {
        let qqolDataString = localStorage.getItem("countto25_queslar_qqol");
        this.logText("Stringified data from storage: " + qqolDataString);

        if (qqolDataString != null) {
            let qqolData = JSON.parse(qqolDataString);
            this.settings = qqolData.settings;

            // Turn off showing the time to target level if no reasonable level was targeted.
            if (qqolData.settings.tttl < 1) {
                this.settings.show_tttl = false;
            }
        }
    }
    saveData() {
        let qqolData = {};
        qqolData.settings = this.settings;
        let qqolDataString = JSON.stringify(qqolData);
        localStorage.countto25_queslar_qqol = qqolDataString;
    }

    setupObservers() {
        let qqolMod = this;
        this.newActionObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                qqolMod.OnNewAction();
            });
        });
        this.newActionObserver.observe(
            document.querySelector('head > title'),
            {subtree: true, characterData: true, childList: true}
        );

        this.newTabObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    let target = mutation.target.nodeName.toLowerCase();
                    if (target.includes('app-')) {
                        let parts = target.split('-')
                        if (parts.length == 2 && parts[1] != 'gamecontent') {
                            let tab = parts[1];

                            // Make the tab more specific (and correct a naming error, if relevant).
                            if (tab == 'actions') {
                                tab = mutation.target.childNodes[2].nodeName.toLowerCase().split('-')[1];
                                if (tab == 'actions') {
                                    tab == 'pets'; //Blah pls
                                }
                            } else if (tab == 'market') {
                                tab = mutation.target.childNodes[2].nodeName.toLowerCase().split('-')[2];
                            } else if (tab == 'party') {
                                let subtab = mutation.target.childNodes[4].nodeName.toLowerCase().split('-')[2];
                                tab = tab + "-" + subtab;
                            }

                            qqolMod.currentTab = tab;
                            qqolMod.OnNewTab(tab);
                        }
                    }
                }
            });
        });
        this.newTabObserver.observe(
            document.querySelector('app-gamecontent'),
            {subtree: true, childList: true }
        );
    }

    setupDom() {
        var csselem = document.createElement("link");
        csselem.setAttribute("rel", "stylesheet");
        csselem.setAttribute("type", "text/css");
        csselem.setAttribute("href", "https://countto25.github.io/QueslarQQOL/cssfix.css");
        document.getElementsByTagName("head")[0].appendChild(csselem);

        let QQOLholder = document.createElement('div');
        QQOLholder.id = 'QQOL_holder';
        QQOLholder.style.marginTop = '10px';
        document.getElementById('profile-next-level').parentNode.appendChild(QQOLholder, null);

        let QQOLinfo = document.createElement('div');
        QQOLinfo.id='QQOL_info';
        QQOLinfo.innerHTML = '<span id="toSettings" class="QQOL-link-action"><mat-icon class="mat-icon material-icons" style="vertical-align: bottom: height: 16px; width: 16px; font-size: 16px">settings</mat-icon>QQOL v'+this.ver+'</span><span id="updateMsg" />';

        let idletimeremainingtooltip = document.createElement('div');
        idletimeremainingtooltip.id='QQOL_remaining_time';
        idletimeremainingtooltip.innerHTML = "";
        if (!this.settings.show_itr) {
            idletimeremainingtooltip.style.display = 'none';
        }

        let timetoleveluptooltip = document.createElement('div');
        timetoleveluptooltip.id = 'QQOL_time_to_levelup';
        timetoleveluptooltip.innerHTML = "";
        if (!this.settings.show_nl) {
            timetoleveluptooltip.style.display = 'none';
        }

        let QQOLquests = document.createElement('div');
        QQOLquests.id='QQOL_quests';
        QQOLquests.innerHTML = 'Loading...';
        if (!this.settings.show_ttqc) {
            QQOLquests.style.display = 'none';
        }

        let QQOLTimeToTargetLevel = document.createElement('div');
        QQOLTimeToTargetLevel.id='QQOL_TTTL';
        QQOLTimeToTargetLevel.innerHTML = '';
        if (!this.settings.show_tttl) {
            QQOLTimeToTargetLevel.style.display = 'none';
        }

        let QQOLkdexp = document.createElement('div');
        QQOLkdexp.id='QQOL_kingdomexploration_div';
        QQOLkdexp.innerHTML = '';
        if (!this.settings.show_ttke) {
            QQOLkdexp.style.display = 'none';
        }

        document.getElementById('QQOL_holder').appendChild(QQOLinfo);
        document.getElementById('QQOL_holder').appendChild(idletimeremainingtooltip);
        document.getElementById('QQOL_holder').appendChild(timetoleveluptooltip);
        document.getElementById('QQOL_holder').appendChild(QQOLquests);
        document.getElementById('QQOL_holder').appendChild(QQOLTimeToTargetLevel);
        document.getElementById('QQOL_holder').appendChild(QQOLkdexp);
    }

    CheckLatestVersion() {
        let qqolMod = this;
        let request = new XMLHttpRequest();
        request.open('GET', 'https://api.github.com/repos/countto25/queslarqqol/tags', true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                var data = JSON.parse(request.responseText);
                qqolMod.logText("Version tags response: ", data);
                let latestVersionString = data[1].name;
                qqolMod.logText("This script version: " + qqolMod.ver + "; Latest server version: " + latestVersionString);

                let latestVersion = parseFloat(latestVersionString);
                let thisVersion = parseFloat(qqolMod.ver);
                if (latestVersion > thisVersion) {
                    qqolMod.logText("Newer version available");
                    let txt = '<a target="_blank" href="https://countto25.github.io/QueslarQQOL?update=true" class="QQOL-link-action" style="color:red; text-decoration: none">Please update</a>';
                    document.querySelector('#updateMsg').innerHTML=txt;
                } else if (latestVersion < thisVersion) {
                    qqolMod.logText("Only older versions available");
                    let txt = '<span style="color:green; text-decoration: none">Maybe do your actual job?</span>';
                    document.querySelector('#updateMsg').innerHTML=txt;
                }
            } else {
                console.log('countto25.queslar.qqol    Error getting latest version information.')
            }
        }

        request.send();
    }

    get gameData() {
        let rootElement = getAllAngularRootElements()[0].children[1]["__ngContext__"][30];
        return rootElement.playerGeneralService;
    }

    SecondsToString(seconds) {
        var numyears = Math.floor(seconds / 31536000);
        var numdays = Math.floor((seconds % 31536000) / 86400);
        var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
        var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
        var numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
        return numhours.toString().padStart(2, '0') + ":" + numminutes.toString().padStart(2, '0') + "." + numseconds.toString().padStart(2, '0');
    }

    ActionsToTime(actions) {
        if (actions<1) {
            return '00:00';
        }

        let minval = Math.floor(actions/10);
        let hourval = Math.floor(minval/60);
        let remMinutes = minval%60;
        let remSeconds = actions/10
        let subSeconds = this.gameData.partyService.isFighting?this.gameData.partyService.countDown:this.gameData.playerActionService.countDown;
        if ((actions*6%60) - (6-subSeconds) < 0) {
            remMinutes--;
        }

        let remSec = actions*6%60;
        let a = 6-subSeconds;
        if (remSec-a<0) {
            remSec=remSec+60-a
        } else {
            remSec = remSec-a;
        }
        if (remSec<10) remSec='.0'+remSec;
        else remSec='.'+remSec;

        let dayVal = Math.floor(hourval/24);
        return ((dayVal>0)?(dayVal+'d '):(''))+hourval%24+':'+(remMinutes<10?('0'+remMinutes):(remMinutes))+remSec;
    }

    BlockActionsOnOvercap() {
        if (this.currentTab == 'battle') {
            if (this.gameData.playerActionService.actions.remaining > this.gameData.playerActionService.actions.total
                    && this.gameData.playerActionService.currentSkill == "battling"
                    && !this.gameData.partyService.isFighting
                    && !this.fightTxtChanged) {
                this.logText("Player has extra actions.");
                document.querySelector('[joyridestep="startingTutorialSix"]').childNodes[0].innerHTML = 'Refreshing will reset action cap.';
                this.fightTxtChanged = true;

                // The above text change is only meant to be a warning, but the button is still clickable and will refresh this tab (maybe the user put on a larger action set and wants to refresh to pick even more actions).
                // That removes the income div and requires the fight button text to go back to normal. Attach a function to set those up.
                document.querySelector('[joyridestep="startingTutorialSix"]').addEventListener("click", (e) => {
                    document.querySelector('[joyridestep="startingTutorialSix"]').childNodes[0].innerHTML = 'Fight';
                    this.incomeInfo = false;
                });
            } else if (this.gameData.playerActionService.actions.remaining <= this.gameData.playerActionService.actions.total
                    && this.gameData.playerActionService.currentSkill == "battling"
                    && !this.gameData.partyService.isFighting
                    && this.fightTxtChanged) {
                document.querySelector('[joyridestep="startingTutorialSix"]').childNodes[0].innerHTML = 'Fight';
                this.fightTxtChanged = false;
            }
        }
    }

    IncomePerHour() {
        if (this.currentTab == 'battle' || this.currentTab == 'party-battle') {
            let infospan;
            let suffix = (this.currentTab == 'party-battle')?'p':'s';

            if (this.incomeInfo) {
                infospan = document.querySelector('#QQOL_GEPH_'+suffix);
            } else {
                infospan = document.createElement('div');
                infospan.style.marginTop = '10px';
                infospan.id='QQOL_GEPH_'+suffix;
                infospan.innerHTML = "<span class='QQOL-tooltip'><span id='QQOL_income_gold'></span> gold and <span id='QQOL_income_exp'></span> experience per hour<span class='QQOL-tooltiptext'>Unless you die</span></span>";
                document.querySelector('.action-result-value-container').appendChild(infospan);
                this.incomeInfo = true;
            }

            let update = false;
            let exp = 1;
            let gold = 1;
            if (this.currentTab == 'party-battle') {
                if (Object.keys(this.gameData.partyService.actionResult).length != 0) {
                    exp = this.gameData.partyService.actionResult.income.experience.amount;
                    gold = this.gameData.partyService.actionResult.income.gold.amount;
                    update = true;
                }
            } else {
                if (Object.keys(this.gameData.playerActionService.actionResult).length!=0) {
                    exp = this.gameData.playerActionService.actionResult.income.experience.amount;
                    gold = this.gameData.playerActionService.actionResult.income.gold.amount;
                    update = true;
                }
            }

            if (update) {
                document.querySelector('#QQOL_income_gold').innerHTML = (gold*600).toLocaleString();
                document.querySelector('#QQOL_income_exp').innerHTML = (exp*600).toLocaleString();
            }
        }
    }

    Update() {
        this.TimeRemaining();
        this.TimeToLevelUp();
        this.TimeToQuestComplete();
        this.ReflectTimeToTargetLevel();
        this.explorationTimer();
    }

    TimeRemaining() {
        if (this.settings.show_itr) {
   let actionsRemaining = this.GetRemainingActions();
   let txt ='Idle time remaining: '+this.ActionsToTime(actionsRemaining);
   let playerId = this.gameData.gameService.playerData.id;
   if (this.gameData.partyService.hasParty) {
    let partyActionsRemaining = this.gameData.partyService.partyOverview.partyInformation[playerId].actions.daily_actions_remaining;
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
    }

    explorationTimer() {
        if (this.settings.show_ttke) {
     //rootElement.playerGeneralService.playerKingdomService.kingdomData.selectedExploration

     if (!this.gameData.playerKingdomService.isInKingdom) {
         return;
     }

     if (!this.gameData.playerKingdomService.kingdomData) {
         return;
     }

     if (!this.gameData.playerKingdomService.kingdomData.selectedExploration) {
         return;
     }

     let exploration = this.gameData.playerKingdomService.kingdomData.selectedExploration;
     let timetoend = new Date(exploration.exploration_timer);
     timetoend = Math.floor(timetoend.getTime() / 1000);
     let now = new Date();
     now = Math.floor(now.getTime() / 1000);

     let diff = timetoend - now;
     let time = this.SecondsToString(diff);
     document.querySelector('#QQOL_kingdomexploration').innerHTML = 'KD exploration: '+time;
        }
    }

    TimeToQuestComplete() {
        if (!this.settings.show_ttqc) {
            return;
        }

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
        if (this.settings.show_nl) {
            if (document.getElementById('profile-next-level')) {
                let txt = document.getElementById('profile-next-level').innerHTML;
                let actionVal = parseInt(txt.replace(/\D/g,''));
   txt='Time to next level: '+this.ActionsToTime(actionVal);
   if (document.getElementById('QQOL_time_to_levelup'))
                document.getElementById('QQOL_time_to_levelup').innerHTML = txt;
            }
        }
    }

    ExpToLevel() {
        let expBank = 0;
        let currentLevel = this.gameData.playerLevelsService.battling.level;
   if (!localStorage.getItem('targetLevel')) return false;
   let targetLevel = parseInt(localStorage.getItem('targetLevel'));
        let currentExp = this.gameData.playerLevelsService.battling.exp.have;
   if (targetLevel == 0) return false;
        for (let i = currentLevel; i < targetLevel; i++) {
            let expToLevel = Math.round(25000 * Math.pow(i, 0.5));
            let levelTemp = i;
            while (levelTemp > 1500) {
                expToLevel += 250 * Math.pow((levelTemp - 1500), 1.25)
                levelTemp -= 1500;
            }
            expBank+=expToLevel;
        }

        return expBank-currentExp;
    }

    TimeToTargetLevel() {
   if (!localStorage.getItem('targetLevel')) {
     return 'Time to target level: check settings';
   }
   let actionVal;
   if (this.gameData.playerActionService.actionResult.income && this.gameData.playerActionService.actionResult.income.experience.amount) {
      actionVal = this.gameData.playerActionService.actionResult.income.experience.amount;
   } else {return '';}
   let totalExpReq = this.ExpToLevel();
   let actionsReq = Math.ceil(totalExpReq/actionVal);
   let tLevel = localStorage.targetLevel;
   return 'Time to level '+tLevel+': '+this.ActionsToTime(actionsReq);
    }

    ReflectTimeToTargetLevel() {
        if (this.settings.show_tttl) {
   let div = document.getElementById('QQOL_TTTL');
   if (!div) return;
   div.innerHTML = this.TimeToTargetLevel();
        }
    }

    SetupSettings() {
        let div = document.createElement("div");
        div.classList.add("QQOLsettings");
        div.style.display = 'none';
        div.innerHTML = this.settingsPageHtml;
        document.body.appendChild(div);

        let qqolMod = this;
        document.querySelector('#exitSettings').onclick = function() {
            qqolMod.applySettings();
            document.querySelector('.QQOLsettings').style.display='none';
        }

        document.querySelector('#contactme').onclick = function() {
            qqolMod.applySettings();
            document.querySelector('.chat-input ').value='/w FiammaTheGreat';
            document.querySelector('.QQOLsettings').style.display='none';
        }

        document.querySelector('#toSettings').onclick = function() {
            document.querySelector('.QQOLsettings').style.display='block';
        }

        for (const [key, value] of Object.entries(this.settings)) {
            if (key.startsWith("show_") && value) {
                document.querySelector('input[for=' + key + ']').checked = true;
            } else {
                document.querySelector('input[for=' + key + ']').value = value;
            }
        }
  }

    applySettings() {
        // Select all of the input elements, that are a descendent of the overall QQOL settings dialog, that have the "for" attribute and the "for" attribute is not empty.
        let dlgSettings = document.querySelectorAll('#QQOL_settings input[for]:not([for=""])');

        // Get the settings from the dialog and save them in the class instance.
        for (var i = 0; i < dlgSettings.length; i++) {
            if (dlgSettings[i].type == "checkbox") {
                this.settings[dlgSettings[i].getAttribute("for")] = dlgSettings[i].checked;
            } else {
                this.settings[dlgSettings[i].getAttribute("for")] = dlgSettings[i].value;
            }
        }

        // Save the (possibly new) settings to the local storage.
        this.saveData();

        // Now apply all of the settings (new or not).
        if (this.settings.show_itr) {
            document.querySelector('#QQOL_remaining_time_div').style.display = 'block';
        } else {
            document.querySelector('#QQOL_remaining_time_div').style.display = 'none';
        }

        if (this.settings.show_nl) {
            document.querySelector('#QQOL_time_to_levelup_div').style.display = 'block';
        } else {
            document.querySelector('#QQOL_time_to_levelup_div').style.display = 'none';
        }

        if (this.settings.show_ttqc) {
            document.querySelector('#QQOL_quests').style.display = 'block';
        } else {
            document.querySelector('#QQOL_quests').style.display = 'none';
        }

        if (this.settings.show_tttl) {
            document.querySelector('#QQOL_TTTL').style.display = 'block';
        } else {
            document.querySelector('#QQOL_TTTL').style.display = 'none';
        }

        if (this.settings.show_ttke) {
            document.querySelector('#QQOL_kingdomexploration_div').style.display = 'block';
        } else {
            document.querySelector('#QQOL_kingdomexploration_div').style.display = 'none';
        }
  }

    get settingsPageHtml() {
        return `
<div id='QQOL_settings' class='main'>
    <div class='centered'>
        <button id='exitSettings'>Close</button>
        <h1>Welcome to QQOL</h1>
        <p>Adjust plugin settings here</p>
    </div>
    <div class='block left'>
        <h2>Left menu</h2>
        <input for='show_itr'    class='QQOLCheck' type='checkbox'><span>Idle time remaining<span></br>
        <input for='show_nl'     class='QQOLCheck' type='checkbox'><span>Time to next level<span></br>
        <input for='show_ttqc'   class='QQOLCheck' type='checkbox'><span>Time to quest completion<span></br>
        <input for='show_tttl'   class='QQOLCheck' type='checkbox'><span>Time to target level<span></br>
        <input for='show_ttke'   class='QQOLCheck' type='checkbox'><span>Time to kingdom exploration end<span></br>
    </div>
    <div class='block center'>
        <span>Target level: </span><input for='target_level' type='number' placeholder='9001'></input>
    </div>
    <div class='block right'>
        <span>Made by <span class='QQOL-link-action' id='contactme'>FiammaTheGreat</span></br>
        <span>Send relics if ya want.</span>
    </div>
</div>
        `;
    }
}



//TY GREASEMONKEY
var QQOL = null;
console.log('countto25.queslar.qqol    Init load');
var QQOLSetupInterval = setInterval(QQOLGMSetup, 1000);

function QQOLGMSetup() {
    if (document.getElementById('profile-next-level') && QQOL === null) {
        console.log('countto25.queslar.qqol    Init OK');
        clearInterval(QQOLSetupInterval);
        console.log('countto25.queslar.qqol    retry timer: ' + QQOLSetupInterval);
        QQOL = new FTGMod();
    } else {
        console.log('countto25.queslar.qqol    Init failed. Will retry in one second.');
        console.log('countto25.queslar.qqol    Next level: ' + document.getElementById('profile-next-level'));
        console.log('countto25.queslar.qqol    QQOL: ' + QQOL);
    }
}
