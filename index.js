module.exports = function AutoBank(mod) {
  let enabled=false,
    currentTab,
    bankType,
    bankItems=[],
    invItems=[],
    _gameId,
    currentContract,
    enableGuildBank=false
  
  mod.command.add(['autobank','ab'], {
    $none() {
      enabled=!enabled
      enabled?msg("enabled"):msg("disabled")
      
      if(!enabled){
        reset()
      }
    },
    guild(){
      enableGuildBank = !enableGuildBank
      enableGuildBank?msg("Autobanking to Guild Bank ON. Make sure you have the right permissions"):msg("Autobanking for Guild Bank OFF")
    }
  })
  
  mod.hook('S_REQUEST_CONTRACT', 1, event =>{
    currentContract=event.id
  })
  
  mod.hook('S_CANCEL_CONTRACT', 1, event =>{
    if(currentContract==event.id && enabled){
      msg("disabled")
      enabled=false
      reset()
    }
  })
  
  mod.hook('S_INVEN', 17, event => {
    if(!enabled) return;
    
    invItems = event.items
    _gameId = event.gameId
  })
  
  mod.hook('S_VIEW_WARE_EX', 1, event => {
    if(!enabled) return;
    
    bankType = event.type
    currentTab = event.offset
    bankItems = event.items
    
    bankit()
  })
  
  function bankit(){
    if (bankType==0){
      msg("Legacy Bank not Supported.")
      return
    }
    
    else if(bankType==3 && !enableGuildBank){
      msg("Autobanking for Guild Bank OFF")
      return
    }
    
    for(let item of bankItems){
      var toBankItems = invItems.filter((inInv) => inInv.id == item.id)
      for(let toBank of toBankItems){
        msg(`Banking item: ${item.id}`);
        mod.toServer('C_PUT_WARE_ITEM',3, {
          gameId: _gameId,
          type: bankType,
          page: currentTab,
          money: 0,
          invenPos: toBank.slot,
          itemid: toBank.itemid,
          dbid: toBank.dbid,
          amont: toBank.amount,
          bankPos: currentTab
        })
      }
    }
  }
  
  function reset() {
    enabled=false
    currentTab=0
    bankType=0
    bankItems=[]
    invItems=[]
    currentContract=0
    enableGuildBank=false
  }
  
  function msg(event) { mod.command.message(event); }
}