//// # Outgoing listeners
//// Outgoing listeners are fired when messages are sent
//
//(function (node) {
//	
//    var GameMsg = node.GameMsg,
//        GameState = node.GameState;
//    
//    var action = node.action,
//        target = node.target;
//	
//    var say = action.SAY + '.',
//        set = action.SET + '.',
//        get = action.GET + '.',
//        OUT  = node.OUT;
//	
///**
// * ## out.say.STAGE
// * 
// * Sends out a STAGE message to the specified recipient
// * 
// * TODO: check with the server 
// * The message is for informative purpose
// * 
// */
//node.events.ng.on( OUT + say + 'STAGE', function (stage, to) {
//    node.socket.sendSTAGE(action.SAY, stage, to);
//});	
//	
///**
// * ## out.say.TXT
// * 
// * Sends out a TXT message to the specified recipient
// */
//node.events.ng.on( OUT + say + 'TXT', function (text, to) {
//    node.socket.sendTXT(text,to);
//});
//
///**
// * ## out.say.DATA
// * 
// * Sends out a DATA message to the specified recipient
// */
//node.events.ng.on( OUT + say + 'DATA', function (data, to, key) {
//    node.socket.sendDATA(action.SAY, data, to, key);
//});
//
///**
// * ## out.set.STAGE
// * 
// * Sends out a STAGE message to the specified recipient
// * 
// * TODO: check with the server 
// * The receiver will update its representation of the stage
// * of the sender
// */
//node.events.ng.on( OUT + set + 'STAGE', function (stage, to) {
//    node.socket.sendSTAGE(action.SET, stage, to);
//});
//
///**
// * ## out.set.DATA
// * 
// * Sends out a DATA message to the specified recipient
// * 
// * The sent data will be stored in the memory of the recipient
// * 
// * @see node.GameDB
// */
//node.events.ng.on( OUT + set + 'DATA', function (data, to, key) {
//    node.socket.sendDATA(action.SET, data, to, key);
//});
//
///**
// * ## out.get.DATA
// * 
// * Issues a DATA request
// * 
// * Experimental. Undocumented (for now)
// */
//node.events.ng.on( OUT + get + 'DATA', function (data, to, key) {
//    node.socket.sendDATA(action.GET, data, to, data);
//});
//	
//node.log('outgoing listeners added');
//
//})('undefined' !== typeof node ? node : module.parent.exports); 
//// <!-- ends outgoing listener -->
