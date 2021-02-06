//Defining the column class
class Column {
    constructor (id, status, amountOfElevators, amountOfFloors) {
        this.ID = id
        this.status = status
        this.amountOfFloors = amountOfFloors
        this.amountOfElevators = amountOfElevators
        this.elevatorsList = []
        this.callButtonsList = []

        this.makeElevator(amountOfFloors, amountOfElevators); //Calling the function to create elevators
        this.makeCallButton(amountOfFloors); //Calling the function to create the call buttons
    }

    //Method to create elevators
    makeElevator(amountOfFloors, amountOfElevators) {
        let elevatorID = 1
        for (let i = 0; i < amountOfElevators; i++) {
            let elevator = new Elevator(elevatorID, 'idle', amountOfFloors, 1);
            this.elevatorsList.push(elevator);
            elevatorID++
        }
    }

    //Method to create call buttons
    makeCallButton(amountOfFloors) {
        let callButtonId = 1;
        let callButtonCounter = 1;
        for (let i = 0; i < amountOfFloors; i++) {
            //If not last floor
            if (callButtonCounter < amountOfFloors) {
                let callButton = new CallButton(callButtonId, 'off', callButtonCounter, 'up');
                this.callButtonsList.push(callButton);
                callButtonId++;
            }
            //If not first floor
            if (callButtonCounter > 1) {
                let callButton = new CallButton(callButtonId, 'off', callButtonCounter, 'down');
                this.callButtonsList.push(callButton);
                callButtonId++;
            }
            callButtonCounter++;
        }
    }

    //User calls an elevator
    requestElevator(floor, direction) {
        console.log('A request for an elevator is made from floor ' + floor + ', going ' + direction + '.');
        let elevator = this.findBestElevator(floor, direction);
        console.log('Elevator ' + elevator.ID + ' is the best elevator, so it is sent.');
        elevator.floorRequestList.push(floor);
        elevator.sortFloorList();
        console.log('Elevator is moving.');
        elevator.moveElevator();
        console.log('Elevator is ' + elevator.status + '.');
        elevator.doorController();
        return elevator
    }

    //Find best Elevator
    findBestElevator(floor, direction) {
        let requestedFloor = floor;
        let requestedDirection = direction;
        let bestElevatorInfo = {
            bestElevator: null,
            bestScore: 5,
            referenceGap: 1000000
        }

        this.elevatorsList.forEach(elevator => {
            //Elevator is at floor going in correct direction
            if (requestedFloor == elevator.currentFloor && elevator.status == 'stopped' && requestedDirection == elevator.direction) {
                bestElevatorInfo = this.checkBestElevator(1, elevator, bestElevatorInfo, requestedFloor);
            //Elevator is lower than user and moving through them to destination
            } else if (requestedFloor > elevator.currentFloor && elevator.direction == 'up' && requestedDirection == elevator.direction) {
                bestElevatorInfo = this.checkBestElevator(2, elevator, bestElevatorInfo, requestedFloor);
            //Elevator is higher than user and moving through them to destination
            } else if (requestedFloor < elevator.currentFloor && elevator.direction == 'down' && requestedDirection == elevator.direction) {
                bestElevatorInfo = this.checkBestElevator(2, elevator, bestElevatorInfo, requestedFloor);
            //Elevator is idle
            } else if (elevator.status == 'idle') {
                bestElevatorInfo = this.checkBestElevator(3, elevator, bestElevatorInfo, requestedFloor);
            //Elevator is last resort
            } else {
                bestElevatorInfo = this.checkBestElevator(4, elevator, bestElevatorInfo, requestedFloor);
            }
        });
        return bestElevatorInfo.bestElevator
    }

