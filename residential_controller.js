class CallButton {
    constructor(_id, _floor, _direction) {
        this.ID = _id;
        this.status = "off";
        this.floor = _floor;
        this.direction = _direction;
    }
}

class FloorRequestButton {
    constructor(_id, _floor) {
        this.ID = _id;
        this.status = "off";
        this.floor = _floor;
    }
}

class Door {
    constructor(_id, _status) {
        this.ID = _id;
        this.status = _status;
    }
}

class Elevator {
    constructor(_id, _amountOfFloors) {
        this.ID = _id;
        this.amountOfFloors = _amountOfFloors;
        this.status = "idle"; 
        this.currentFloor = 1;
        this.direction = null;
        this.door = new Door(_id, "closed");
        this.floorRequestList = [];
        this.floorRequestButtonList = [];

        this.createFloorRequestButtons(this.amountOfFloors);
    }

    /** Create the floor request buttons
    */
    createFloorRequestButtons(_amountOfFloors) {
        let buttonFloor = 1;
        let buttonId = 1;

        for (let i = 0; i < _amountOfFloors; i++) {
            let floorRequestButton = new FloorRequestButton(buttonId, buttonFloor);
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
        this.door.status = "opened";
    }

    move() {
        while (this.floorRequestList.length !== 0) {
            this.floorRequestList.forEach(element => {
                // If the elevator's current floor is lower than requested floor
                if (this.currentFloor < element) {
                    this.direction = "up";
                    this.sortFloorList();
                    if (this.door.status === "opened") {this.door.status = "closed";}
                    this.status = "moving";

                    // Move the elevator until it gets to requested floor
                    while (this.currentFloor < element) {
                        this.currentFloor++;
                    }

                    this.status = "stopped";
                // If the elevator's current floor is higher than requested floor
                } else if (this.currentFloor > element) {
                    this.direction = "down";
                    this.sortFloorList();
                    if (this.door.status === "opened") {this.door.status = "closed";}
                    this.status = "moving";

                    // Move the elevator until it gets to requested floor
                    while (this.currentFloor > element) {
                        this.currentFloor--;

                    }

                    this.status = "stopped";
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

class Column {
    constructor(_id, _amountOfFloors, _amountOfElevators) {
        this.ID = _id;
        this.status = "online";
        this.numOfFloors = _amountOfFloors;
        this.numOfElevators = _amountOfElevators;
        this.elevatorList = [];
        this.callButtonList = [];

        this.fillElevatorList(this.numOfElevators, this.numOfFloors);
        this.fillCallButtonList(this.numOfFloors);
    };

    // Filling the array of elevators for each column by creating elevator objects
    fillElevatorList(numOfElevators, numOfFloors) {
        let eleId = 1;
        for (let i = 0; i < numOfElevators; i++) {
            let elevator = new Elevator(eleId, numOfFloors);
            this.elevatorList.push(elevator);
            eleId++;
        }
    }

    // Filling the array of call buttons for each column by creating call button objects
    fillCallButtonList(numOfFloors) {
        let buttonId = 1
        let floor = 1;
        for (let i = 0; i < numOfFloors; i++) {
            if (floor === 1) {this.callButtonList.push(new CallButton(buttonId, floor, "up"));}
            else if (floor < numOfFloors && floor !== 1) {
                this.callButtonList.push(new CallButton(buttonId, floor, "up"));
                buttonId++;
                this.callButtonList.push(new CallButton(buttonId, floor, "down"));
            }
            else {this.callButtonList.push(new CallButton(buttonId, floor, "down"));}
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
        let chosenElevator = this.findBestElevator(requestedFloor, direction);
        chosenElevator.floorRequestList.push(requestedFloor);
        chosenElevator.move();
        chosenElevator.door.status = "opened";
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
            if (requestedFloor === elev.currentFloor && elev.status === "stopped" && requestedDirection === elev.direction)
                bestElevatorInformation = this.checkIfElevatorIsBetter(1, elev, bestScore, referenceGap, bestElevator, requestedFloor);
            // Elevator is currently higher than the floor requested, it's going down, the user wants to go down
            else if (elev.currentFloor > requestedFloor && elev.direction === "down" && requestedDirection === elev.direction)
                bestElevatorInformation = this.checkIfElevatorIsBetter(2, elev, bestScore, referenceGap, bestElevator, requestedFloor);
            // Elevator is currently lower than the floor requested, it's going up, and the user want to go up
            else if (elev.currentFloor < requestedFloor && elev.direction === "up" && requestedDirection === elev.direction)
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

    // Used by findBestElevator to check if the current one in the list is better than the previous bestElevator
    checkIfElevatorIsBetter(scoreToCheck, newElevator, bestScore, referenceGap, bestElevator, floor) {
        if (scoreToCheck < bestScore) {
            bestScore = scoreToCheck;
            bestElevator = newElevator;
            referenceGap = Math.abs((newElevator.currentFloor - floor));
        } else if (bestScore === scoreToCheck) {
            let gap = Math.abs((newElevator.currentFloor - floor));
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

module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door }