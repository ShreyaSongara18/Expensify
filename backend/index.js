const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const connectDb = require('../backend/db/db');
const userRouter = require('./router/userRouter')
const expenseRouter = require('./router/expenseRouter')
const budgetRouter = require('./router/budgetRouter')
const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth',userRouter)
app.use('/expenses',expenseRouter)
app.use('/budget', budgetRouter)
connectDb();

const port = process.env.PORT || 4000 ;
app.listen(port , ()=>{
        console.log(`Server on :- ${port}`);
})