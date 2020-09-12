# QueslarQQOL
Shitty little plugin. Converts stuff from actions to time. Maybe will do something better later

# Get it
Create the bookmark containing following code, save it, click it when you're on Queslar tab
```
javascript:(function (){document.getElementsByTagName('head')[0].appendChild(document.createElement('script')).src='https://raw.githubusercontent.com/CountTo25/QueslarQQOL/master/main.js';}());
```
OR

Use greasemonkey or something to load it
# Hooks
OnAction - executes each time an action happens
```
QQOL.HookOnAction(() => {console.log('wow')})
```

# TODO/Whats next
Find service provider by name
