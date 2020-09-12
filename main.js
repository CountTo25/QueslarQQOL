class FTGMod {
 constructor() {
   let timetoleveluptooltip = document.createElement('div');
   timetoleveluptooltip.id = 'FTG_time_to_levelup';
   document.getElementById('profile-next-level').parentNode.insertBefore(timetoleveluptooltip,document.getElementById('profile-next-level').nextSibling)

   this.update = setInterval(this.Update.bind(this),1000);
   this.Update();
   console.log('loaded Quality of Quality of Life mod v0.01. Have a nice day!');



 }

 Update() {
   this.TimeRemaining();
   this.TimeToLevelUp();
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
   if (!document.getElementById('FTG_idle_timer')) {
     this.CreateTimerWindow();
   }
   if (document.querySelector('.h5.mt-1')) {
     let txt = document.querySelector('.h5.mt-1').innerHTML;
     let actionVal = parseInt(txt.split(' / ')[0]);
     txt = this.ActionsToTime(actionVal);
     document.getElementById('FTG_idle_timer').innerHTML=('Idle Time Remaining: ' + txt);
  }


   console.log(txt);
 }

 TimeToLevelUp() {
   let txt = document.getElementById('profile-next-level').innerHTML;
   let actionVal = parseInt(txt.replace(/\D/g,''));
   txt='('+this.ActionsToTime(actionVal)+')';
   document.getElementById('FTG_time_to_levelup').innerHTML = txt;

 }

ActionsToTime(actions) {
   let minval = Math.floor(actions/10);
   let hourval = Math.floor(minval/60);
   let remMinutes = minval-hourval*60;
   return hourval+':'+(remMinutes<10?('0'+remMinutes):(remMinutes));
 }
}

var QQOL = new FTGMod();
