class FTGMod {
 constructor() {
   let ver = '0.05';
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
   let QQOLholder = document.createElement('div');
   QQOLholder.id = 'QQOL_holder';
   document.getElementById('profile-next-level').parentNode.insertBefore(QQOLholder,document.getElementById('profile-next-level').nextSibling)
   let timetoleveluptooltip = document.createElement('div');
   timetoleveluptooltip.id = 'QQOL_time_to_levelup';
   let idletimeremainingtooltip = document.createElement('div');
   idletimeremainingtooltip.id='QQOL_remaining_time';
   document.getElementById('QQOL_holder').appendChild(timetoleveluptooltip);
   document.getElementById('QQOL_holder').appendChild(idletimeremainingtooltip);


   //FINISH
   this.HookOnAction(() => {modbody.Update()}, true);
   console.log('loaded Quality of Quality of Life mod '+this.ver+'. Have a nice day!');
 }
 HookOnAction(func, exec=false) {
   if (exec) func();
   this.onactionhooks.push(func);
 }

 Update() {
   this.TimeRemaining();
   this.TimeToLevelUp();
   this.TimeToCraft();
 }

 GetRemainingActions() {
   return parseInt(document.title.replace(/\D/g,''));
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

ActionsToTime(actions) {
   let minval = Math.floor(actions/10);
   let hourval = Math.floor(minval/60);
   let remMinutes = minval-hourval*60;
   return hourval+':'+(remMinutes<10?('0'+remMinutes):(remMinutes));
 }
}

var QQOL = new FTGMod();
