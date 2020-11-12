const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const rangeOverlaps = require('range-overlaps');


const app = express();


app
.use(bodyParser.json())
.post("/createRoom",(request,response)=>{
    
    if(request.body.availableSeats==undefined||request.body.ameneties==undefined||request.body.perHourRate==undefined){response.status(400).json({status:"fail: invalid schema"});return;}
    if(typeof request.body.availableSeats!="number"||typeof request.body.ameneties!="string"||typeof request.body.perHourRate!="number"){response.status(400).json({status:"fail: invalid schema"});return;}
    fs.readFile("roomsData.json",(err,data)=>{
        roomData=JSON.parse(data)
 roomData.push({roomID:roomData.length,availableSeats : request.body.availableSeats,ameneties: request.body.ameneties, perHourRate:request.body.perHourRate})
    console.log(roomData)
    
        fs.writeFile("roomsData.json",JSON.stringify(roomData),(err)=>{response.json(roomData)})
    })

})

.post("/bookRoom",(request,response)=>{
    
    fs.readFile("bookingData.json",(err,data)=>{
        bookingData=JSON.parse(data)
        
        if(request.body.roomID==undefined||request.body.startTime==undefined||request.body.endTime==undefined||request.body.customerName==undefined||request.body.date==undefined){response.status(400).json({status:"fail: invalid schema"});return;}
        if(typeof request.body.roomID!="number"||typeof request.body.startTime!="number"||typeof request.body.endTime!="number"||typeof request.body.customerName!="string"){response.status(400).json({status:"fail: invalid schema"});return;}
 
        let startDateObj = new Date(request.body.date.split("-")[2],request.body.date.split("-")[1],request.body.date.split("-")[0],request.body.startTime/100,request.body.startTime%100)
        let endDateObj = new Date(request.body.date.split("-")[2],request.body.date.split("-")[1],request.body.date.split("-")[0],request.body.endTime/100,request.body.endTime%100)
        if(startDateObj=="Invalid Date"||endDateObj=="Invalid Date"){response.status(400).json({status:"fail: invalid date/time"});return;}

        for(let i=0;i<bookingData.length;i++)
        {
            if (bookingData[i].roomID==request.body.roomID && bookingData[i].date==request.body.date)
            {
            

                   if( rangeOverlaps({start: bookingData[i].startTime+1, end: bookingData[i].endTime-1}, {start: request.body.startTime+1, end: request.body.endTime-1})){response.status(403).json({status:"fail: booking collision"});return;}  

                    if(( bookingData[i].startTime == request.body.startTime ) && ( bookingData[i].endTime == request.body.endTime )){response.status(403).json({status:"fail: booking collision"});return;}                  
            }}
        



 bookingData.push({roomID:request.body.roomID,startTime : request.body.startTime,endTime: request.body.endTime, customerName:request.body.customerName,date:request.body.date})
    console.log(bookingData)
    
        fs.writeFile("bookingData.json",JSON.stringify(bookingData),(err)=>{response.json(bookingData)})
    })

})

.get("/bookingsByRooom",(request,response)=>{

    fs.readFile("bookingData.json",(err,data)=>{
        response.json(JSON.parse(data))
    })})

    .get("/bookingsByCustomer",(request,response)=>{

        fs.readFile("bookingData.json",(err,data)=>{
            let bookings = JSON.parse(data);
            let to_return =[];
            bookings =bookings.sort(((a,b)=>a.customerName-b.customerName));
            
            to_return.push({customerName:bookings[0].customerName,bookings:[bookings[0]]})
           // response.json(to_return);
            let index=0;
            for(let i=1;i<bookings.length;i++)
            {
              if(bookings[i-1].customerName==bookings[i].customerName){to_return[index].bookings.push(bookings[i])}
                else{index++;
                    to_return.push({customerName:bookings[i].customerName,bookings:[bookings[i]]})
                }
            }

            response.json(to_return);
        })})


.get("/files/:folder",(request,response)=>{

    fs.readdir(request.params.folder,(error,data)=>{

       

        response.json({status:"success",folderName:request.params.folder,files:files})
    })



})


app.listen(process.env.PORT || 5000)