class FTGMod {
 constructor() {
   let el
   this.update = setInterval(this.Update.bind(this),1000);
   this.Update();
   console.log('loaded Quality of Quality of Life mod v0.01. Have a nice day!');

 }

 Update() {
   this.TimeRemaining();
 }

 CreateTimerWindow() {
   let timerelement = document.createElement('span');
   timerelement.id = 'FTG_idle_timer';
   timerelement.classList.add('h5');
   timerelement.setAttribute('style','margin-top: .25rem !important;');
   document.querySelector('.h5.mt-1').parentNode.insertBefore(timerelement,document.querySelector('.h5.mt-1'))
 }

 TimeRemaining() {
   if (!document.getElementById('FTG_idle_timer')) {
     this.CreateTimerWindow();
   }
   let txt = document.querySelector('.h5.mt-1').innerHTML;
   let turnval = parseInt(txt.split(' / ')[0]);
   let minval = Math.floor(turnval/10);
   let hourval = Math.floor(minval/60);
   let remMinutes = minval-hourval*60;

   txt = hourval+':'+(remMinutes<10?('0'+remMinutes):(remMinutes));
   document.getElementById('FTG_idle_timer').innerHTML=('Idle Time Remaining: ' + txt);
   console.log(txt);
 }
}

var QQOL = new FTGMod();