    //Comparing elevator to previous best
    checkBestElevator(scoreToCheck, newElevator, bestElevatorInfo, floor) {
        //If elevators situation is more favourable, set to best elevator
        if (scoreToCheck < bestElevatorInfo.bestScore) {
            bestElevatorInfo.bestScore = scoreToCheck
            bestElevatorInfo.bestElevator = newElevator
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
        this.currentFloor = currentFloor
        this.direction;
        this.door = new Door(id, 'closed')
        this.overweight = false
        this.floorRequestButtonsList = []
        this.floorRequestList = []

        this.makeFloorRequestButton(amountOfFloors); //Calling the function to create floor request buttons
    }

    //Method to create floor request buttons
    makeFloorRequestButton(amountOfFloors) {
        let floorRequestButtonCounterId = 1;
        for (let i = 0; i < amountOfFloors; i++) {
            let floorRequestButton = new FloorRequestButton(floorRequestButtonCounterId, 'off', floorRequestButtonCounterId);
            this.floorRequestButtonsList.push(floorRequestButton);
            floorRequestButtonCounterId++;
        }
    }

    //User requesting floor inside elevator
    requestFloor(floor) {
        console.log('The elevator is requested to move to floor ' + floor + '.');
        this.floorRequestList.push(floor);
        this.sortFloorList();
        console.log('Elevator is moving.');
        this.moveElevator();
        console.log('Elevator is ' + this.status + '.');
        this.doorController();
        if (this.floorRequestList.length = []) {
            this.direction = null
            this.status = 'idle'
       }
        console.log('Elevator is ' + this.status + '.');
    }

    //Moving elevator
    moveElevator() {
        while (this.floorRequestList.length != []) {
            let destination = this.floorRequestList[0];
            this.status = 'moving'
            if (this.currentFloor < destination) {
                this.direction = 'up'
                while (this.currentFloor < destination) {
                    this.currentFloor++
                    console.log('Elevator is at floor: ' + this.currentFloor);
                }
            } else if (this.currentFloor > destination) {
                this.direction = 'down'
                while (this.currentFloor > destination) {
                    this.currentFloor--      
                    console.log('Elevator is at floor: ' + this.currentFloor);
                }
            }
            this.status = 'stopped'
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
        console.log('Elevator doors are ' + this.door + '.');
        console.log('Waiting for occupant(s) to transition.');
        //wait 5 seconds
        if (!this.overweight) {
            this.door = 'closing'
            if (!this.door.obstruction) {
                this.door = 'closed'
                console.log('Elevator doors are ' + this.door + '.');
            } else {
                //Wait for obstruction to clear
                this.door.obstruction = false
                this.doorController();
            }
        } else {
            while (this.overweight) {
                //Ring alarm and wait until not overweight
                this.overweight = false
            }
            this.doorController();
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
        this.overweight = false
    }

} //End Door

//Defining scenario 1
function scenario1() {
    //In scenario 1, an individual is on floor 3, going up to floor 7.
    //Elevator 1 is at floor 2, and Elevator 2 is at floor 6.
    //Elevator 1 will be sent.
    let column = new Column(1, 'online', 2, 10)

    column.elevatorsList[0].currentFloor = 2
    column.elevatorsList[1].currentFloor = 6

    let elevator = column.requestElevator(3, 'up')
    elevator.requestFloor(7)
}

//Defining scenario 2
function scenario2() {
    //In scenario 2, an individual is on floor 1, going up to floor 6.
    //Elevator 1 is at floor 10, and Elevator 2 is at floor 3.
    //Elevator 2 will be sent.
    //An individial is on floor 3, going up to floor 5.
    //Elevator 1 is at floor 10, and Elevator 2 is at floor 6.
    //Elevator 2 will be sent.
    //An individial is on floor 9, going down to floor 2.
    //Elevator 1 is at floor 10, and Elevator 2 is at floor 5.
    //Elevator 1 will be sent.
    let column = new Column(1, 'online', 2, 10);

    column.elevatorsList[0].currentFloor = 10
    column.elevatorsList[1].currentFloor = 3

    let elevator = column.requestElevator(1, 'up')
    elevator.requestFloor(6)

    console.log('')
    console.log('')

    elevator = column.requestElevator(3, 'up')
    elevator.requestFloor(5)

    console.log('')
    console.log('')

    elevator = column.requestElevator(9, 'down')
    elevator.requestFloor(2)
}

//Defining scenario 3
function scenario3() {
    //In scenario 2, an individual is on floor 3, going down to floor 2.
    //Elevator 1 is at floor 10, and Elevator 2 is moving from floor 3 to 6.
    //Elevator 1 will be sent.
    //An individial is on floor 10, going down to floor 3.
    //Elevator 1 is at floor 10, and Elevator 2 is at floor 6.
    //Elevator 2 will be sent.
    let column = new Column(1, 'online', 2, 10)

    column.elevatorsList[0].currentFloor = 10
    column.elevatorsList[1].currentFloor = 3
    column.elevatorsList[1].status = 'moving'
    column.elevatorsList[1].direction = 'up'

    let elevator = column.requestElevator(3, 'down')
    elevator.requestFloor(2)

    console.log('')
    console.log('')

    column.elevatorsList[1].currentFloor = 6
    column.elevatorsList[1].status = 'idle'
    column.elevatorsList[1].direction = 'null'

    elevator = column.requestElevator(10, 'down')
    elevator.requestFloor(3)
}

//Uncomment to run scenario 1
scenario1()

//Uncomment to run scenario 2
//scenario2()

//Uncomment to run scenario 3
//scenario3()

module.exports = {Column, Elevator, CallButton, FloorRequestButton, Door}