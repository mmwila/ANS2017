const moment = require('moment');
const io = require('socket.io-client');
const socket = io.connect('C6-MiFi.:3000', { reconnect: true });  // replaced the ip address 


// Component  IDs (For test purposes)
//=================================
/*
  - System Commander : 40
  - Subsystem Commander : 32
  - Communicator : 35
  - Global Pose Sensor : 38
  - Local Pose Sensor : 41
  - Velocity state Sensor : 42,
  - Primitive Driver : 33
  - Reflexive Driver : 43
  - Global Vector Driver : 34
  - Local Vector Driver : 44
  - Global Waypoint Driver: 45
  - Local Waypoint Driver : 46
  - Global Path Segment Driver : 47
  - Local Path Segment Driver : 48
  - Visual Sensor : 37
  - Range Sensor : 50
  - World Model Vector Knowledge Store : 61
  - Mission Planner : 51
  - Mission Spooler : 36

*/

var me = {
    id: 33,
    name: 'Primitive Driver',
};
var systemTree = [me];

// Add a connect listener for the segment driver
//----------------------------------------------

socket.on('connect', () => {
    // display a message on the console
    console.log('\n\n => Connection to the G-Bat Network has been established!!\n\n');
    // cons ole.log(sensorIo);

    socket.on('register', (regData, identify) => {
        identify(me);
    });

    socket.on('registration', (regInfo) => {
        console.log(`\n => A ${regInfo.name} has connected to the G-Bat Network!`);
    });

    socket.on('deregistration', (regInfo) => {
        console.log(`\n => A ${regInfo.name} has disconnected from the G-Bat Network!`);
    });

    socket.on('systemUpdate', (update) => {

        systemTree = update;
        console.log('\n\n => Connected Nodes: ', JSON.stringify(systemTree, null, 4));

    });

    // Receive Global Pose : Message ID = 4402h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the Data received
    socket.on('4402h', (nodeInfo) => {  
        console.log('\n\n => Received  Global Pose Data... => ', JSON.stringify(nodeInfo, null, 4));
        // retrieve the payload and process it

        // format the acknowlegemet message
        var ackData= {};
        nodeInfo.messageID = '4400h';
        nodeInfo.data =ackData; // ideally update with data read from hardware
        nodeInfo.sequenceNo = 1;

    });

     // Receive acknowledgement : Message ID = 4400h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the Data received
    socket.on('4400h', (nodeInfo) => {  
        console.log('\n\n  ack <-: ', JSON.stringify(nodeInfo, null, 4));
        // retrieve the payload and process it

        // format the acknowlegemet message
        var ackData= {};
        nodeInfo.messageID = '4400h';
        nodeInfo.data =ackData; // ideally update with data read from hardware
        nodeInfo.sequenceNo = 1;

    });

   // Receive map data from Vector knowledge store : Message ID = 4400h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the Data received
    socket.on('4A23h', (nodeInfo) => {  
        console.log('\n\n => Received  Map data => ', JSON.stringify(nodeInfo, null, 4));
        // retrieve the payload and process it

        // format the acknowlegemet message
        var ackData= {};
        nodeInfo.messageID = '4400h';
        nodeInfo.data =ackData; // ideally update with data read from hardware
        nodeInfo.sequenceNo = 1;

    });



  
    // Hanling disconnection
    //----------------------
    socket.on('disconnect', () => {
        console.log('Connection to the G-Bat network has been terminated!');
    });



    console.log('\n\n**** Starting the JAUS  Tester ....... ****\n\n');
    setTimeout(() => {
        // initialising the message  to be sent
        var messageID = '0A20h';
        var data = {};
        var recipientID = 61;
        var sequence = 1;

        // Checking if recipient node is connected   
        var destNodeInfo = systemTree.filter((node) => {
            return node.id === recipientID;
        });

        console.log(' dest nodeInfo', destNodeInfo);
        if (destNodeInfo.length === 0) { // if not connected
            console.log('recipient node not connected to the G-Bat Network!');
        } else { // if connected
            // 1. Formatting the packet to be sent
            var nodeInfo = {
                messageID: messageID,
                sender: me,
                recipient: destNodeInfo[0],
                data: data,
                sequenceNo: sequence
            };
            console.log('\n\n -> nodeInfo => ', JSON.stringify(nodeInfo, null, 4));
            console.log(`\n\n -> Sending ${nodeInfo.messageID} command to ${nodeInfo.recipient.name}....`);
            socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
                if (ack.recipient === 'undefined') {
                    console.log('recipient node did not respond!');
                } else {

                    console.log('\n\n ack :->  ', JSON.stringify(ack, null, 4));
                }
            });
        }
    }, 100);

});
