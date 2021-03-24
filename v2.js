////v2
////full-on refactoring based on my newfound experience with JS
// ==UserScript==
// @name         Queslar Data
// @namespace    http://tampermonkey.net/
// @version      1.00
// @description  Quality of Quality of Life!
// @include *queslar.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant        unsafeWindow
// ==/UserScript==


class _QDUINode {
   constructor(elem, tag) {
      this.element = elem;
      this.tag = tag;
   }
}

class _QDtools {
   constructor() {
      //stuff to compile data from angular to more readable, expanded and stuff
      //just for structure purposes, no reason to declare stuff tbh, but to keep
      //it readable so whoever explores it can read and modify stuff easily
      this.compiled = {
         pets: {
            foodPerAction: {
               meat: 0,
               iron: 0,
               wood: 0,
               stone: 0,
            }
         }
      };
   }

   updateData() {
      this.compiled.pets.foodPerAction = this.howMuchPetsAreEating();
   }

   get data () {
      let rootElement = getAllAngularRootElements()[0].children[1]["__ngContext__"][30]
      return rootElement.playerGeneralService
   }

   howMuchPetsAreEating() {
      let pets = this.data.playerPetsService.activePetData;
      let petConsumption = {
         meat: 0,
         iron: 0,
         wood: 0,
         stone: 0,
      };
      for (let pet in pets) {
         const formula = (x) => {
	           let base = 0;
              let result = 1;
              while (base < x) {
                 result+=2*~~(base+5)/5+base>50?5:0;
  	              base++;
              }
	            return result
            }
         petConsumption[pets[pet].active_food]+=formula(pets[pet].efficiency_tier);
      }
      return petConsumption;
   }



}

class _Mod {

    constructor() {
        this.version = '1.00';
        this.actionObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
               this.onAction()
          }.bind(this));
       }.bind(this));
         this.actionObserver.observe(
           document.querySelector('head > title'),
           {subtree: true, characterData: true, childList: true }
         );
         this.dataTools = new _QDtools();

         this.onactionhooks = []
         this.onactionhooks.push(function() {this.dataTools.updateData()}.bind(this))
         this.onactionhooks.push(function() {console.log(this.dataTools.compiled)}.bind(this))
         this.UINodes = [];

         this.initOrder();
    }



    getElement(selector, all = false) {
      console.log(selector);
         let todo = all
            ? (...args) => document.querySelectorAll(...args)
            : (...args) => document.querySelector(...args)

         console.log(todo(selector));
         let toReturn = todo(selector)
         if (toReturn.length<0) {
            throw new error('Unable to get anything by selector "' + selector + '"')
         }
         return todo(selector);
    }

    applyCss() {
        var csselem = document.createElement("link")
        csselem.setAttribute("rel", "stylesheet")
        csselem.setAttribute("type", "text/css")
        csselem.setAttribute("href", "https://countto25.github.io/QueslarQQOL/cssfix.css")
        document.getElementsByTagName("head")[0].appendChild(csselem)
    }

    initOrder() {
        this.applyCss()
        this.UINodes.push = new _QDUINode(this.createNewUIElement(
           null,
           null,
           '#profile-next-level',
           null,
           'Queslar Data v'+this.version,
           true
        ), 'header');
    }

    createNewUIElement(id = null, classString = null, insertBefore = null, baseline = null, innerHTML = null, display = true) {
        let elem = document.createElement(baseline ?? 'div');
        elem.id = id ?? null
        if (null !== innerHTML) {
            elem.innerHTML = innerHTML
        }
        if (!display) {
            elem.style.display = 'none'
        }
        if (null !== insertBefore) {
            this.getElement(insertBefore).parentNode.insertBefore(elem,this.getElement(insertBefore).nextSibling)
        }

        return elem
    }

    hookOnAction(func, exec=false) {
      if (exec) func();
      this.onactionhooks.push(func)
    }

    onAction() {
     for (let i=0; i<this.onactionhooks.length; i++) {
       this.onactionhooks[i]()
     }
   }


}

const qdata = new _Mod();
