class Column {
    constructor(_id, _status, _amountOfFloors, _amountOfElevators) {
        let id = _id, status = _status, numOfFloors = _amountOfFloors, numOfElevators = _amountOfElevators;
        let elevatorList = [], callButtonList = [];

        fillElevatorList(numOfElevators, numOfFloors);
        fillCallButtonList(numOfFloors)
    };

    // Filling the array of elevators for each column by creating elevator objects
    fillElevatorList(numOfElevators, numOfFloors) {
        let eleId = 1;
        for (let i = 0; i < numOfElevators; i++) {
            let elevator = new Elevator(eleId, "idle", numOfFloors, 1);
            this.elevatorList.push(elevator);
            eleId++;
        }
    }

    // Filling the array of call buttons for each column by creating call button objects
    fillCallButtonList(numOfFloors) {
        let buttonId = 1
        let floor = 1;
        for (let i = 0; i < numOfFloors; i++) {
            if (floor === 1) {this.callButtonList.push(new CallButton(buttonId, "on", floor, "up"));}
            else if (floor < numOfFloors && floor !== 1) {
                this.callButtonList.push(new CallButton(buttonId, "on", floor, "up"));
                buttonId++;
                this.callButtonList.push(new CallButton(buttonId, "on", floor, "down"));
            }
            else {this.callButtonList.push(new CallButton(buttonId, "on", floor, "down"));}
            buttonId++;
            floor++;
        }
    }

    /** Executes when a call button is pressed.
        - Find best elevator
        - Move elevator
        - Open doors
        @returns chosen elevator
    */
    requestElevator(requestedFloor, direction) {
        let chosenElevator = findBestElevator(requestedFloor, direction);
        chosenElevator.floorRequestList.push(requestedFloor);
        chosenElevator.Door.status = "opened";
        return chosenElevator;
    }

    /** Find the best elevator to use 
     * @param requestedFloor 
     * @param requestedDirection 
     * @returns the best elevator
     */
    findBestElevator(requestedFloor, requestedDirection) {
        let bestElevator;
        let bestScore = 100;
        let referenceGap = 10000;
        let bestElevatorInformation;
    
        this.elevatorList.forEach(elev => {
            // Elevator is currently at the floor requested, it's stopped, and going in the direction requested
            if (requestedFloor === elev.cFloor && elev.status === "stopped" && elev.direction === requestedDirection)
                bestElevatorInformation = this.checkIfElevatorIsBetter(1, elev, bestScore, referenceGap, bestElevator, requestedFloor);
            // Elevator is currently higher than the floor requested and it's already moving in the direction the user is at
            else if (elev.cFloor > requestedFloor && elev.status === "moving" && elev.direction === requestedDirection)
                bestElevatorInformation = this.checkIfElevatorIsBetter(2, elev, bestScore, referenceGap, bestElevator, requestedFloor);
            // Elevator is currently lower than the floor requested and it's already moving in the direction the user is at
            else if (elev.cFloor < requestedFloor && elev.status === "moving" && elev.direction === requestedDirection)
                bestElevatorInformation = this.checkIfElevatorIsBetter(2, elev, bestScore, referenceGap, bestElevator, requestedFloor);
            // Elevator is idle
            else if (elev.status === "idle")
                bestElevatorInformation = this.checkIfElevatorIsBetter(3, elev, bestScore, referenceGap, bestElevator, requestedFloor);
            // No other elevator currently available
            else {
                bestElevatorInformation = this.checkIfElevatorIsBetter(4, elev, bestScore, referenceGap, bestElevator, requestedFloor);
            }

            bestElevator = bestElevatorInformation.bestElevator;
            bestScore = bestElevatorInformation.bestScore;
            referenceGap = bestElevatorInformation.referenceGap;
        });

        return bestElevator;
    }

    checkIfElevatorIsBetter(scoreToCheck, newElevator, bestScore, referenceGap, bestElevator, floor) {
        if (scoreToCheck < bestScore) {
            bestScore = scoreToCheck;
            bestElevator = newElevator;
            referenceGap = Math.abs((newElevator.cFloor - floor));
        } else if (bestScore === scoreToCheck) {
            let gap = Math.abs((newElevator.cFloor - floor));
            if (referenceGap > gap) {
                bestElevator = newElevator;
                referenceGap = gap;
            }
        }

        return {
            bestElevator: bestElevator, 
            bestScore: bestScore, 
            referenceGap: referenceGap
        };
    }
}

class Elevator {
    constructor(_id, _status, _amountOfFloors, _currentFloor) {
        let elevId = _id, status = _status, cFloor = _currentFloor;
        let direction = null, door = new Door(_id, "closed");
        let floorRequestList = [];
        let floorRequestButtonList = [];
    }

    /** Create the floor request buttons
    */
    createFloorRequestButtons(_amountOfFloors) {
        let buttonFloor = 1;
        let buttonId = 1;

        for (let i = 0; i < _amountOfFloors; i++) {
            let floorRequestButton = new FloorRequestButton(buttonId, "off", buttonFloor);
            this.floorRequestButtonList.push(floorRequestButton);
            buttonFloor++;
            buttonId++;
        }
    }

    /** Executes when floor request button is pressed
        - Add the floor request to the list
        - Move elevator to requested floor
    */
    requestFloor(requestedFloor) {
        this.floorRequestList.push(requestedFloor);
        this.move();
    }

    move() {
        while (this.floorRequestList.length !== 0) {
            this.floorRequestList.forEach(element => {
                // If the elevator's current floor is lower than requested floor
                if (this.cFloor < element) {
                    this.direction = "up";
                    if (this.Door.status === "opened") {this.Door.status = "closed";}
                    this.status = "moving";

                    // Move the elevator until it gets to requested floor
                    while (this.cFloor < element) {
                        this.cFloor++;
                    }

                    this.status = "stopped";
                    this.Door.status = "opened";
                    this.Door.status = "closed";
                // If the elevator's current floor is higher than requested floor
                } else if (this.cFloor > element) {
                    this.direction = "down";
                    if (this.Door.status === "opened") {this.Door.status = "closed";}
                    this.status = "moving";

                    // Move the elevator until it gets to requested floor
                    while (this.cFloor < element) {
                        this.cFloor++;
                    }

                    this.status = "stopped";
                    this.Door.status = "opened";
                    this.Door.status = "closed";
                }
                // Remove the floor since it's been reached
                this.floorRequestList.shift();
            });
        }

        this.status = "idle";
    }
    
    sortFloorList() {
        if (this.direction === "up")
            this.floorRequestList.sort()
        else {
            this.floorRequestList.sort();
            this.floorRequestList.reverse();
        }
    }
}

class CallButton {
    constructor(_id, _status, _floor, _direction) {
        let id = _id, status = _status, floor = _floor, direction = _direction;
    }
}

class FloorRequestButton {
    constructor(_id, _status, _floor) {
        let id = _id, status = _status, floor = _floor;
    }
}

class Door {
    constructor(_id, _status) {
        let id = _id, status = _status;
    }
}

module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door }