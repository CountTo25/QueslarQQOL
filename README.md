# QueslarQQOL
Shitty little plugin. Converts stuff from actions to time. Maybe will do something better later.

Donate some relics to FiammaTheGreat if you like it i guess

# Whats this?
Adds more info to left sidebar and enchanting\crafting bar, saying how much time is left for idle time, crafting progress or next level. In munites and hours, not actions! Yay, readable stuff

Also, allows you to search for service providers on market

# Get it
Create the bookmark containing following code, save it, click it when you're on Queslar tab
```
javascript:(function (){document.getElementsByTagName('head')[0].appendChild(document.createElement('script')).src='https://raw.githubusercontent.com/CountTo25/QueslarQQOL/master/main.js';}());
```
OR

Use greasemonkey: https://greasyfork.org/scripts/411266-qqol
# Hooks
They dont work if you run on greasemonkey :( I'll figure smth out later

OnAction - executes each time an action happens
```
QQOL.HookOnAction(() => {console.log('wow')})
```

# TODO/Whats next
No idea
