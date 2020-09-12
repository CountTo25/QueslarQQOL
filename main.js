class FTGMod {
 constructor() {
   let ver = '0.06';
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

   //I SUCK AT JS
   document.onclick = function(){modbody.Update()} //im retarded, look up hooks later
                                                   //.clickable onclick?

   //NEW DOM
   var csselem = document.createElement("link");
   csselem.setAttribute("rel", "stylesheet");
   csselem.setAttribute("type", "text/css");
   csselem.setAttribute("href", "https://cdn.jsdelivr.net/gh/countto25/queslarQQOL/cssfix.css");
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

   //FINISH
   this.HookOnAction(() => {modbody.Update()}, true);
   console.log('loaded Quality of Quality of Life mod v'+ver+'. Have a nice day!');
 }
 HookOnAction(func, exec=false) {
   if (exec) func();
   this.onactionhooks.push(func);
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
   let txt ='Idle time remaining: '+this.ActionsToTime(actionsRemaining);
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
     document.getElementById('FTG_time_to_craft').innerHTML = '('+this.ActionsToTime(actionVal)+' remaining)';
   }
 }

 TimeToLevelUp() {
   let txt = document.getElementById('profile-next-level').innerHTML;
   let actionVal = parseInt(txt.replace(/\D/g,''));
   txt='Time to next level: '+this.ActionsToTime(actionVal);
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

   console.log('findprovider!');
   let sTerm = document.getElementById('QQOL_service_search').value.toLowerCase();
   console.log('sTerm');
   let users = document.querySelectorAll('td.cdk-column-username.mat-column-username > div');
   console.log(users.length+'l');
   for (let i=0; i<users.length; i++) {
     if (users[i].innerHTML.toLowerCase().includes(sTerm)) {
       console.log('')
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
   let remMinutes = minval-hourval*60;
   return hourval+':'+(remMinutes<10?('0'+remMinutes):(remMinutes));
 }
}

var QQOL = new FTGMod();
