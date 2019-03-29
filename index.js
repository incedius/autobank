const path = require('path'),
	  fs = require('fs')

module.exports = function AutoBank(mod) {
  let enabled=false,
    currentTab,
    bankType,
    bankItems=[],
    invItems=[],
    _gameId,
    enableGuildBank=false,
    blacklist,
    fileopen=true,
    stopwrite,
    blacklisting=false,
    whitelisting=false

  try{
    blacklist = JSON.parse(fs.readFileSync(path.join(__dirname,'blacklist.json'), 'utf8'))
  }
  catch(e){
    blacklist = JSON.parse(fs.readFileSync(path.join(__dirname,'blacklist-default.json'), 'utf8'))
    save(blacklist,"blacklist.json")
  }
  
  mod.command.add(['autobank','ab'], {
    $none() {
      enabled=!enabled
      
      if(enabled){
        msg("enabled")
        mod.toServer('C_SHOW_INVEN',1, {
          unk: 1
        })
        
        
      } else{
        msg("disabled")
        reset()
      }
    },
    guild(){
      enableGuildBank = !enableGuildBank
      enableGuildBank?msg("Autobanking to Guild Bank ENABLED. Make sure you have the right permissions"):msg("Autobanking for Guild Bank DISABLED")
    },
    bl(){
      toggleBlacklist()
    },
    blacklist(){
      toggleBlacklist()
    },
    wl(){
      toggleWhitelist()
    },
    whitelist(){
      toggleWhitelist()
    }
  })

  mod.hook('C_PUT_WARE_ITEM', 2, event => {
    //if blacklisting and item not already in blacklist
    if (blacklisting){
      if (!blacklist.includes(event.dbid)){
        blacklist.push(event.dbid)
        msg('Black listing: ' +  event.dbid)
      }
      else{
        msg('Already blacklisted.')
      }
      
      return false
    }

    if(whitelisting){
      if(blacklist.includes(event.dbid)){
        blacklist.splice(blacklist.indexOf(event.dbid), 1)
        msg('Removed from blacklist item: ' + event.dbid)
      
      }
      else{
        msg('Item not in blacklist.')
      }
    }
  })

  mod.hook('S_CANCEL_CONTRACT', 1, event =>{
    if(blacklisting) toggleBlacklist()
    if(whitelisting) toggleWhitelist()

    if(!enabled) return
    //if(currentContract==event.id && enabled){
      msg("disabled")
      enabled=false
      reset()
    //}
  })
  
  mod.hook('S_INVEN', (mod.majorPatchVersion >= 80)?18:17, event => {
    if(!enabled) return;
    
    invItems = event.items
    _gameId = event.gameId
  })
  
  mod.hook('S_VIEW_WARE_EX', 1, event => {
    if(!enabled) return;
    
    bankType = event.type
    currentTab = event.offset
    bankItems = event.items
    
    if(bankItems.length>0 && invItems.length>0)
      bankit()
  })
  
  function bankit(){
    if (bankType==0){
      msg("Legacy Bank not Supported.")
      return
    }
    
    else if(bankType==3 && !enableGuildBank){
      msg("Autobanking for Guild Bank DISABLED")
      return
    }
    
    for(let item of bankItems){
      var toBankItems = invItems.filter((inInv) => inInv.id == item.id)
      for(let toBank of toBankItems){
        if(!blacklist.includes(toBank.id)){
          mod.toServer('C_PUT_WARE_ITEM',2, {
            gameId: _gameId,
            type: bankType,
            page: currentTab,
            money: 0,
            invenPos: toBank.slot,
            dbid: toBank.id,
            uid: toBank.dbid,
            amont: toBank.amount,
            bankPos: currentTab
          })
        }
      }
    }
  }
  
  function reset() {
    enabled=false
    currentTab=0
    bankType=0
    bankItems=[]
    invItems=[]
  }

  function save(data, filename){
    if(fileopen) {
			fileopen=false
			fs.writeFile(path.join(__dirname, filename), JSON.stringify(data,null,"\t"), err => {
				if(err){
          mod.command.message('Error Writing File, attempting to rewrite')
          console.log(err)
        }
				fileopen = true
			})
		}
		else {
			clearTimeout(stopwrite)			 //if file still being written
			stopwrite=setTimeout(save(__dirname, filename),2000)
			return
		}
  }

  function toggleBlacklist(){
    blacklisting = !blacklisting

    if(whitelisting && blacklisting) toggleWhitelist()
    
    msg(`Item Blacklisting ${blacklisting?'Enabled':'Disabled'}`)

    if(!blacklisting){
      save(blacklist,"blacklist.json")
    }
  }

  function toggleWhitelist(){
    whitelisting = !whitelisting

    if(whitelisting && blacklisting) toggleBlacklist()
    
    msg(`Item Whitelisting ${whitelisting?'Enabled':'Disabled'}`)

    if(!whitelisting){
      save(blacklist,"blacklist.json")
    }
  }
  
  function msg(event) { mod.command.message(event); }
}