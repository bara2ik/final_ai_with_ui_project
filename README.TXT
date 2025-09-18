MAKE SURE TO RUN training.py WHICH IS IN THE BACKEND FOLDER FIRST TO GENERATE THE DATASET AND THE AI MODEL.
IN ORDER TO RUN THE APP , YOULL NEED TO KNOW YOUR IP ADDRESS FROM YOUR CMD. WRITE YOUR IP ADDRESS IN THE FILE CALLED APP.JSX .
TO FIND THE FILE : my-app -> src ->  App.jsx . 
SEARCH FOR A COMMAND CALLED FETCH(......) ,LOOKS LIKE THIS :  const response = await fetch("http://X.X.X.X:8000/predict").
JUST CHNAGE THE Xs INTO YOUR IP ADDRESS 


to run write : 
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
npm run dev -- --host (your ip address)