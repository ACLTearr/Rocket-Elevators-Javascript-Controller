let elevatorId = 1
let floorRequestButtonId = 1
let callButtonId = 1

//Defining the column class
class Column {
    constructor (id, status, amountOfElevators, amountOfFloors) {
        this.ID = id
        this.status = status
        this.amountOfFloors = amountOfFloors
        this.amountOfElevators = amountOfElevators
        this.elevatorsList = []
        this.callButtonsList = []

        this.makeElevator(amountOfFloors, amountOfElevators) //Calling the function to create elevators
        this.makeCallButton(amountOfFloors) //Calling the function to create the call buttons
    }

    //Function to create elevators
    makeElevator(amountOfFloors, amountOfElevators) {
        for (let i = 0; i < amountOfElevators; i++) {
            let elevator = new Elevator(elevatorId, 'idle', amountOfFloors, 1);
            this.elevatorsList.push(elevator);
            elevatorId++;
        }
    }

    //Function to create call buttons
    makeCallButton(amountOfFloors) {
        let callButtonCounter = 1;
        for (let i = 0; i < amountOfFloors; i++) {
            //If not last floor
            if (callButtonCounter < amountOfFloors) {
                let callButton = new CallButton(callButtonId, 'off', callButtonCounter, 'up')
                this.callButtonsList.push(callButton);
                callButtonId++;
            }
            //If not first floor
            if (callButtonCounter > 1) {
                let callButton = new CallButton(callButtonId, 'off', callButtonCounter, 'down')
                this.callButtonsList.push(callButton);
                callButtonId++;
            }
            callButtonCounter++;
        }
    }

    //User calls an elevator
    requestElevator(floor, direction) {
        let elevator = this.findBestElevator(floor, direction);
        elevator.floorRequestList.push(floor);
        elevator.sortFloorList();
        elevator.moveElevator();
        elevator.doorController();
        return elevator;
    }

    //Find best Elevator
    findBestElevator(requestedFloor, requestedDirection) {
        let bestElevatorInfo = {
            bestScore: 5,
            bestElevator: null,
            referenceGap: 1000000
        }
        for (let i = 0; i < this.elevatorsList; i++) {
            //Elevator is at floor going in correct direction
            if (requestedFloor == elevator.currentFloor && elevator.status == notMoving && requestedDirection == elevator.direction) {
                bestElevatorInfo = this.checkBestElevator(1, elevator, bestElevatorInfo, requestedFloor)
            //Elevator is lower than user and moving through them to destination
            } else if (requestedFloor > elevator.currentFloor && elevator.direction == 'up' && requestedDirection == elevator.direction) {
                bestElevatorInfo = this.checkBestElevator(2, elevator, bestElevatorInfo, requestedFloor)
            //Elevator is higher than user and moving through them to destination
            } else if (requestedFloor < elevator.currentFloor && elevator.direction == 'down' && requestedDirection == elevator.direction) {
                bestElevatorInfo = this.checkBestElevator(2, elevator, bestElevatorInfo, requestedFloor)
            //Elevator is idle
            } else if (elevator.status == idle) {
                bestElevatorInfo = this.checkBestElevator(3, elevator, bestElevatorInfo, requestedFloor)
            //Elevator is last resort
            } else {
                bestElevatorInfo = this.checkBestElevator(4, elevator, bestElevatorInfo, requestedFloor)
            }
        }
        return bestElevatorInfo.bestElevator
    }

    //Comparing elevator to previous best
    checkBestElevator(scoreToCheck, newElevator, bestScore, referenceGap, bestElevator, floor) {
        //If elevators situation is more favourable, set to best elevator
        if (scoreTocheck < bestElevatorInfo.bestScore) {
            bestElevatorInfo.bestScore = scoreToCheck
            bestElevatorInfo.bestelevator = newElevator
            bestElevatorInfo.referenceGap = Math.abs(newElevator.currentFloor - floor)
        //If elevators are in a similar situation, set the closest one to the best elevator
        } else if (bestElevatorInfo.bestScore == scoreToCheck) {
            let gap = Math.abs(newElevator.currentFloor - floor)
            if (bestElevatorInfo.referenceGap > gap) {
                bestElevatorInfo.bestScore = scoreToCheck
                bestElevatorInfo.bestElevator = newElevator
                bestElevatorInfo.referenceGap = gap
            }
        }
        return bestElevatorInfo
    }

} //End Column





//Defining the elevator class
class Elevator {
    constructor (id, status, amountOfFloors, currentFloor) {
        this.ID = id
        this.status = status
        this.amountOfFloors = amountOfFloors
        this.direction;
        this.currentFloor = currentFloor
        this.door = new Door(id, 'closed')
        this.floorRequestButtonsList = []
        this.floorRequestList = []

        this.makeFloorRequestButton(amountOfFloors) //Calling the function to create floor request buttons
    }

    //Function to create floor request buttons
    makeFloorRequestButton(amountOfFloors) {
        let floorRequestButtonCounter = 1
        for (let i = 0; i < amountOfFloors; i++) {
            let floorRequestButton = new FloorRequestButton(floorRequestButtonId, 'off', floorRequestButtonCounter)
            this.floorRequestButtonsList.push(floorRequestButton);
            floorRequestButtonCounter++;
            floorRequestButtonId++;
        }
    }

    //User requesting floor inside elevator
    requestFloor(floor) {
        this.floorRequestList.push(floor);
        this.sortFloorList();
        this.moveElevator();
        elevator.doorController();
    }

    //Moving elevator
    moveElevator() {
        while (this.floorRequestList != 0) {
            let destination = this.floorRequestList[0]
            this.status = 'moving'
            if (this.currentFloor < destination) {
                this.direction = 'up'
                while (this.currentFloor < destination) {
                    this.currentfloor++
                }
            } else if (this.currentFloor > destination) {
                this.direction = 'down'
                while (this.currentFloor > destination) {
                    this.currentFloor--
                }
            }
            this.status = 'notMoving'
            this.floorRequestList.shift();
        }
    }

    //Sorting floor request list
    sortFloorList() {
        if (this.direction == 'up') {
            this.floorRequestList.sort(function(a, b) {return a - b});
        } else if (this.direction == 'down') {
            this.floorRequestList.sort(function(a, b) {return b - a});
        }
    }

    //Door operation controller
    doorController() {
        this.door = 'opened'
        //wait 5 seconds
        if (!this.overweight) {
            this.door.status = 'closing'
            if (!this.door.obstruction) {
                this.door.status = 'closed'
            } else {
                //Wait for obstruction to clear
                this.door.obstruction = false
                this.doorController()
            }
        } else {
            while (this.overweight) {
                //Ring alarm and wait until not overweight
                this.overweight = false
            }
            this.doorController()
        }
    }

} //End Elevator

//Defining call button class
class CallButton {
    constructor (id, status, floor, direction) {
        this.ID = id
        this.status = status
        this.floor = floor
        this.direction = direction
    }

} //End Call Button

//Defining floor request button class
class FloorRequestButton {
    constructor (id, status, floor) {
        this.ID = id
        this.status = status
        this.floor = floor
    }

} //End Floor Request Button

//Defining door class
class Door {
    constructor (id, status) {
        this.ID = id
        this.status = status
    }

} //End Door

let column = new Column(1, 'online', 2, 10);
console.log(column);

/*
TESTING SCENARIOS 
let column = new Column(1, 'online', 2, 10);

column.elevatorsList[0].currentFloor = x
column.elevatorsList[1].currentFloor = y

let elevator = column.requestElevator(z, [direction])
elevator.requestFloor(a)
*/