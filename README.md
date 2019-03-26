# autobank

tera-proxy module to automagically bank stuff from inv if it already exists in the bank

# Setup

Copy/Merge file(s) in map folder to `node_modules\tera-data\map\`

**Note**
Only opcode for current NA(344300) and SEA(344305) provided. Use https://github.com/Owyn/alex-packet-id-finder to get the opcodes for other regions, `fpi C_PUT_WARE_ITEM`

# Usage

Use command `autobank` or `ab` to toggle ON/OFF. 
Open bank or click on bank tab to autobank.

`ab bl` to toggle black listing ON/OFF. Default OFF. 
With bank window open, right click on item in inventory to blacklist it. Item will not be banked while blacklisting.

`ab wl` to toggle white listing ON/OFF. Default OFF. 
With bank window open, right click on item in inventory to remove it from blacklist.

`ab guild` to toggle autobank for guild bank ON/OFF. Default OFF. 

# Changelog
1.1 - Added Blacklisting and Whitelisting.