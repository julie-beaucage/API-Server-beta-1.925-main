/////////////////////////////////////////////////////////////////////
// This module define global console colors values and the log
// function ment to display text messages into the console
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

global.Reset = "\x1b[0m"
global.Bright = "\x1b[1m"
global.Dim = "\x1b[2m"
global.Underscore = "\x1b[4m"
global.Blink = "\x1b[5m"
global.Reverse = "\x1b[7m"
global.Hidden = "\x1b[8m"

global.FgBlack = "\x1b[30m"
global.FgRed = "\x1b[31m"
global.FgGreen = "\x1b[32m"
global.FgYellow = "\x1b[33m"
global.FgOrange = "\x1b[38;5;208m" 
global.FgBlue = "\x1b[34m"
global.FgMagenta = "\x1b[35m"
global.FgCyan = "\x1b[36m"
global.FgWhite = "\x1b[37m"

global.BgBlack = "\x1b[40m"
global.BgRed = "\x1b[41m"
global.BgGreen = "\x1b[42m"
global.BgYellow = "\x1b[43m"
global.BgBlue = "\x1b[44m"
global.BgMagenta = "\x1b[45m"
global.BgCyan = "\x1b[46m"
global.BgWhite = "\x1b[47m"

export const log = (...args) => {
    console.log(...args);
}
