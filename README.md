# QueslarQQOL
Shitty little plugin. Converts stuff from actions to time. Maybe will do something better later

# Get it
Create the bookmark containing following code:
```
javascript:(function (){document.getElementsByTagName('head')[0].appendChild(document.createElement('script')).src='https://gitcdn.link/repo/CountTo25/QueslarQQOL/master/main.js';}());
```

Click on it while in game

# Hooks
OnAction - executes each time an action happens
```
QQOL.HookOnAction(() => {console.log('wow')})
```

# TODO/Whats next
Find service provider by name
