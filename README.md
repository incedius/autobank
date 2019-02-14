# autobank

tera-proxy module to automagically bank stuff from inv if it already exists in the bank

# Setup

Copy file(s) in protocol folder to the `node_modules\tera-data\protocol`
Copy/Merge file(s) in map folder to `node_modules\tera-data\map\`

**Note**
Only opcode for current NA patch(344300) provided. Use https://github.com/Owyn/alex-packet-id-finder to get the opcodes for other regions, `fpi C_PUT_WARE_ITEM`

# Usage

Use command `autobank` or `ab` to toggle ON/OFF.

`ab guild` to toggle autobank for guild bank ON/OFF. Default OFF