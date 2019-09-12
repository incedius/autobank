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

  if(mod.majorPatchVersion >= 85){
    mod.game.initialize
  }
  
  mod.command.add(['autobank','ab'], {
    $none() {
      enabled=!enabled
      
      if(enabled){
        msg("enabled")

        if(mod.majorPatchVersion >= 85){
          invItems = mod.game.inventory.bagItems
        } else{
          mod.toServer('C_SHOW_INVEN',1, {
            unk: 1
          })
        }
        
        
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

  mod.hook('C_PUT_WARE_ITEM', (mod.majorPatchVersion >= 85)?3:2, event => {
    //if blacklisting and item not already in blacklist
    if (blacklisting){
      if ( mod.majorPatchVersion <85 && !blacklist.includes(event.dbid) )
      {
        blacklist.push(event.dbid)
        msg('Black listing: ' +  event.dbid)
      }
      else if( mod.majorPatchVersion >=85 && !blacklist.includes(event.id) )
      {
        blacklist.push(event.id)
        msg('Black listing: ' +  event.id)
      }
      else{
        msg('Already blacklisted.')
      }
      
      return false
    }

    if(whitelisting){
      if (mod.majorPatchVersion <85 && blacklist.includes(event.dbid)){
        blacklist.splice(blacklist.indexOf(event.dbid), 1)
        msg('Removed from blacklist item: ' + event.dbid)
      
      } else if (mod.majorPatchVersion >=85 && blacklist.includes(event.id)){
        blacklist.splice(blacklist.indexOf(event.id), 1)
        msg('Removed from blacklist item: ' + event.id)
      
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
  
  if(mod.majorPatchVersion < 85){
    mod.hook('S_INVEN', (mod.majorPatchVersion >= 80)?18:17, event => {
      if(!enabled) return;
      
      invItems = event.items
      _gameId = event.gameId
    })
  }
  
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

      if(mod.majorPatchVersion < 85){
        var toBankItems = invItems.filter((inInv) => inInv.id == item.id)
      } else{
        var toBankItems = mod.game.inventory.findAllInBagOrPockets(item.id)
      }

      for(let toBank of toBankItems){
        if(!blacklist.includes(toBank.id)){
          if(mod.majorPatchVersion < 85){
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
          } else{
            mod.toServer('C_PUT_WARE_ITEM',3, {
              gameId: mod.game.me.gameId,
              type: bankType,
              page: currentTab,
              money: 0,
              pocket: 0,
              invenPos: toBank.slot,
              id: toBank.id,
              dbid: toBank.dbid,
              amount: toBank.amount,
              bankPos: currentTab
            })
          }
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