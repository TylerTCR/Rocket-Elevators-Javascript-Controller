# Rocket-Elevators-Javascript-Controller

This is Tyler's Rocket Elevators' Residential Controller coded in JavaScript.

A brief run-down on how the controller works; First, the user calls the elevator and will pick the best elevator to send.
Once picked, it will come to the user and allow them to get in and choose the floor they want to go to. When a floor is
chosen, it will add the floor they picked to a floor request list for that specific elevator. Finally, the elevator will
take them to that floor.

To test this controller with scenarios, make sure you have Node JS and npm installed.
Then run the following in your editor's terminal:

`npm install`

Now we can test it by running:

`npm test`